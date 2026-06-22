import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { ArrowRight, RotateCcw } from "lucide-react";

// Router-level fallback (router.tsx defaultErrorComponent): can render above any
// layout when a loader/render throws without a route-scoped errorComponent, so it
// is a self-contained full-screen takeover rather than a content-area panel.
export const DefaultError = ({ reset }: ErrorComponentProps) => {
    const router = useRouter();
    const year = new Date().getFullYear();

    // reset() clears the error boundary; invalidate() re-runs the failed
    // loaders so the retry actually refetches instead of replaying the error.
    const retry = () => {
        reset();
        router.invalidate();
    };

    return (
        <div className="relative flex min-h-dvh items-center bg-[#050505] text-(--bone)">
            {/* Film grain overlay — unique filter id per route per §6 */}
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 size-full opacity-[0.016]">
                <filter id="grain-error">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-error)" />
            </svg>

            <main className="relative mx-auto w-full max-w-2xl px-8 py-20 sm:px-12">
                {/* Monogram — matched with the app's sign-in and 404 voice */}
                <div className="mb-16 flex items-center gap-4 animate-fade-up animation-duration-700 [animation-delay:100ms]">
                    <div className="inline-flex size-11 items-center justify-center border border-(--gold)">
                        <span className="display-italic text-[1.35rem] leading-none text-(--gold)">M</span>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[0.78rem] font-semibold tracking-[0.24em] uppercase text-(--bone)">
                            Meridian
                        </span>
                        <span className="eyebrow mt-0.5">Est. {year}</span>
                    </div>
                </div>

                {/* Heading */}
                <div className="animate-fade-up animation-duration-800 [animation-delay:200ms]">
                    <p className="eyebrow text-(--gold)">Error &middot; Interrupted</p>
                    <h1 className="mt-3 display-italic text-[clamp(2.6rem,6vw,4rem)] leading-[0.95] tracking-[-0.02em] text-(--bone)">
                        The ledger
                        <br />
                        skipped a line.
                    </h1>
                    <p className="mt-5 max-w-[48ch] text-[0.9rem] leading-relaxed text-(--bone-muted)">
                        Something went wrong while binding this page. You can try the entry again, or step back onto the
                        ledger and pick up where you left off.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-10 flex flex-col gap-3 animate-fade-up animation-duration-800 [animation-delay:400ms] sm:flex-row">
                    <button
                        type="button"
                        onClick={retry}
                        className="group inline-flex h-12 flex-1 items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] text-black uppercase transition-all duration-300 hover:bg-white hover:tracking-[0.34em]"
                    >
                        <RotateCcw
                            className="size-4 transition-transform duration-500 group-hover:-rotate-180"
                            strokeWidth={1.6}
                        />
                        <span>Try again</span>
                    </button>
                    <Link
                        to="/bookings"
                        className="group inline-flex h-12 flex-1 items-center justify-center gap-3 border border-(--hairline-strong) text-[0.72rem] font-semibold tracking-[0.3em] text-(--bone-muted) uppercase no-underline transition-all duration-300 hover:border-(--bone) hover:text-(--bone)"
                    >
                        <span>Back to the ledger</span>
                        <ArrowRight
                            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                            strokeWidth={1.6}
                        />
                    </Link>
                </div>

                {/* Footer — tabular colophon matches login / 404 */}
                <div className="mt-16 flex items-center justify-between border-t border-(--hairline) pt-5 animate-fade-up animation-duration-700 [animation-delay:600ms]">
                    <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                        &copy; {year}
                    </span>
                    <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                        Meridian / Errata 500
                    </span>
                </div>
            </main>
        </div>
    );
};
