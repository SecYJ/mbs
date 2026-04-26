import { createHash, randomUUID } from "node:crypto";

import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { rateLimit } from "@/db/schema";
import { auth } from "@/lib/auth";
import { forgotPasswordSchema } from "@/features/forgot-password/schema/forgot-password.schema";
import { RESET_PASSWORD_COOLDOWN_MS } from "@/constants/password-reset";

const RESET_PASSWORD_COOLDOWN_PREFIX = "password-reset-cooldown";

const getPasswordResetBaseUrl = () => process.env.SERVER_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:5173";

const hashRateLimitValue = (value: string) => createHash("sha256").update(value).digest("hex");

const getClientIp = (request: Request) => {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    return forwardedFor ?? request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip");
};

const getRateLimitKeys = (email: string, request: Request) => {
    const normalizedEmail = email.trim().toLowerCase();
    const clientIp = getClientIp(request);
    const keys = [`${RESET_PASSWORD_COOLDOWN_PREFIX}:email:${hashRateLimitValue(normalizedEmail)}`];

    if (clientIp) {
        keys.push(`${RESET_PASSWORD_COOLDOWN_PREFIX}:ip:${hashRateLimitValue(clientIp)}`);
    }

    return keys;
};

const enforcePasswordResetCooldown = async (email: string, request: Request) => {
    const keys = getRateLimitKeys(email, request);
    const now = Date.now();
    const windowStart = now - RESET_PASSWORD_COOLDOWN_MS;

    // Share better-auth's rateLimit table, with app-owned prefixed keys for password-reset email/IP cooldowns.
    await db.transaction(async (tx) => {
        for (const key of keys) {
            const claimed = await tx
                .insert(rateLimit)
                .values({ id: randomUUID(), key, count: 1, lastRequest: now })
                .onConflictDoUpdate({
                    target: rateLimit.key,
                    set: { count: 1, lastRequest: now },
                    where: sql`${rateLimit.lastRequest} < ${windowStart}`,
                })
                .returning({ key: rateLimit.key });

            if (claimed.length === 0) {
                throw new Error("Please wait before requesting another recovery link.");
            }
        }
    });
};

const createPasswordResetRequest = (email: string, sourceRequest: Request) => {
    const baseUrl = getPasswordResetBaseUrl();
    const endpointUrl = new URL("/api/auth/request-password-reset", baseUrl);
    const headers = new Headers(sourceRequest.headers);

    headers.delete("content-length");
    headers.delete("cookie");
    headers.set("accept", "application/json");
    headers.set("content-type", "application/json");
    headers.set("origin", new URL(baseUrl).origin);

    return new Request(endpointUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
            email,
            redirectTo: `${baseUrl}/reset-password`,
        }),
    });
};

const getPasswordResetErrorMessage = async (response: Response) => {
    try {
        const body = (await response.json()) as { message?: unknown };

        if (typeof body.message === "string") return body.message;
    } catch {}

    return "Unable to dispatch the recovery link. Please try again.";
};

export const requestPasswordResetFn = createServerFn({ method: "POST" })
    .inputValidator(forgotPasswordSchema)
    .handler(async ({ data }) => {
        const request = getRequest();

        await enforcePasswordResetCooldown(data.email, request);

        const response = await auth.handler(createPasswordResetRequest(data.email, request));

        if (!response.ok) {
            throw new Error(await getPasswordResetErrorMessage(response));
        }

        return { dispatched: true };
    });
