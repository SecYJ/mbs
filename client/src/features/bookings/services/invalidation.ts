import type { QueryClient } from "@tanstack/react-query";

import { adminBookingQueries } from "@/features/admin/services/bookings/queries";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";
import { notificationQueries } from "@/features/notifications/services/queries";

// Room changes can affect many bookings, so omit bookingId to refresh every detail.
export async function invalidateBookingQueries(client: QueryClient, bookingId?: string) {
    await Promise.all([
        client.invalidateQueries({ queryKey: bookingCalendarQueries.all() }),
        client.invalidateQueries(
            bookingId ? bookingCalendarQueries.detail(bookingId) : { queryKey: bookingCalendarQueries.details() },
        ),
        client.invalidateQueries({ queryKey: myBookingsQueries.all() }),
        client.invalidateQueries({ queryKey: adminBookingQueries.all() }),
        client.invalidateQueries({ queryKey: notificationQueries.all() }),
    ]);
}

export async function invalidateBookingAttendanceQueries(client: QueryClient, bookingId: string) {
    await Promise.all([
        client.invalidateQueries(bookingCalendarQueries.detail(bookingId)),
        client.invalidateQueries({ queryKey: myBookingsQueries.lists() }),
        client.invalidateQueries({ queryKey: notificationQueries.all() }),
    ]);
}
