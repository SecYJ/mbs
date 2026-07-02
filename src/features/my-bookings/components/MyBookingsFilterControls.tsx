import { getRouteApi, Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";

import { MY_BOOKING_GROUP_OPTIONS } from "@/features/my-bookings/my-bookings.constants";
import { cn } from "@/lib/utils";

const Route = getRouteApi("/_bookings/my-bookings");

export const MyBookingsFilterControls = () => {
    const { group, q } = Route.useSearch({
        select: (s) => ({ ...s, group: s.group ?? "upcoming" }),
    });
    const navigate = Route.useNavigate();

    const updateSearchQuery = (query: string) => {
        navigate({
            search: (prev) => ({ ...prev, q: query }),
            replace: true,
        });
    };

    return (
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="flex min-h-12 items-center gap-3 border-b border-(--hairline) text-(--bone-muted) transition-colors focus-within:border-(--gold) focus-within:text-(--gold)">
                <Search className="size-4 shrink-0" strokeWidth={1.4} />
                <span className="sr-only">Search bookings</span>
                <input
                    aria-label="Search bookings"
                    value={q}
                    onChange={(event) => updateSearchQuery(event.target.value)}
                    placeholder="Search title, room, organizer, or attendee"
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm text-(--bone) outline-none placeholder:text-(--bone-faint)"
                />
                {q ? (
                    <button
                        type="button"
                        onClick={() => updateSearchQuery("")}
                        aria-label="Clear search"
                        className="flex size-8 cursor-pointer items-center justify-center text-(--bone-dim) transition-colors hover:text-(--bone)"
                    >
                        <X className="size-4" strokeWidth={1.4} />
                    </button>
                ) : null}
            </label>

            <div className="flex flex-wrap border border-(--hairline) p-1">
                {MY_BOOKING_GROUP_OPTIONS.map((option) => (
                    <Link
                        key={option.value}
                        to="/my-bookings"
                        search={(prev) => ({ ...prev, group: option.value })}
                        className={cn(
                            "border px-4 py-2 text-[0.66rem] font-semibold tracking-[0.24em] uppercase no-underline",
                            group === option.value
                                ? "border-(--hairline-strong) bg-(--surface-02) text-(--bone)"
                                : "border-transparent text-(--bone-dim) transition-colors hover:border-(--hairline) hover:text-(--bone)",
                        )}
                    >
                        {option.label}
                    </Link>
                ))}
            </div>
        </section>
    );
};
