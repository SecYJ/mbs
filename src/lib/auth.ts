import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { sql } from "drizzle-orm";
import { Resend } from "resend";

import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import {
    RESET_PASSWORD_TOKEN_EXPIRES_IN_MINUTES,
    RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
} from "@/constants/password-reset";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromAddress = process.env.RESEND_FROM_EMAIL ?? "Meridian <onboarding@resend.dev>";

const reconcileRegisteredUserRoles = async () => {
    await db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext('meridian:user-role-reconciliation'))`);

        await tx.execute(sql`
            with existing_super_admin as (
                select "id"
                from ${userTable}
                where "role" = 'super_admin'
                order by "created_at" asc, "id" asc
                limit 1
            ),
            first_user as (
                select "id"
                from ${userTable}
                order by "created_at" asc, "id" asc
                limit 1
            ),
            selected_user as (
                select "id"
                from existing_super_admin
                union all
                select "id"
                from first_user
                where not exists (select 1 from existing_super_admin)
                limit 1
            )
            update ${userTable}
            set
                "role" = case
                    when "id" = (select "id" from selected_user) then 'super_admin'::user_role
                    else 'user'::user_role
                end,
                "updated_at" = now()
            where
                exists (select 1 from selected_user)
                and (
                    "role" = 'super_admin'
                    or "id" = (select "id" from selected_user)
                )
                and "role" is distinct from (
                    case
                        when "id" = (select "id" from selected_user) then 'super_admin'::user_role
                        else 'user'::user_role
                    end
                )
        `);
    });
};

const buildResetEmail = (resetUrl: string) => {
    const text = [
        "We received a request to re-key your Meridian suite.",
        "",
        `Open this link to set a new passphrase: ${resetUrl}`,
        "",
        `The link expires in ${RESET_PASSWORD_TOKEN_EXPIRES_IN_MINUTES} minutes. If you didn't request this, no further action is needed.`,
        "",
        "— Meridian",
    ].join("\n");

    const html = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:48px 24px;font-family:-apple-system,BlinkMacSystemFont,'Manrope','Segoe UI',sans-serif;">
            <tr>
                <td align="center">
                    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
                        <tr>
                            <td style="padding-bottom:32px;">
                                <span style="display:inline-block;border:1px solid #dcc4a0;width:36px;height:36px;line-height:36px;text-align:center;font-family:Georgia,serif;font-style:italic;color:#dcc4a0;font-size:18px;">M</span>
                                <span style="display:inline-block;margin-left:10px;color:#f0ebe0;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;font-weight:600;vertical-align:8px;">Meridian</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:8px;color:#dcc4a0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;font-weight:600;">
                                Recovery &middot; Re-key the suite
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:24px;">
                                <h1 style="margin:0;color:#f0ebe0;font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:32px;line-height:1.05;letter-spacing:-0.02em;">
                                    Mislaid the key.
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:32px;border-top:1px solid rgba(255,255,255,0.16);"></td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:24px;color:#a6a29a;font-size:14px;line-height:1.6;">
                                We received a request to re-key your Meridian suite. Use the link below to choose a new passphrase &mdash; it&rsquo;s valid for the next ${RESET_PASSWORD_TOKEN_EXPIRES_IN_MINUTES} minutes.
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:32px;">
                                <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#f0ebe0;color:#000000;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;font-weight:600;">
                                    Reissue passphrase
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:8px;color:#6f6f6b;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">
                                Or open in a browser
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom:40px;color:#a6a29a;font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:12px;word-break:break-all;line-height:1.5;">
                                ${resetUrl}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);color:#6f6f6b;font-size:11px;line-height:1.6;">
                                If you didn&rsquo;t request a recovery link, you can disregard this email &mdash; nothing has changed.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;

    return { text, html };
};

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "user",
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (newUser) => ({
                    data: {
                        ...newUser,
                        role: "user",
                    },
                }),
                after: async () => {
                    await reconcileRegisteredUserRoles();
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            if (!resend) {
                console.warn(
                    `[auth] RESEND_API_KEY not set — printing reset URL for ${user.email} instead of dispatching.\n  ${url}`,
                );
                return;
            }

            const { text, html } = buildResetEmail(url);

            const result = await resend.emails.send({
                from: fromAddress,
                to: user.email,
                subject: "Re-key your Meridian suite",
                text,
                html,
            });

            if (result.error) {
                console.error(`[auth] Resend rejected reset email for ${user.email}:`, result.error);
                console.error(`[auth] Reset URL (open manually): ${url}`);
                return;
            }

            console.info(`[auth] Reset email dispatched to ${user.email} (id=${result.data?.id})`);
        },
    },
    rateLimit: {
        enabled: true,
        storage: "database",
    },
    plugins: [tanstackStartCookies()],
});
