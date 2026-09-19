import { findMyBookings, getMyBookingCounts, type MyBookingsInput } from "#app/modules/mybooking/mybooking.repo";

export async function getMyBookingsDataService(input: MyBookingsInput) {
    const history = await findMyBookings(input);

    return {
        currentUserId: input.userId,
        history: history.map((booking) => ({
            ...booking,
            start: booking.start.toISOString(),
            end: booking.end.toISOString(),
            cancelledAt: booking.cancelledAt?.toISOString() ?? null,
        })),
    };
}

export async function getMyBookingStatsService(userId: string) {
    const { activeBookingCount, ownedCount, totalCount } = await getMyBookingCounts(userId);

    return {
        activeCount: activeBookingCount,
        attendingCount: totalCount - ownedCount,
        ownedCount,
    };
}
