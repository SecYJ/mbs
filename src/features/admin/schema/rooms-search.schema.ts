import { z } from "zod";

const searchTextSchema = z
    .union([z.string(), z.number()])
    .optional()
    .catch(undefined)
    .transform((value) => (value === undefined ? "" : String(value)));

export const roomsSearchSchema = z.object({
    q: searchTextSchema,
    status: z
        .enum(["all", "available", "disabled"])
        .optional()
        .catch(undefined)
        .transform((value) => value ?? "all"),
    sort: z
        .enum(["recent", "name-asc", "name-desc", "capacity-desc", "capacity-asc", "duration-desc", "duration-asc"])
        .optional()
        .catch("recent"),
    view: z.enum(["grid", "list"]).optional().catch("grid"),
    selected: z.string().optional().catch(undefined),
});

export const roomsSearchDefaults: z.infer<typeof roomsSearchSchema> = {
    q: "",
    status: "all",
    sort: "recent",
    view: "grid",
    selected: undefined,
};

export type RoomsSearch = z.infer<typeof roomsSearchSchema>;
