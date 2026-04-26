import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

type Props = {
    children: ReactNode;
};

export const ForgotPasswordShell = ({ children }: Props) => {
    const year = new Date().getFullYear();

    return (
        <div className="relative min-h-dvh bg-black text-(--bone)">
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
                <filter id="grain-forgot">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-forgot)" />
            </svg>

            <div
                aria-hidden
                className="hairline-draw-in pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-72 bg-(--hairline) lg:block"
                style={{ animationDelay: "300ms" }}
            />
            <div
                aria-hidden
                className="hairline-draw-in pointer-events-none absolute inset-y-0 left-1/2 hidden w-px translate-x-72 bg-(--hairline) lg:block"
                style={{ animationDelay: "380ms" }}
            />

            <div
                className="absolute left-12 top-12 hidden items-center gap-3 lg:flex"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
            >
                <span className="font-['Fraunces'] text-[20px] leading-none text-(--gold)">&#9492;</span>
                <span className="eyebrow eyebrow-gold">Recovery &middot; Meridian</span>
            </div>

            <div
                className="absolute right-12 top-12 hidden items-center gap-3 lg:flex"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
            >
                <span className="eyebrow">Chapter</span>
                <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">III / III</span>
            </div>

            <div
                className="absolute bottom-12 left-12 hidden items-center gap-3 lg:flex"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1050ms both" }}
            >
                <span className="eyebrow">Folio</span>
                <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">
                    003 &middot; {year}
                </span>
            </div>

            <div
                className="absolute bottom-12 right-12 hidden items-center gap-3 lg:flex"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
            >
                <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                    &copy; {year} &middot; Meridian / v1.0
                </span>
            </div>

            <main className="relative flex min-h-dvh items-center justify-center px-6 py-24 sm:px-10 lg:py-32">
                <div className="relative w-full max-w-100">
                    <div
                        aria-hidden
                        className="hairline-draw-in mx-auto h-px w-24 bg-(--hairline-strong)"
                        style={{ animationDelay: "200ms" }}
                    />

                    <div
                        className="mt-12 flex flex-col items-center"
                        style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
                    >
                        <div className="inline-flex size-11 items-center justify-center border border-(--gold)">
                            <span className="display-italic text-[1.35rem] leading-none text-(--gold)">M</span>
                        </div>
                        <div className="mt-4 flex flex-col items-center leading-tight">
                            <span className="text-[0.78rem] font-semibold tracking-[0.24em] uppercase text-(--bone)">
                                Meridian
                            </span>
                            <span className="eyebrow mt-1">Est. {year}</span>
                        </div>
                    </div>

                    <div
                        className="mt-14 text-center"
                        style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 320ms both" }}
                    >
                        <p className="eyebrow eyebrow-gold">Recover access to your suite</p>
                        <h1 className="mt-3 display-italic text-[2.6rem] leading-none tracking-[-0.02em] text-(--bone)">
                            Re-key the suite.
                        </h1>
                        <p className="mx-auto mt-4 max-w-[38ch] text-[0.9rem] leading-relaxed text-(--bone-muted)">
                            Provide the email tied to your account &mdash; we&rsquo;ll dispatch a private link so you
                            can set a new passphrase.
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
                            Remembered it?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-(--gold) no-underline transition-colors hover:text-(--bone)"
                                style={{
                                    textUnderlineOffset: "4px",
                                    textDecoration: "underline",
                                    textDecorationColor: "rgba(220,196,160,0.3)",
                                }}
                            >
                                Return to sign-in
                            </Link>
                        </p>
                    </div>

                    <div
                        className="mt-14 flex items-center justify-center gap-5 lg:hidden"
                        style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 800ms both" }}
                    >
                        <span className="flex items-center gap-2">
                            <span className="eyebrow">Chapter</span>
                            <span className="tabular-num text-[0.66rem] tracking-[0.2em] text-(--bone-muted)">
                                III / III
                            </span>
                        </span>
                        <span aria-hidden className="h-3 w-px bg-(--hairline)" />
                        <span className="flex items-center gap-2">
                            <span className="eyebrow">Folio</span>
                            <span className="tabular-num text-[0.66rem] tracking-[0.2em] text-(--bone-muted)">
                                003 &middot; {year}
                            </span>
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};
