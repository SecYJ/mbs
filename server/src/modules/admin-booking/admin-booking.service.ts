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
    return getAdminBookingCounts(new Date());
}

export async function cancelAdminBookingService(userId: string, userRole: string, input: CancelBookingInput) {
    return cancelBookingService(userId, userRole, input, true);
}
