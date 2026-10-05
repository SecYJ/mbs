import { MutationObserver, QueryClient, QueryObserver, type QueryKey } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { adminBookingQueries } from "@/features/admin/services/bookings/queries";
import {
    invalidateBookingAttendanceQueries,
    invalidateBookingQueries,
} from "@/features/bookings/services/invalidation";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";
import { notificationQueries } from "@/features/notifications/services/queries";

vi.mock("@/features/bookings/services/fns", () => ({
    getBookingCalendarDataFn: vi.fn(),
    getBookingCalendarEventsFn: vi.fn(),
    getBookingCalendarRoomCatalogFn: vi.fn(),
    getBookingCalendarRoomsFn: vi.fn(),
    getBookingDetailsFn: vi.fn(),
    getBookingRoomFn: vi.fn(),
    getCalendarSummaryFn: vi.fn(),
}));
vi.mock("@/features/admin/services/bookings/fns", () => ({
    getAdminBookingsFn: vi.fn(),
    getAdminBookingStatsFn: vi.fn(),
}));
vi.mock("@/features/my-bookings/services/fns", () => ({
    getMyBookingsDataFn: vi.fn(),
    getMyBookingsStatsFn: vi.fn(),
}));
vi.mock("@/features/notifications/services/fns", () => ({ getNotificationsFn: vi.fn() }));

const bookingId = "changed-booking";
const siblingDetailKey = bookingCalendarQueries.detail("other-booking").queryKey;
const filters = { capacity: 2, equipment: ["TV"], location: ["East"] };
const range = { rangeStart: "2099-01-02T00:00:00.000Z", rangeEnd: "2099-01-03T00:00:00.000Z" };
const calendarKeys: QueryKey[] = [
    bookingCalendarQueries.data().queryKey,
    bookingCalendarQueries.events({ ...range, filters }).queryKey,
    bookingCalendarQueries.events({ ...range, roomId: "room-id" }).queryKey,
    bookingCalendarQueries.events({ ...range, rangeEnd: "2099-01-04T00:00:00.000Z" }).queryKey,
    bookingCalendarQueries.rooms(filters).queryKey,
    bookingCalendarQueries.rooms({ capacity: 0, equipment: [], location: [] }).queryKey,
    bookingCalendarQueries.room("room-id").queryKey,
    bookingCalendarQueries.roomCatalog().queryKey,
    bookingCalendarQueries.summary().queryKey,
];
const myBookingListKeys: QueryKey[] = [
    myBookingsQueries.list().queryKey,
    myBookingsQueries.list({ group: "upcoming", q: "Planning" }).queryKey,
    myBookingsQueries.list({ group: "in-progress" }).queryKey,
    myBookingsQueries.list({ group: "past" }).queryKey,
];
const adminBookingKeys: QueryKey[] = [
    adminBookingQueries.list({ q: "", room: "all", status: "all" }).queryKey,
    adminBookingQueries.list({ q: "Planning", room: "Blue", status: "upcoming" }).queryKey,
    adminBookingQueries.list({ q: "", room: "all", status: "cancelled" }).queryKey,
    adminBookingQueries.stats().queryKey,
];
const notificationKeys: QueryKey[] = [notificationQueries.list().queryKey, notificationQueries.list("unread").queryKey];
const bookingKeys: QueryKey[] = [
    ...calendarKeys,
    bookingCalendarQueries.detail(bookingId).queryKey,
    ...myBookingListKeys,
    myBookingsQueries.stats().queryKey,
    ...adminBookingKeys,
    ...notificationKeys,
];
const unrelatedKey = ["unrelated-feature"];
let client: QueryClient;

beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    for (const queryKey of [...bookingKeys, siblingDetailKey, unrelatedKey]) {
        client.setQueryData(queryKey, { cached: true });
    }
});

afterEach(() => {
    client.clear();
});

describe("booking cache invalidation", () => {
    it("refreshes every calendar, history, admin filter/stat, and notification filter after a booking change", async () => {
        await invalidateBookingQueries(client, bookingId);

        for (const queryKey of bookingKeys) {
            expect(client.getQueryState(queryKey)?.isInvalidated, JSON.stringify(queryKey)).toBe(true);
        }
        expect(client.getQueryState(siblingDetailKey)?.isInvalidated).toBe(false);
        expect(client.getQueryState(unrelatedKey)?.isInvalidated).toBe(false);
    });

    it("also refreshes all booking details when a room change affects multiple bookings", async () => {
        await invalidateBookingQueries(client);

        for (const queryKey of [...bookingKeys, siblingDetailKey]) {
            expect(client.getQueryState(queryKey)?.isInvalidated, JSON.stringify(queryKey)).toBe(true);
        }
        expect(client.getQueryState(unrelatedKey)?.isInvalidated).toBe(false);
    });

    it("refreshes attendance and both notification filters without refetching unaffected counts and calendar data", async () => {
        await invalidateBookingAttendanceQueries(client, bookingId);

        for (const queryKey of [
            bookingCalendarQueries.detail(bookingId).queryKey,
            ...myBookingListKeys,
            ...notificationKeys,
        ]) {
            expect(client.getQueryState(queryKey)?.isInvalidated, JSON.stringify(queryKey)).toBe(true);
        }
        for (const queryKey of [
            ...calendarKeys,
            ...adminBookingKeys,
            myBookingsQueries.stats().queryKey,
            siblingDetailKey,
            unrelatedKey,
        ]) {
            expect(client.getQueryState(queryKey)?.isInvalidated, JSON.stringify(queryKey)).toBe(false);
        }
    });

    it("keeps a mutation pending until active queries finish refreshing", async () => {
        const summary = { bookingCount: 1, liveBookingCount: 0 };
        client.setQueryData(bookingCalendarQueries.summary().queryKey, summary);
        let finishRefresh!: (value: typeof summary) => void;
        const refresh = new Promise<typeof summary>((resolve) => {
            finishRefresh = resolve;
        });
        const queryFn = vi.fn(() => refresh);
        const observer = new QueryObserver(client, { ...bookingCalendarQueries.summary(), queryFn });
        const unsubscribe = observer.subscribe(() => {});
        const mutation = new MutationObserver(client, {
            mutationFn: async () => ({ id: bookingId }),
            onSuccess: (data, _variables, _onMutateResult, context) =>
                invalidateBookingQueries(context.client, data.id),
        });

        try {
            const completion = mutation.mutate();
            await vi.waitFor(() => expect(queryFn).toHaveBeenCalledOnce());
            expect(mutation.getCurrentResult().isPending).toBe(true);

            finishRefresh({ bookingCount: 2, liveBookingCount: 0 });
            await completion;

            expect(mutation.getCurrentResult().isSuccess).toBe(true);
            expect(client.getQueryData(bookingCalendarQueries.summary().queryKey)?.bookingCount).toBe(2);
        } finally {
            finishRefresh(summary);
            unsubscribe();
        }
    });
});
