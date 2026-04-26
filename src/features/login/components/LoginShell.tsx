import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

type Props = {
    children: ReactNode;
};

export const LoginShell = ({ children }: Props) => {
    const year = new Date().getFullYear();

    return (
        <div className="relative flex min-h-dvh bg-black text-(--bone)">
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
                <filter id="grain-login">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-login)" />
            </svg>

            <aside className="relative hidden overflow-hidden bg-black lg:flex lg:w-[58%]">
                <div
                    aria-hidden
                    className="hairline-draw-in pointer-events-none absolute top-0 bottom-0 right-24 w-px bg-(--hairline)"
                    style={{ animationDelay: "300ms" }}
                />

                <div
                    className="absolute left-14 top-14 flex items-start gap-3"
                    style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
                >
                    <span className="font-['Fraunces'] text-[22px] leading-none text-(--gold)">&#9484;</span>
                    <span className="eyebrow eyebrow-gold mt-1">Suite · Meridian</span>
                </div>

                <div
                    className="absolute right-32 top-14 flex items-center gap-3"
                    style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
                >
                    <span className="eyebrow">Chapter</span>
                    <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">I / III</span>
                </div>

                <div className="relative z-10 mt-auto flex w-full flex-col px-20 pb-20">
                    <p
                        className="eyebrow eyebrow-gold mb-14"
                        style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
                    >
                        Meridian &middot; Meeting Concierge
                    </p>

                    <h2
                        className="display-italic text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-(--bone)"
                        style={{ animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 450ms both" }}
                    >
                        Reserve
                        <br />
                        the room.
                    </h2>
                    <h2
                        className="display-italic mt-4 pl-[18%] text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-(--bone-dim)"
                        style={{ animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 650ms both" }}
                    >
                        Reclaim
                        <br />
                        the hour.
                    </h2>

                    <div
                        aria-hidden
                        className="hairline-draw-in mt-14 h-px w-48 bg-(--hairline-strong)"
                        style={{ animationDelay: "900ms" }}
                    />

                    <p
                        className="mt-6 max-w-[44ch] text-[0.88rem] leading-relaxed text-(--bone-muted)"
                        style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 1000ms both" }}
                    >
                        A quiet ledger for shared rooms &mdash; where every reservation is intentional and every hour
                        accounted for.
                    </p>
                </div>

                <div
                    className="absolute bottom-14 right-32 flex items-center gap-3"
                    style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
                >
                    <span className="eyebrow">Folio</span>
                    <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">
                        001 &middot; {year}
                    </span>
                </div>
            </aside>

            <main className="relative flex w-full flex-col justify-center bg-black px-8 sm:px-14 lg:w-[42%] lg:px-16 xl:px-20">
                <div
                    className="absolute left-8 top-8 flex items-center gap-3 lg:hidden"
                    style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
                >
                    <span className="font-['Fraunces'] text-[18px] leading-none text-(--gold)">&#9484;</span>
                    <span className="eyebrow eyebrow-gold">Suite · Meridian</span>
                </div>

                <div className="relative mx-auto w-full max-w-100 py-20">
                    <div
                        className="mb-16 flex items-center gap-4"
                        style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 150ms both" }}
                    >
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

                    <div style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 250ms both" }}>
                        <p className="eyebrow eyebrow-gold">Sign in to your suite</p>
                        <h1 className="mt-3 display-italic text-[2.6rem] leading-none tracking-[-0.02em] text-(--bone)">
                            Welcome back.
                        </h1>
                        <p className="mt-4 text-[0.9rem] leading-relaxed text-(--bone-muted)">
                            Sign in to manage reservations, review today&rsquo;s ledger, and attend what matters.
                        </p>
                    </div>

                    {children}

                    <div className="mt-12" style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 600ms both" }}>
                        <div className="flex items-center gap-4">
                            <div aria-hidden className="h-px flex-1 bg-(--hairline)" />
                            <span className="eyebrow">Or</span>
                            <div aria-hidden className="h-px flex-1 bg-(--hairline)" />
                        </div>
                        <p className="mt-6 text-center text-[0.84rem] text-(--bone-muted)">
                            New here?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-(--gold) no-underline transition-colors hover:text-(--bone)"
                                style={{
                                    textUnderlineOffset: "4px",
                                    textDecoration: "underline",
                                    textDecorationColor: "rgba(220,196,160,0.3)",
                                }}
                            >
                                Request a suite
                            </Link>
                        </p>
                    </div>
                </div>

                <div
                    className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8 sm:px-14 lg:px-16 xl:px-20"
                    style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
                >
                    <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                        &copy; {year}
                    </span>
                    <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                        Meridian / v1.0
                    </span>
                </div>
            </main>
        </div>
    );
};
