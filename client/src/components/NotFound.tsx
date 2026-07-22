import { Link, linkOptions } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const returnLinks = linkOptions([
    { to: "/notifications", label: "Review", destination: "Notifications", index: "I" },
    { to: "/my-bookings", label: "Resume", destination: "My bookings", index: "II" },
    { to: "/settings", label: "Adjust", destination: "Settings", index: "III" },
]);

export const NotFound = () => {
    const year = new Date().getFullYear();

    return (
        <div className="relative flex min-h-dvh bg-[#050505] text-(--bone)">
            {/* Film grain overlay — unique filter id per route per §6 */}
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
                <filter id="grain-not-found">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-not-found)" />
            </svg>

            {/* ════════════════════════════════════════════
			    EDITORIAL CANVAS — left 58%
			    The unbound folio. A page the ledger never
			    claimed — anchored by a hollow hairline
			    square where the folio mark should have been.
			════════════════════════════════════════════ */}
            <aside className="relative hidden overflow-hidden bg-[#050505] lg:flex lg:w-[58%]">
                {/* Margin rule — centered at 50%, standing in for the ledger's spine */}
                <div
                    aria-hidden
                    className="hairline-draw-in pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-(--hairline) [animation-delay:300ms]"
                />

                {/* Top-left: closing bracket + errata mark */}
                <div className="animate-fade-up animation-duration-700 absolute top-14 left-14 flex items-start gap-3 [animation-delay:100ms]">
                    <span className="font-['Fraunces'] text-[22px] leading-none text-(--gold)">&#9492;</span>
                    <span className="eyebrow mt-1 text-(--gold)">Errata &middot; Unbound Folio</span>
                </div>

                {/* Top-right: oversized appendix call-number */}
                <div className="animate-fade-up animation-duration-700 absolute top-12 right-14 flex flex-col items-end gap-2 [animation-delay:200ms]">
                    <span className="eyebrow">Appendix</span>
                    <span className="tabular-num text-[1.75rem] leading-none tracking-[0.12em] text-(--bone)">
                        404<span className="text-(--bone-dim)"> / &infin;</span>
                    </span>
                </div>

                {/* Editorial statement — anchored bottom */}
                <div className="relative z-10 mt-auto flex w-full flex-col px-20 pb-20">
                    <p className="eyebrow animate-fade-up animation-duration-800 mb-14 text-(--gold) [animation-delay:300ms]">
                        Meridian &middot; Folio Not Found
                    </p>

                    <h2 className="display-italic animate-fade-up animation-duration-900 text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-(--bone) [animation-delay:450ms]">
                        Not in
                        <br />
                        the ledger.
                    </h2>
                    <h2 className="display-italic animate-fade-up animation-duration-900 mt-4 pl-[18%] text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-(--bone-dim) [animation-delay:650ms]">
                        Nothing
                        <br />
                        reserved here.
                    </h2>

                    {/* Hairline rule below the statement */}
                    <div
                        aria-hidden
                        className="hairline-draw-in mt-14 h-px w-48 bg-(--hairline-strong) [animation-delay:900ms]"
                    />

                    <p className="animate-fade-up animation-duration-800 mt-6 max-w-[44ch] text-[0.88rem] leading-relaxed text-(--bone-muted) [animation-delay:1000ms]">
                        The page you sought was never bound into this edition &mdash; perhaps a mistyped address,
                        perhaps a folio since withdrawn. The ledger continues just beyond.
                    </p>
                </div>

                {/* Bottom-left: missing-folio stamp */}
                <div className="animate-fade-up animation-duration-700 absolute bottom-14 left-14 flex items-center gap-3 [animation-delay:900ms]">
                    <span className="eyebrow">Folio</span>
                    <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">
                        Missing &middot; {year}
                    </span>
                </div>

                {/* Bottom-right: the void frame — a hollow hairline square where
				    the folio mark would have been. Unique ornament to 404. */}
                <div className="animate-fade-up animation-duration-700 absolute right-14 bottom-14 flex items-center gap-4 [animation-delay:900ms]">
                    <span className="eyebrow">Mark</span>
                    <div
                        aria-hidden
                        className="inline-flex size-11 items-center justify-center border border-(--hairline-strong)"
                    >
                        <span className="display-italic text-[1.35rem] leading-none text-(--bone-faint)">&mdash;</span>
                    </div>
                </div>
            </aside>

            {/* ════════════════════════════════════════════
			    RETURN COLUMN — right 42%
			    A directory of ways back onto the ledger.
			════════════════════════════════════════════ */}
            <main className="relative flex w-full flex-col justify-center bg-[#050505] px-8 sm:px-14 lg:w-[42%] lg:px-16 xl:px-20">
                {/* Mobile: compact top ornament mirroring the canvas mark */}
                <div className="animate-fade-up animation-duration-700 absolute top-8 left-8 flex items-center gap-3 [animation-delay:100ms] lg:hidden">
                    <span className="font-['Fraunces'] text-[18px] leading-none text-(--gold)">&#9492;</span>
                    <span className="eyebrow text-(--gold)">Errata &middot; 404</span>
                </div>

                {/* Mobile: show the tabular 404 when the canvas is hidden */}
                <div className="animate-fade-up animation-duration-700 absolute top-8 right-8 flex flex-col items-end gap-1 [animation-delay:200ms] lg:hidden">
                    <span className="eyebrow">Appendix</span>
                    <span className="tabular-num text-[1.1rem] leading-none tracking-[0.12em] text-(--bone)">
                        404<span className="text-(--bone-dim)"> / &infin;</span>
                    </span>
                </div>

                <div className="relative mx-auto w-full max-w-100 py-20">
                    {/* Monogram — matched with the app's sign-in and register voice */}
                    <div className="animate-fade-up animation-duration-700 mb-16 flex items-center gap-4 [animation-delay:150ms]">
                        <div className="inline-flex size-11 items-center justify-center border border-(--gold)">
                            <span className="display-italic text-[1.35rem] leading-none text-(--gold)">M</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-[0.78rem] font-semibold tracking-[0.24em] text-(--bone) uppercase">
                                Meridian
                            </span>
                            <span className="eyebrow mt-0.5">Est. {year}</span>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="animate-fade-up animation-duration-800 [animation-delay:250ms]">
                        <p className="eyebrow text-(--gold)">Error &middot; 404</p>
                        <h1 className="display-italic mt-3 text-[2.6rem] leading-none tracking-[-0.02em] text-(--bone)">
                            Page not found.
                        </h1>
                        <p className="mt-4 text-[0.9rem] leading-relaxed text-(--bone-muted)">
                            The address you followed doesn&rsquo;t correspond to a room, a reservation, or a page on
                            record. Step back onto the ledger below.
                        </p>
                    </div>

                    {/* Directory — editorial list of ways back */}
                    <nav
                        aria-label="Return navigation"
                        className="animate-fade-up animation-duration-800 mt-12 [animation-delay:400ms]"
                    >
                        <p className="eyebrow mb-5">Step back to</p>
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

                    {/* Primary CTA — inverted bone, per §5 */}
                    <div className="animate-fade-up animation-duration-800 mt-10 [animation-delay:600ms]">
                        <Link
                            to="/bookings"
                            className="group relative flex h-12 w-full items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] text-black uppercase no-underline transition-all duration-300 hover:border-white hover:bg-white hover:tracking-[0.34em]"
                        >
                            <span>Return to the ledger</span>
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={1.6}
                            />
                        </Link>
                    </div>
                </div>

                {/* Footer — tabular colophon matches login/register */}
                <div className="animate-fade-up animation-duration-700 absolute right-0 bottom-6 left-0 flex items-center justify-between px-8 [animation-delay:900ms] sm:px-14 lg:px-16 xl:px-20">
                    <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                        &copy; {year}
                    </span>
                    <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                        Meridian / Errata 404
                    </span>
                </div>
            </main>
        </div>
    );
};
