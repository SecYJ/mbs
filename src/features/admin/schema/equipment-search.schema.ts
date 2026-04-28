import { z } from "zod";

export const equipmentSearchSchema = z.object({
    q: z.string().optional().catch(undefined),
    sort: z.enum(["name", "brand", "price"]).optional().catch(undefined),
    dir: z.enum(["asc", "desc"]).optional().catch(undefined),
    expanded: z.string().optional().catch(undefined),
});

export const equipmentSearchDefaults: z.infer<typeof equipmentSearchSchema> = {
    q: undefined,
    sort: undefined,
    dir: undefined,
    expanded: undefined,
};
