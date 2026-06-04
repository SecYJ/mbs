import { z } from "zod";

export const usersSearchDefaults = {
    q: undefined,
    sort: "name",
    dir: "asc",
} as const;

export const usersSearchSchema = z.object({
    q: z.string().optional().catch(usersSearchDefaults.q),
    sort: z.enum(["name", "email", "role", "lastLogin"]).catch(usersSearchDefaults.sort),
    dir: z.enum(["asc", "desc"]).catch(usersSearchDefaults.dir),
});

export type UsersSearch = z.infer<typeof usersSearchSchema>;
