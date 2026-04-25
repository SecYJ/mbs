import { createFileRoute, Link, linkOptions, Outlet } from "@tanstack/react-router";
import { Bell } from "lucide-react";

const navItems = linkOptions([{ to: "/bookings", label: "Bookings" }]);

const AppLayout = () => {
    const year = new Date().getFullYear();

    return (
        <div className="relative min-h-dvh bg-black text-(--bone)">
            {/* Film grain overlay */}
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
                <filter id="grain-app">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-app)" />
            </svg>

            {/* Navigation — hairline editorial bar */}
            <nav className="sticky top-0 z-40 border-b border-(--hairline) bg-black/90 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-6 lg:px-10 2xl:px-14">
                    {/* Left: Monogram + Nav */}
                    <div className="flex items-center gap-12">
                        <Link to="/bookings" className="flex items-center gap-3 no-underline">
                            <div className="inline-flex size-8 items-center justify-center border border-(--gold)">
                                <span className="display-italic text-[0.95rem] leading-none text-(--gold)">M</span>
                            </div>
                            <div className="hidden flex-col leading-tight sm:flex">
                                <span className="text-[0.7rem] font-semibold tracking-[0.24em] uppercase text-(--bone)">
                                    Meridian
                                </span>
                                <span className="eyebrow mt-0.5">Est. {year}</span>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-8 sm:flex">
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="group relative py-5 text-[0.68rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:text-(--bone-muted) data-[status=active]:text-(--bone)"
                                >
                                    {item.label}
                                    <span className="absolute bottom-0 right-0 left-0 h-px bg-transparent transition-all duration-300 group-data-[status=active]:bg-(--gold)" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right: Notifications + Avatar */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="relative flex size-9 cursor-pointer items-center justify-center border border-transparent text-(--bone-dim) transition-all duration-200 hover:border-(--hairline) hover:text-(--bone)"
                        >
                            <Bell className="size-4" strokeWidth={1.4} />
                            <span
                                className="absolute right-2 top-2 size-1.5 rounded-full bg-(--signal)"
                                style={{ animation: "signal-pulse 2.4s ease-in-out infinite" }}
                            />
                        </button>

                        <button
                            type="button"
                            aria-label="Account"
                            className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) bg-(--surface-01) text-[0.7rem] font-semibold tracking-widest text-(--bone) transition-all duration-200 hover:border-(--hairline-strong) hover:bg-(--surface-02)"
                        >
                            JD
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="px-6 py-8 lg:px-10 lg:py-10 2xl:px-14">
                <Outlet />
            </main>
        </div>
    );
};

export const Route = createFileRoute("/_bookings")({ component: AppLayout });
