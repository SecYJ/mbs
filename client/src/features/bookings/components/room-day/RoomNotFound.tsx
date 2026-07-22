import { Link, linkOptions } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const returnLinks = linkOptions([
    { to: "/bookings", label: "Resume", destination: "The calendar", index: "I" },
    { to: "/my-bookings", label: "Review", destination: "My bookings", index: "II" },
]);

// Rendered inside the _bookings layout outlet (the nav bar persists), so this
// is a content-area panel rather than a full-screen takeover. Fires when the
// room route guard throws notFound() for a valid UUID with no room on record.
export const RoomNotFound = () => {
    return (
        <div className="mx-auto w-full max-w-4xl space-y-8">
            <Link
                to="/bookings"
                className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:text-(--bone)"
            >
                <ArrowLeft className="size-4" strokeWidth={1.4} />
                <span>Calendar</span>
            </Link>

            <section className="animate-fade-up animation-duration-700 border-y border-(--hairline) py-14">
                <div className="flex flex-wrap items-center gap-3">
                    <p className="eyebrow text-(--gold)">Errata &middot; Room</p>
                    <span className="inline-flex border border-(--hairline-strong) px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-(--bone-dim) uppercase">
                        Not on record
                    </span>
                </div>

                <h1 className="display-italic mt-4 text-[clamp(2.4rem,5vw,3.5rem)] leading-none font-normal text-(--bone)">
                    This room isn&rsquo;t in the ledger.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-(--bone-muted)">
                    The room you followed doesn&rsquo;t correspond to any space on record &mdash; it may have been
                    withdrawn, or the address mistyped. Any reservations you hold remain available from your bookings.
                </p>

                <nav aria-label="Return navigation" className="mt-10">
                    <p className="eyebrow mb-4">Step back to</p>
                    <ul className="divide-y divide-(--hairline) border-y border-(--hairline)">
                        {returnLinks.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to} className="group flex items-center gap-4 py-4 no-underline">
                                    <span className="tabular-num w-6 text-[0.62rem] tracking-[0.2em] text-(--bone-faint) transition-colors group-hover:text-(--gold)">
                                        {link.index}
                                    </span>
                                    <span className="eyebrow shrink-0 transition-colors group-hover:text-(--gold)">
                                        {link.label} &middot;
                                    </span>
                                    <span className="display-italic flex-1 text-[1.1rem] leading-none text-(--bone) transition-colors group-hover:text-(--gold)">
                                        {link.destination}
                                    </span>
                                    <ArrowUpRight
                                        className="size-4 text-(--bone-dim) transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--gold)"
                                        strokeWidth={1.4}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </section>
        </div>
    );
};
