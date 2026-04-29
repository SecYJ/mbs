import { z } from "zod";

const searchTextSchema = z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined ? undefined : String(value)));

export const roomsSearchSchema = z.object({
    q: searchTextSchema.default("").catch(""),
    sort: z.enum(["name", "location", "capacity"]).optional().catch(undefined),
    dir: z.enum(["asc", "desc"]).optional().catch(undefined),
    expanded: z.string().optional().catch(undefined),
});

export const roomsSearchDefaults: z.infer<typeof roomsSearchSchema> = {
    q: "",
    sort: undefined,
    dir: undefined,
    expanded: undefined,
};
