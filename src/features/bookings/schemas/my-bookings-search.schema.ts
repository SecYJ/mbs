import { z } from "zod";

import { myBookingGroups, myBookingsSearchDefaults } from "@/features/bookings/my-bookings.constants";

export const myBookingsSearchSchema = z.object({
    group: z
        .enum(myBookingGroups)
        .optional()
        .catch(myBookingsSearchDefaults.group)
        .prefault(myBookingsSearchDefaults.group),
    q: z.string().catch(myBookingsSearchDefaults.q).prefault(myBookingsSearchDefaults.q),
    cancel: z.uuid().optional().catch(myBookingsSearchDefaults.cancel),
});
