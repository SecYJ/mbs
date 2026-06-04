import { cn } from "@/lib/utils";

const roomTracks = [
    { id: "AUR", label: "Aurora", accentClassName: "bg-(--room-aurora)", delay: "0ms" },
    { id: "HOR", label: "Horizon", accentClassName: "bg-(--room-horizon)", delay: "140ms" },
    { id: "NIM", label: "Nimbus", accentClassName: "bg-(--room-nimbus)", delay: "280ms" },
    { id: "SUM", label: "Summit", accentClassName: "bg-(--room-summit)", delay: "420ms" },
    { id: "CAS", label: "Cascade", accentClassName: "bg-(--room-cascade)", delay: "560ms" },
] as const;

const timelineSlots = ["08", "10", "12", "14", "16", "18"] as const;

export const AppPending = () => {
    return (
        <main
            aria-label="Loading page"
            aria-live="polite"
            className="fixed inset-0 z-50 grid min-h-dvh place-items-center overflow-hidden bg-(--canvas) px-5 py-8 text-(--bone)"
        >
            <div className="absolute inset-0 opacity-70 pending-grid-backdrop" />
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-(--hairline)" />

            <section className="relative w-full max-w-5xl" aria-busy="true">
                <div className="mb-8 flex items-end justify-between gap-6 border-b border-(--hairline) pb-5">
                    <div className="min-w-0">
                        <p className="eyebrow eyebrow-gold">Meridian &middot; Hold</p>
                        <h1 className="display-italic mt-3 text-5xl leading-[0.9] text-(--bone) sm:text-7xl lg:text-8xl">
                            Preparing rooms
                        </h1>
                    </div>
                    <div className="hidden min-w-36 text-right sm:block">
                        <span className="tabular-num text-4xl leading-none text-(--signal)">00</span>
                        <p className="eyebrow mt-2">Queue</p>
                    </div>
                </div>

                <div className="relative overflow-hidden border-y border-(--hairline) bg-(--surface)">
                    <div className="pending-scan-line" />

                    <div className="grid grid-cols-[3.75rem_repeat(6,minmax(2.5rem,1fr))] border-b border-(--hairline) text-(--bone-dim) sm:grid-cols-[5.5rem_repeat(6,minmax(4rem,1fr))]">
                        <div className="border-r border-(--hairline) px-3 py-3 sm:px-4">
                            <span className="eyebrow">Room</span>
                        </div>
                        {timelineSlots.map((slot) => (
                            <div key={slot} className="border-r border-(--hairline) px-2 py-3 last:border-r-0 sm:px-4">
                                <span className="tabular-num text-[0.7rem]">{slot}:00</span>
                            </div>
                        ))}
                    </div>

                    <div className="divide-y divide-(--hairline)">
                        {roomTracks.map((room) => (
                            <div
                                key={room.id}
                                className="grid min-h-16 grid-cols-[3.75rem_1fr] sm:grid-cols-[5.5rem_1fr]"
                                style={{ animation: `fade-up 620ms cubic-bezier(0.16,1,0.3,1) ${room.delay} both` }}
                            >
                                <div className="flex flex-col justify-center border-r border-(--hairline) px-3 sm:px-4">
                                    <span className="tabular-num text-xs font-medium text-(--bone)">{room.id}</span>
                                    <span className="mt-1 hidden text-[0.66rem] text-(--bone-dim) sm:block">
                                        {room.label}
                                    </span>
                                </div>
                                <div className="relative grid grid-cols-6">
                                    {timelineSlots.map((slot) => (
                                        <span key={slot} className="border-r border-(--hairline) last:border-r-0" />
                                    ))}
                                    <span
                                        className={cn("pending-reservation-bar", room.accentClassName)}
                                        style={{ animationDelay: room.delay }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="h-px overflow-hidden bg-(--hairline)">
                        <div className="pending-progress h-full bg-(--gold)" />
                    </div>
                    <p className="eyebrow text-(--bone-dim)">Syncing availability</p>
                </div>
            </section>
        </main>
    );
};
