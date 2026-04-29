import { z } from "zod";

export const usersSearchSchema = z.object({
    q: z.string().optional().catch(undefined),
    sort: z.enum(["name", "email", "role", "lastLogin"]).optional().catch(undefined),
    dir: z.enum(["asc", "desc"]).optional().catch(undefined),
});

export const usersSearchDefaults: z.infer<typeof usersSearchSchema> = {
    q: undefined,
    sort: undefined,
    dir: undefined,
};
