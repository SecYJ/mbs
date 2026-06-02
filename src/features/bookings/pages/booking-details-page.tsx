import { CalendarDays, Check, CheckCircle2, Clock, Mail, MapPin, UserRound, Users, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { useBookingDetailsPage } from "@/features/bookings/hooks/useBookingDetailsPage";
import { cn } from "@/lib/utils";

export const BookingDetailsPage = () => {
    const {
        acceptInvite,
        attendees,
        attendanceStatus,
        booking,
        bookingDate,
        bookingDuration,
        bookingState,
        bookingTime,
        canRespond,
        cancellation,
        declineInvite,
        isOrganizer,
        isRsvpPending,
        organizer,
        pageLabel,
        responseCounts,
        room,
        roomSummary,
        rsvpError,
    } = useBookingDetailsPage();

    return (
        <div className="mx-auto w-full max-w-6xl space-y-7">
            <header className="grid gap-6 border-b border-(--hairline) pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="eyebrow eyebrow-gold">{pageLabel}</p>
                        <span
                            className={cn(
                                "inline-flex items-center border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase",
                                bookingState.className,
                            )}
                        >
                            {bookingState.label}
                        </span>
                    </div>
                    <h1 className="display-serif mt-3 text-4xl leading-none text-(--bone) md:text-5xl">
                        {booking.title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-(--bone-muted)">
                        {booking.description || "No description was added for this booking."}
                    </p>
                </div>

                {canRespond ? (
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div className="flex flex-wrap justify-end gap-3">
                            {attendanceStatus !== "accepted" ? (
                                <button
                                    type="button"
                                    onClick={acceptInvite}
                                    disabled={isRsvpPending}
                                    className="inline-flex min-h-12 cursor-pointer items-center gap-3 border border-(--bone) bg-(--bone) px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-black uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Check className="size-4" strokeWidth={1.7} />
                                    <span>{isRsvpPending ? "Saving" : "Accept"}</span>
                                </button>
                            ) : null}
                            {attendanceStatus !== "declined" ? (
                                <button
                                    type="button"
                                    onClick={declineInvite}
                                    disabled={isRsvpPending}
                                    className="inline-flex min-h-12 cursor-pointer items-center gap-3 border border-red-300/40 bg-red-500/10 px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-red-100 uppercase transition-all hover:border-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <XCircle className="size-4" strokeWidth={1.7} />
                                    <span>Decline</span>
                                </button>
                            ) : null}
                        </div>
                        <p className="text-xs text-(--bone-dim)">Your RSVP is {attendanceStatus ?? "pending"}.</p>
                        {rsvpError ? <p className="max-w-xs text-sm leading-5 text-red-100">{rsvpError}</p> : null}
                    </div>
                ) : null}
            </header>

            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="border-y border-(--hairline) py-1">
                    <DetailItem icon={<CalendarDays className="size-4" strokeWidth={1.4} />} label="Date">
                        <span>{bookingDate}</span>
                    </DetailItem>
                    <DetailItem icon={<Clock className="size-4" strokeWidth={1.4} />} label="Time">
                        <span className="tabular-num text-(--gold)">{bookingTime}</span>
                        <span className="ml-3 text-(--bone-muted)">{bookingDuration}</span>
                    </DetailItem>
                    <DetailItem icon={<MapPin className="size-4" strokeWidth={1.4} />} label="Room">
                        <span className="font-medium">{room.name}</span>
                        <span className="ml-2 text-(--bone-muted)">{roomSummary}</span>
                    </DetailItem>
                    {cancellation ? (
                        <DetailItem icon={<XCircle className="size-4" strokeWidth={1.4} />} label="Cancellation">
                            <span>{cancellation.summary}</span>
                            {cancellation.reason ? (
                                <p className="mt-1 text-(--bone-muted)">{cancellation.reason}</p>
                            ) : null}
                        </DetailItem>
                    ) : null}
                </section>

                <aside className="space-y-7">
                    <section className="border-y border-(--hairline) py-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="eyebrow eyebrow-gold">Responses</p>
                                <h2 className="mt-1 text-lg font-semibold text-(--bone)">Attendees</h2>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-(--bone-dim)">
                                <Users className="size-4" strokeWidth={1.4} />
                                <span className="tabular-num">
                                    {responseCounts.accepted}/{attendees.length}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 divide-x divide-(--hairline) border-y border-(--hairline) py-3">
                            <div className="px-3">
                                <p className="eyebrow">Accepted</p>
                                <p className="mt-1 text-xl text-(--signal)">{responseCounts.accepted}</p>
                            </div>
                            <div className="px-3">
                                <p className="eyebrow">Declined</p>
                                <p className="mt-1 text-xl text-red-100">{responseCounts.declined}</p>
                            </div>
                            <div className="px-3">
                                <p className="eyebrow">Pending</p>
                                <p className="mt-1 text-xl text-(--bone)">{responseCounts.pending}</p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <PersonRow
                                name={organizer.name}
                                email={organizer.email}
                                status="organizer"
                                current={isOrganizer}
                            />
                            {attendees.length === 0 ? (
                                <div className="border-t border-(--hairline) py-5 text-sm text-(--bone-muted)">
                                    No attendees were invited.
                                </div>
                            ) : (
                                attendees.map((attendee) => (
                                    <PersonRow
                                        key={attendee.id}
                                        name={attendee.name}
                                        email={attendee.email}
                                        status={attendee.status}
                                        current={attendee.current}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    <section className="border-y border-(--hairline) py-5">
                        <p className="eyebrow eyebrow-gold">Organizer</p>
                        <div className="mt-4 flex gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
                                <UserRound className="size-4" strokeWidth={1.4} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-(--bone)">{organizer.name}</p>
                                <p className="mt-1 inline-flex max-w-full items-center gap-2 truncate text-xs text-(--bone-muted)">
                                    <Mail className="size-3.5 shrink-0" strokeWidth={1.4} />
                                    <span className="truncate">{organizer.email}</span>
                                </p>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
    <div className="flex gap-3 border-t border-(--hairline) py-5 first:border-t-0 first:pt-0">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="eyebrow">{label}</p>
            <div className="mt-1 text-sm leading-6 text-(--bone)">{children}</div>
        </div>
    </div>
);

const personStatusMeta = {
    accepted: {
        label: "Accepted",
        className: "border-(--signal)/40 bg-(--signal)/10 text-(--signal)",
        icon: <CheckCircle2 className="size-3.5" strokeWidth={1.4} />,
    },
    pending: {
        label: "Pending",
        className: "border-(--hairline) bg-(--surface-02) text-(--bone-muted)",
        icon: <Clock className="size-3.5" strokeWidth={1.4} />,
    },
    declined: {
        label: "Declined",
        className: "border-red-300/40 bg-red-500/10 text-red-100",
        icon: <XCircle className="size-3.5" strokeWidth={1.4} />,
    },
    organizer: {
        label: "Organizer",
        className: "border-(--gold)/40 bg-(--gold-wash) text-(--gold)",
        icon: <UserRound className="size-3.5" strokeWidth={1.4} />,
    },
};

const PersonRow = ({
    name,
    email,
    status,
    current,
}: {
    name: string;
    email: string;
    status: keyof typeof personStatusMeta;
    current?: boolean;
}) => {
    const statusMeta = personStatusMeta[status];

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--hairline) py-4 first:border-t-0">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-(--bone)">
                    {name}
                    {current ? <span className="ml-2 text-xs font-normal text-(--bone-dim)">You</span> : null}
                </p>
                <p className="mt-1 truncate text-xs text-(--bone-muted)">{email}</p>
            </div>
            <span
                className={cn(
                    "inline-flex shrink-0 items-center gap-2 border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase",
                    statusMeta.className,
                )}
            >
                {statusMeta.icon}
                {statusMeta.label}
            </span>
        </div>
    );
};
