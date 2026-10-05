import { z } from "zod";

export const adminUsersQuerySchema = z.object({
    q: z.string().optional().catch(undefined),
    sort: z.enum(["name", "email", "role", "lastLogin"]).catch("name"),
    dir: z.enum(["asc", "desc"]).catch("asc"),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
