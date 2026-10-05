import { memoryAdapter } from "better-auth/adapters/memory";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { createAuth } from "#app/lib/auth";

vi.hoisted(() => {
    process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
});
vi.mock("#app/env", () => ({
    env: {
        NODE_ENV: "test",
        SERVER_ORIGIN: "http://127.0.0.1:3000",
        CLIENT_ORIGIN: "https://client.test",
        API_VERSION: "v1",
    },
}));
// The module under test builds its default instance from the real database client.
vi.mock("#app/db/index", () => ({ db: {} }));

const password = "correct-horse-battery";
const auth = createAuth(memoryAdapter({ user: [], session: [], account: [], verification: [], rateLimit: [] }));

type Actor = { id: string; headers: Headers };

async function createAccount(name: string, role: string): Promise<Actor> {
    const context = await auth.$context;
    const email = `${name}@example.test`;
    const user = await context.internalAdapter.createUser({ email, name, role, emailVerified: true });

    await context.internalAdapter.linkAccount({
        accountId: user.id,
        providerId: "credential",
        password: await context.password.hash(password),
        userId: user.id,
    });

    const { headers } = await auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
    const cookie = headers
        .getSetCookie()
        .map((setCookie) => setCookie.split(";")[0])
        .join("; ");

    return { id: user.id, headers: new Headers({ cookie }) };
}

async function roleOf(actor: Actor) {
    const context = await auth.$context;
    const user = await context.internalAdapter.findUserById(actor.id);

    return (user as { role?: string } | null)?.role;
}

const forbidden = { statusCode: 403 };

let superAdmin: Actor;
let admin: Actor;
let otherAdmin: Actor;
let member: Actor;

beforeAll(async () => {
    [superAdmin, admin, otherAdmin, member] = await Promise.all([
        createAccount("super", "super_admin"),
        createAccount("admin", "admin"),
        createAccount("other-admin", "admin"),
        createAccount("member", "user"),
    ]);
});

describe("admin cannot manage admins", () => {
    it("cannot make itself or anyone else a super admin", async () => {
        for (const target of [admin, otherAdmin, member]) {
            await expect(
                auth.api.setRole({ headers: admin.headers, body: { userId: target.id, role: "super_admin" } }),
            ).rejects.toMatchObject(forbidden);
        }
        expect(await roleOf(admin)).toBe("admin");
    });

    it("cannot grant or revoke the admin role", async () => {
        await expect(
            auth.api.setRole({ headers: admin.headers, body: { userId: member.id, role: "admin" } }),
        ).rejects.toMatchObject({ ...forbidden, body: { code: "ACCOUNT_NOT_MANAGEABLE" } });
        await expect(
            auth.api.setRole({ headers: admin.headers, body: { userId: otherAdmin.id, role: "user" } }),
        ).rejects.toMatchObject({ ...forbidden, body: { code: "ACCOUNT_NOT_MANAGEABLE" } });
        // A list of roles is stored as "admin,user", so it must not bypass the role check.
        await expect(
            auth.api.setRole({ headers: admin.headers, body: { userId: member.id, role: ["admin", "user"] } }),
        ).rejects.toMatchObject(forbidden);
        expect(await roleOf(member)).toBe("user");
        expect(await roleOf(otherAdmin)).toBe("admin");
    });

    it("cannot create admins or super admins, but can create users", async () => {
        for (const role of ["admin", "super_admin"] as const) {
            await expect(
                auth.api.createUser({
                    headers: admin.headers,
                    body: { email: `${role}@example.test`, password, name: role, role },
                }),
            ).rejects.toMatchObject({ ...forbidden, body: { code: "ACCOUNT_NOT_MANAGEABLE" } });
        }

        const created = await auth.api.createUser({
            headers: admin.headers,
            body: { email: "new-user@example.test", password, name: "New", role: "user" },
        });

        expect(created.user.role).toBe("user");
    });

    it("cannot reset passwords, ban, or revoke sessions of admins and super admins", async () => {
        for (const target of [otherAdmin, superAdmin]) {
            await expect(
                auth.api.setUserPassword({
                    headers: admin.headers,
                    body: { userId: target.id, newPassword: "a-new-password-1" },
                }),
            ).rejects.toMatchObject(forbidden);
            await expect(
                auth.api.banUser({ headers: admin.headers, body: { userId: target.id } }),
            ).rejects.toMatchObject(forbidden);
            await expect(
                auth.api.unbanUser({ headers: admin.headers, body: { userId: target.id } }),
            ).rejects.toMatchObject(forbidden);
            await expect(
                auth.api.revokeUserSessions({ headers: admin.headers, body: { userId: target.id } }),
            ).rejects.toMatchObject(forbidden);
        }
    });

    it("cannot revoke an admin's session by token", async () => {
        const context = await auth.$context;
        const session = await context.internalAdapter.createSession(otherAdmin.id);

        await expect(
            auth.api.revokeUserSession({ headers: admin.headers, body: { sessionToken: session.token } }),
        ).rejects.toMatchObject(forbidden);
        expect(await context.internalAdapter.findSession(session.token)).not.toBeNull();
    });

    it("can reset the password of, ban, and unban a plain user, and list all users", async () => {
        await auth.api.setUserPassword({
            headers: admin.headers,
            body: { userId: member.id, newPassword: "a-new-password-1" },
        });
        await auth.api.banUser({ headers: admin.headers, body: { userId: member.id } });
        await auth.api.unbanUser({ headers: admin.headers, body: { userId: member.id } });

        const { users } = await auth.api.listUsers({ headers: admin.headers, query: {} });

        expect(users.map((user) => user.role)).toEqual(expect.arrayContaining(["super_admin", "admin", "user"]));
    });

    it("cannot ban itself", async () => {
        await expect(auth.api.banUser({ headers: admin.headers, body: { userId: admin.id } })).rejects.toMatchObject(
            forbidden,
        );
    });
});

describe("super admin", () => {
    it("can grant and revoke admin and manage admin accounts", async () => {
        await auth.api.setRole({ headers: superAdmin.headers, body: { userId: member.id, role: "admin" } });
        expect(await roleOf(member)).toBe("admin");
        await auth.api.setRole({ headers: superAdmin.headers, body: { userId: member.id, role: "user" } });
        expect(await roleOf(member)).toBe("user");

        await auth.api.setUserPassword({
            headers: superAdmin.headers,
            body: { userId: otherAdmin.id, newPassword: "a-new-password-1" },
        });
        await auth.api.banUser({ headers: superAdmin.headers, body: { userId: otherAdmin.id } });
        await auth.api.unbanUser({ headers: superAdmin.headers, body: { userId: otherAdmin.id } });

        const created = await auth.api.createUser({
            headers: superAdmin.headers,
            body: { email: "made-admin@example.test", password, name: "Made", role: "admin" },
        });

        expect(created.user.role).toBe("admin");
    });

    it("cannot grant super admin, touch super admin accounts, or change itself", async () => {
        await expect(
            auth.api.setRole({ headers: superAdmin.headers, body: { userId: member.id, role: "super_admin" } }),
        ).rejects.toMatchObject(forbidden);
        await expect(
            auth.api.createUser({
                headers: superAdmin.headers,
                body: { email: "root@example.test", password, name: "Root", role: "super_admin" },
            }),
        ).rejects.toMatchObject(forbidden);
        await expect(
            auth.api.setRole({ headers: superAdmin.headers, body: { userId: superAdmin.id, role: "user" } }),
        ).rejects.toMatchObject(forbidden);
        await expect(
            auth.api.banUser({ headers: superAdmin.headers, body: { userId: superAdmin.id } }),
        ).rejects.toMatchObject(forbidden);
        expect(await roleOf(superAdmin)).toBe("super_admin");
    });
});

describe("unused and ordinary-user access", () => {
    it("lets an ordinary user do nothing on the admin endpoints", async () => {
        // Banning the shared member account earlier ended its sessions, so use a fresh account.
        const visitor = await createAccount("visitor", "user");

        await expect(
            auth.api.setRole({ headers: visitor.headers, body: { userId: visitor.id, role: "super_admin" } }),
        ).rejects.toMatchObject(forbidden);
        await expect(auth.api.listUsers({ headers: visitor.headers, query: {} })).rejects.toMatchObject(forbidden);
        expect(await roleOf(visitor)).toBe("user");
    });

    it("gives nobody permission to impersonate, remove, or update users", async () => {
        for (const actor of [admin, superAdmin]) {
            await expect(
                auth.api.impersonateUser({ headers: actor.headers, body: { userId: member.id } }),
            ).rejects.toMatchObject(forbidden);
            await expect(
                auth.api.removeUser({ headers: actor.headers, body: { userId: member.id } }),
            ).rejects.toMatchObject(forbidden);
            await expect(
                auth.api.adminUpdateUser({
                    headers: actor.headers,
                    body: { userId: member.id, data: { role: "admin" } },
                }),
            ).rejects.toMatchObject(forbidden);
        }
        expect(await roleOf(member)).toBe("user");
    });

    it("does not serve the disabled endpoints over HTTP", async () => {
        for (const path of ["impersonate-user", "remove-user", "update-user"]) {
            const response = await auth.handler(
                new Request(`http://127.0.0.1:3000/api/v1/auth/admin/${path}`, {
                    method: "POST",
                    headers: new Headers({
                        "content-type": "application/json",
                        origin: "https://client.test",
                        cookie: superAdmin.headers.get("cookie") ?? "",
                    }),
                    body: JSON.stringify({ userId: member.id }),
                }),
            );

            expect(response.status).toBe(404);
        }
    });
});

describe("password reset email", () => {
    it("points to the client reset page and carries the token as a query value", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

        await auth.api.requestPasswordReset({ body: { email: "member@example.test" } });

        const logged = String(warn.mock.calls.flat().join("\n"));
        const link = /https:\/\/client\.test\/reset-password\?token=\S+/.exec(logged)?.[0];

        expect(link).toBeDefined();
        expect(link).not.toContain("/api/");
        warn.mockRestore();
    });
});
