import { eq, inArray } from "drizzle-orm";

import type { Database } from "@/db/server";
import { attendees, user } from "@/db/schema";

type BookingUser = {
    id: string;
    name: string;
    email: string;
    status: "pending" | "accepted" | "declined";
};

export const getAttendeesByBooking = async (database: Database, bookingIds: string[]) => {
    const attendeeRows =
        bookingIds.length === 0
            ? []
            : await database
                  .select({
                      bookingId: attendees.bookingId,
                      attendee: {
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          status: attendees.status,
                      },
                  })
                  .from(attendees)
                  .innerJoin(user, eq(user.id, attendees.userId))
                  .where(inArray(attendees.bookingId, bookingIds));

    const attendeesByBooking = new Map<string, BookingUser[]>();
    for (const row of attendeeRows) {
        const existing = attendeesByBooking.get(row.bookingId) ?? [];
        existing.push(row.attendee);
        attendeesByBooking.set(row.bookingId, existing);
    }

    return attendeesByBooking;
};
