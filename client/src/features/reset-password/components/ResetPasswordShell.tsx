import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export const ResetPasswordShell = ({ children }: Props) => {
    const year = new Date().getFullYear();

    return (
        <div className="relative min-h-dvh bg-[#050505] text-(--bone)">
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 size-full opacity-[0.016]">
                <filter id="grain-reset">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-reset)" />
            </svg>

            <div
                aria-hidden
                className="hairline-draw-in animation pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-72 bg-(--hairline) [animation-delay:300ms] lg:block"
            />
            <div
                aria-hidden
                className="hairline-draw-in pointer-events-none absolute inset-y-0 left-1/2 hidden w-px translate-x-72 bg-(--hairline) [animation-delay:380ms] lg:block"
            />

            <div className="animate-fade-up animation-duration-700 absolute top-12 left-12 hidden items-center gap-3 [animation-delay:100ms] lg:flex">
                <span className="font-['Fraunces'] text-[20px] leading-none text-(--gold)">&#9496;</span>
                <span className="eyebrow text-(--gold)">Reissue &middot; Meridian</span>
            </div>

            <div className="animate-fade-up animation-duration-700 absolute top-12 right-12 hidden items-center gap-3 [animation-delay:200ms] lg:flex">
                <span className="eyebrow">Cipher</span>
                <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">IV</span>
            </div>

            <div className="animate-fade-up animation-duration-700 absolute bottom-12 left-12 hidden items-center gap-3 [animation-delay:900ms] lg:flex">
                <span className="eyebrow">Folio</span>
                <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">
                    004 &middot; {year}
                </span>
            </div>

            <div className="animate-fade-up animation-duration-700 absolute right-12 bottom-12 hidden items-center gap-3 [animation-delay:900ms] lg:flex">
                <span className="tabular-num text-[0.62rem] tracking-[0.2em] text-(--bone-faint)">
                    &copy; {year} &middot; Meridian / v1.0
                </span>
            </div>

            <main className="relative flex min-h-dvh items-center justify-center px-6 py-24 sm:px-10 lg:py-32">
                <div className="relative w-full max-w-100">
                    <div
                        aria-hidden
                        className="hairline-draw-in mx-auto h-px w-24 bg-(--hairline-strong) [animation-delay:200ms]"
                    />

                    <div className="animate-fade-up animation-duration-700 mt-12 flex flex-col items-center [animation-delay:200ms]">
                        <div className="inline-flex size-11 items-center justify-center border border-(--gold)">
                            <span className="display-italic text-[1.35rem] leading-none text-(--gold)">M</span>
                        </div>
                        <div className="mt-4 flex flex-col items-center leading-tight">
                            <span className="text-[0.78rem] font-semibold tracking-[0.24em] text-(--bone) uppercase">
                                Meridian
                            </span>
                            <span className="eyebrow mt-1">Est. {year}</span>
                        </div>
                    </div>

                    {children}

                    <div className="animate-fade-up animation-duration-800 mt-12 [animation-delay:600ms]">
                        <div className="flex items-center gap-4">
                            <div aria-hidden className="h-px flex-1 bg-(--hairline)" />
                            <span className="eyebrow">Or</span>
                            <div aria-hidden className="h-px flex-1 bg-(--hairline)" />
                        </div>
                        <p className="mt-6 text-center text-[0.84rem] text-(--bone-muted)">
                            Need a fresh link?{" "}
                            <Link
                                to="/forgot-password"
                                className="font-medium text-(--gold) underline decoration-[rgba(220,196,160,0.3)] underline-offset-4 transition-colors hover:text-(--bone)"
                            >
                                Request another
                            </Link>
                        </p>
                    </div>

                    <div className="animate-fade-up animation-duration-700 mt-14 flex items-center justify-center gap-5 [animation-delay:800ms] lg:hidden">
                        <span className="flex items-center gap-2">
                            <span className="eyebrow">Cipher</span>
                            <span className="tabular-num text-[0.66rem] tracking-[0.2em] text-(--bone-muted)">IV</span>
                        </span>
                        <span aria-hidden className="h-3 w-px bg-(--hairline)" />
                        <span className="flex items-center gap-2">
                            <span className="eyebrow">Folio</span>
                            <span className="tabular-num text-[0.66rem] tracking-[0.2em] text-(--bone-muted)">
                                004 &middot; {year}
                            </span>
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};
