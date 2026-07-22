import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { useDeferredValue } from "react";

import { BookingRow } from "@/features/my-bookings/components/BookingRow";
import { MY_BOOKING_SECTION_META } from "@/features/my-bookings/my-bookings.constants";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";

export const MyBookingsFilteredPage = () => {
    const { group, q } = useSearch({
        from: "/_bookings/my-bookings",
        select: (s) => ({ ...s, group: s.group ?? "upcoming" }),
    });

    const deferredQ = useDeferredValue(q);

    const {
        data: { currentUserId, currentUserRole, history: bookings },
    } = useSuspenseQuery({
        ...myBookingsQueries.list({ group, q: deferredQ }),
        select: (data) => ({
            ...data,
            history: data.history.map((booking) => ({
                ...booking,
                displayDate: format(new Date(booking.start), "EEE, MMM d, yyyy"),
                displayTime: `${format(new Date(booking.start), "HH:mm")} - ${format(new Date(booking.end), "HH:mm")}`,
            })),
        }),
    });

    const sectionMeta = MY_BOOKING_SECTION_META[group];

    return (
        <section className="border-y border-(--hairline) py-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="eyebrow text-(--gold)">{sectionMeta.title}</p>
                    <h2 className="display-italic mt-1 text-2xl leading-none font-normal text-(--bone)">
                        {sectionMeta.title}
                    </h2>
                    <p className="mt-2 text-sm text-(--bone-muted)">{sectionMeta.description}</p>
                </div>
                <span className="tabular-num text-[0.72rem] text-(--bone-dim)">
                    {bookings.length} booking{bookings.length === 1 ? "" : "s"}
                </span>
            </div>

            {bookings.length === 0 ? (
                <div className="flex min-h-28 items-center justify-center border border-dashed border-(--hairline) px-6 text-center text-sm text-(--bone-muted)">
                    Nothing in this group.
                </div>
            ) : (
                <div className="divide-y divide-(--hairline) border-y border-(--hairline)">
                    {bookings.map((booking) => (
                        <BookingRow
                            key={booking.id}
                            booking={booking}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
