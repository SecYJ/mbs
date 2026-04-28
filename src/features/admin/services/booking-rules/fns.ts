import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bookingRules } from "@/db/schema";
import { updateBookingRulesSchema } from "@/features/admin/schema/booking-rules.schema";
import { requireAdminUser } from "@/lib/session";

const SINGLETON_ID = 1;

export const getBookingRulesFn = createServerFn({ method: "GET" }).handler(async () => {
    await requireAdminUser();

    const [existing] = await db.select().from(bookingRules).where(eq(bookingRules.id, SINGLETON_ID)).limit(1);
    if (existing) return existing;

    const [inserted] = await db
        .insert(bookingRules)
        .values({ id: SINGLETON_ID })
        .onConflictDoNothing({ target: bookingRules.id })
        .returning();
    if (inserted) return inserted;

    const [row] = await db.select().from(bookingRules).where(eq(bookingRules.id, SINGLETON_ID)).limit(1);
    if (!row) throw new Error("Failed to initialize booking rules");
    return row;
});

export const updateBookingRulesFn = createServerFn({ method: "POST" })
    .inputValidator(updateBookingRulesSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const [row] = await db
            .insert(bookingRules)
            .values({ id: SINGLETON_ID, ...data })
            .onConflictDoUpdate({
                target: bookingRules.id,
                set: { ...data, updatedAt: new Date() },
            })
            .returning();
        return row;
    });
