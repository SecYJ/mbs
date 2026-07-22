import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export const RegisterShell = ({ children }: Props) => {
    const year = new Date().getFullYear();

    return (
        <div className="relative flex min-h-dvh bg-[#050505] text-(--bone)">
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
                <filter id="grain-register">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-register)" />
            </svg>

            <aside className="relative hidden overflow-hidden bg-[#050505] lg:flex lg:w-[58%]">
                <div
                    aria-hidden
                    className="hairline-draw-in pointer-events-none absolute top-0 bottom-0 left-24 w-px bg-(--hairline) [animation-delay:300ms]"
                />

                <div className="animate-fade-up animation-duration-700 absolute top-14 right-14 flex items-start gap-3 [animation-delay:100ms]">
                    <span className="eyebrow mt-1 text-(--gold)">Admission · Meridian</span>
                    <span className="font-['Fraunces'] text-[22px] leading-none text-(--gold)">&#9488;</span>
                </div>

                <div className="animate-fade-up animation-duration-700 absolute top-14 left-32 flex items-center gap-3 [animation-delay:200ms]">
                    <span className="eyebrow">Chapter</span>
                    <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">II / III</span>
                </div>

                <div className="relative z-10 mt-auto flex w-full flex-col px-20 pb-20">
                    <p className="eyebrow animate-fade-up animation-duration-800 mb-14 text-(--gold) [animation-delay:300ms]">
                        Meridian &middot; Request an Account
                    </p>

                    <h2 className="display-italic animate-fade-up animation-duration-900 pl-[22%] text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-(--bone) [animation-delay:450ms]">
                        Compose
                        <br />
                        the ledger.
                    </h2>
                    <h2 className="display-italic animate-fade-up animation-duration-900 mt-4 text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-(--bone-dim) [animation-delay:650ms]">
                        Keep
                        <br />
                        the hours.
                    </h2>

                    <div
                        aria-hidden
                        className="hairline-draw-in mt-14 h-px w-48 bg-(--hairline-strong) [animation-delay:900ms]"
                    />

                    <p className="animate-fade-up animation-duration-800 mt-6 max-w-[44ch] text-[0.88rem] leading-relaxed text-(--bone-muted) [animation-delay:1000ms]">
                        A quiet enrolment &mdash; your credentials are the only key you&rsquo;ll need to the suite.
                    </p>
                </div>

                <div className="animate-fade-up animation-duration-700 absolute bottom-14 left-32 flex items-center gap-3 [animation-delay:900ms]">
                    <span className="eyebrow">Folio</span>
                    <span className="tabular-num text-[0.7rem] tracking-[0.2em] text-(--bone-muted)">
                        002 &middot; {year}
                    </span>
                </div>
            </aside>

            <main className="relative flex w-full flex-col justify-center bg-[#050505] px-8 sm:px-14 lg:w-[42%] lg:px-16 xl:px-20">
                <div className="animate-fade-up animation-duration-700 absolute top-8 left-8 flex items-center gap-3 [animation-delay:100ms] lg:hidden">
                    <span className="font-['Fraunces'] text-[18px] leading-none text-(--gold)">&#9488;</span>
                    <span className="eyebrow text-(--gold)">Admission · Meridian</span>
                </div>

                <div className="relative mx-auto w-full max-w-100 py-20">
                    <div className="animate-fade-up animation-duration-700 mb-14 flex items-center gap-4 [animation-delay:150ms]">
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

                    <div className="animate-fade-up animation-duration-800 [animation-delay:250ms]">
                        <p className="eyebrow text-(--gold)">Request your suite</p>
                        <h1 className="display-italic mt-3 text-[2.6rem] leading-none tracking-[-0.02em] text-(--bone)">
                            A new ledger.
                        </h1>
                        <p className="mt-4 text-[0.9rem] leading-relaxed text-(--bone-muted)">
                            Begin your concierge account &mdash; a few quiet lines, then every hour is yours to reserve.
                        </p>
                    </div>

                    {children}

                    <div className="animate-fade-up animation-duration-800 mt-10 [animation-delay:600ms]">
                        <div className="flex items-center gap-4">
                            <div aria-hidden className="h-px flex-1 bg-(--hairline)" />
                            <span className="eyebrow">Or</span>
                            <div aria-hidden className="h-px flex-1 bg-(--hairline)" />
                        </div>
                        <p className="mt-6 text-center text-[0.84rem] text-(--bone-muted)">
                            Already enrolled?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-(--gold) underline decoration-[rgba(220,196,160,0.3)] underline-offset-4 transition-colors hover:text-(--bone)"
                            >
                                Return to sign-in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="animate-fade-up animation-duration-700 absolute right-0 bottom-6 left-0 flex items-center justify-between px-8 [animation-delay:900ms] sm:px-14 lg:px-16 xl:px-20">
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
