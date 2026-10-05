import {
    findAdminBookingRoomNames,
    findAdminBookings,
    getAdminBookingCounts,
} from "#app/modules/admin-booking/admin-booking.repo";
import type { AdminBookingsFilter } from "#app/modules/admin-booking/admin-booking.schema";
import type { CancelBookingInput } from "#app/modules/booking/booking.schema";
import { cancelBookingService } from "#app/modules/booking/booking.service";

export async function getAdminBookingsService(userId: string, userRole: string, input: AdminBookingsFilter) {
    const rows = await findAdminBookings(input, new Date());
    const rooms = await findAdminBookingRoomNames();

    return {
        currentUserId: userId,
        currentUserRole: userRole,
        bookings: rows.map((booking) => ({
            ...booking,
            startTime: booking.startTime.toISOString(),
            endTime: booking.endTime.toISOString(),
        })),
        rooms,
    };
}

export async function getAdminBookingStatsService() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const weekStart = new Date(todayStart);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return getAdminBookingCounts(todayStart, tomorrowStart, weekStart, weekEnd);
}

export async function cancelAdminBookingService(userId: string, userRole: string, input: CancelBookingInput) {
    return cancelBookingService(userId, userRole, input, true);
}
