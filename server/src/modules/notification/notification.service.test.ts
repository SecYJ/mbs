import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    getNotificationCounts,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "#app/modules/notification/notification.repo";
import {
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
} from "#app/modules/notification/notification.service";

vi.mock("#app/modules/notification/notification.repo", () => ({
    getNotificationCounts: vi.fn(),
    getNotifications: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
    markNotificationAsRead: vi.fn(),
}));

beforeEach(() => {
    vi.resetAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("notification responses", () => {
    it("serializes dates while retaining the list shape and global counts for the unread filter", async () => {
        vi.mocked(getNotifications).mockResolvedValue([
            {
                id: "notification-1",
                bookingId: "booking-1",
                message: "Meeting updated",
                status: "unread",
                createdAt: new Date("2026-09-19T08:00:00+08:00"),
                booking: {
                    id: "booking-1",
                    title: "Planning",
                    startTime: new Date("2026-09-20T09:00:00+08:00"),
                    endTime: new Date("2026-09-20T10:00:00+08:00"),
                },
                room: { name: "Room A", location: "First floor" },
            },
        ]);
        vi.mocked(getNotificationCounts).mockResolvedValue({ totalCount: 5, unreadCount: 1 });

        await expect(getNotificationsService("user-1", "unread")).resolves.toEqual({
            items: [
                {
                    id: "notification-1",
                    bookingId: "booking-1",
                    message: "Meeting updated",
                    status: "unread",
                    createdAt: "2026-09-19T00:00:00.000Z",
                    booking: {
                        id: "booking-1",
                        title: "Planning",
                        startTime: "2026-09-20T01:00:00.000Z",
                        endTime: "2026-09-20T02:00:00.000Z",
                    },
                    room: { name: "Room A", location: "First floor" },
                },
            ],
            totalCount: 5,
            unreadCount: 1,
        });
        expect(getNotifications).toHaveBeenCalledWith("user-1", "unread");
        expect(getNotificationCounts).toHaveBeenCalledWith("user-1");
    });

    it("keeps absent booking and room null and preserves the legacy missing-date fallback", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-19T00:00:00.000Z"));
        vi.mocked(getNotifications).mockResolvedValue([
            {
                id: "notification-1",
                bookingId: null,
                message: "Booking removed",
                status: "read",
                createdAt: null,
                booking: null,
                room: null,
            },
        ]);
        vi.mocked(getNotificationCounts).mockResolvedValue({ totalCount: 1, unreadCount: 0 });

        const response = await getNotificationsService("user-1");

        expect(response.items[0]).toEqual({
            id: "notification-1",
            bookingId: null,
            message: "Booking removed",
            status: "read",
            createdAt: "2026-09-19T00:00:00.000Z",
            booking: null,
            room: null,
        });
    });

    it("returns an empty list and zero counts without inventing a notification", async () => {
        vi.mocked(getNotifications).mockResolvedValue([]);
        vi.mocked(getNotificationCounts).mockResolvedValue({ totalCount: 0, unreadCount: 0 });

        await expect(getNotificationsService("user-1")).resolves.toEqual({
            items: [],
            totalCount: 0,
            unreadCount: 0,
        });
    });

    it("propagates database failures to the existing error handler", async () => {
        const failure = new Error("Database unavailable");
        vi.mocked(getNotifications).mockRejectedValue(failure);
        vi.mocked(getNotificationCounts).mockResolvedValue({ totalCount: 0, unreadCount: 0 });

        await expect(getNotificationsService("user-1")).rejects.toBe(failure);
    });
});

describe("marking notifications as read", () => {
    it("passes the authenticated user to both operations and accepts no affected rows", async () => {
        await expect(markNotificationAsReadService("user-1", "notification-1")).resolves.toBeUndefined();
        await expect(markAllNotificationsAsReadService("user-1")).resolves.toBeUndefined();

        expect(markNotificationAsRead).toHaveBeenCalledWith("user-1", "notification-1");
        expect(markAllNotificationsAsRead).toHaveBeenCalledWith("user-1");
    });
});
