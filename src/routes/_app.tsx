import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bell, Calendar, LayoutGrid, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_app")({ component: AppLayout });

const navItems = [
	{ to: "/_app/bookings", label: "Bookings", icon: CalendarDays },
	{ to: "/_app/my-bookings", label: "My Bookings", icon: LayoutGrid },
] as const;

function AppLayout() {
	const location = useLocation();

	return (
		<div className="relative min-h-dvh bg-[#071316]">
			{/* Noise texture overlay */}
			<svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.028]">
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>

			{/* Navigation */}
			<nav className="sticky top-0 z-40 border-b border-[rgba(141,229,219,0.08)] bg-[rgba(7,19,22,0.85)] backdrop-blur-xl">
				<div className="flex h-16 items-center justify-between px-6 lg:px-10 2xl:px-14">
					{/* Left: Logo + Nav Links */}
					<div className="flex items-center gap-10">
						{/* Logo */}
						<Link to="/_app/bookings" className="flex items-center gap-3 no-underline">
							<div
								className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(96,215,207,0.2)]"
								style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
							>
								<Calendar className="size-4 text-[#60d7cf]" strokeWidth={1.6} />
							</div>
							<span className="text-[0.82rem] font-bold tracking-[0.06em] uppercase text-[#e8dfd4]">
								MTS
							</span>
						</Link>

						{/* Nav Links */}
						<div className="hidden items-center gap-1 sm:flex">
							{navItems.map((item) => {
								const isActive = location.pathname.startsWith(item.to.replace("/_app", ""));
								return (
									<Link
										key={item.to}
										to={item.to}
										className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[0.78rem] font-medium tracking-wide no-underline transition-all duration-200 ${
											isActive
												? "bg-[rgba(96,215,207,0.1)] text-[#60d7cf]"
												: "text-[#6a9590] hover:bg-[rgba(96,215,207,0.05)] hover:text-[#8de5db]"
										}`}
									>
										<item.icon className="size-4" strokeWidth={1.6} />
										{item.label}
									</Link>
								);
							})}
						</div>
					</div>

					{/* Right: Notifications + User */}
					<div className="flex items-center gap-3">
						{/* Notification Bell */}
						<button
							type="button"
							className="relative flex size-9 cursor-pointer items-center justify-center rounded-lg text-[#6a9590] transition-all duration-200 hover:bg-[rgba(96,215,207,0.06)] hover:text-[#8de5db]"
						>
							<Bell className="size-[18px]" strokeWidth={1.6} />
							{/* Unread badge */}
							<span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#60d7cf] shadow-[0_0_6px_rgba(96,215,207,0.5)]" />
						</button>

						{/* User Avatar */}
						<button
							type="button"
							className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-[rgba(141,229,219,0.16)] bg-[rgba(96,215,207,0.06)] text-[0.72rem] font-semibold text-[#60d7cf] transition-all duration-200 hover:border-[rgba(96,215,207,0.3)] hover:bg-[rgba(96,215,207,0.1)]"
						>
							JD
						</button>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="px-6 py-6 lg:px-10 lg:py-8 2xl:px-14">
				<Outlet />
			</main>
		</div>
	);
}
