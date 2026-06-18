import { z } from "zod";

export const roomsSearchSchema = z.object({
    q: z.string().trim().optional().catch(undefined),
    status: z.enum(["all", "available", "disabled"]).catch("all").optional(),
    sort: z
        .enum(["recent", "name-asc", "name-desc", "capacity-desc", "capacity-asc", "duration-desc", "duration-asc"])
        .catch("recent")
        .optional(),
    view: z.enum(["grid", "list"]).catch("grid").optional(),
});

export const roomsSearchDefaults: z.infer<typeof roomsSearchSchema> = {
    q: undefined,
    status: "all",
    sort: "recent",
    view: "grid",
};

export type RoomsSearch = z.infer<typeof roomsSearchSchema>;
