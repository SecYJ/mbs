import { z } from "zod";

export const roomsSearchSchema = z.object({
    q: z.string().trim().optional().catch(undefined),
    status: z.enum(["all", "available", "disabled"]).optional().catch("all"),
    sort: z
        .enum(["recent", "name-asc", "name-desc", "capacity-desc", "capacity-asc", "duration-desc", "duration-asc"])
        .optional()
        .catch("recent"),
    view: z.enum(["grid", "list"]).optional().catch("grid"),
});

export const roomsSearchDefaults: z.infer<typeof roomsSearchSchema> = {
    q: undefined,
    status: "all",
    sort: "recent",
    view: "grid",
};

export type RoomsSearch = z.infer<typeof roomsSearchSchema>;
