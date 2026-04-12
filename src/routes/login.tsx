import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Calendar } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="relative flex min-h-dvh bg-[#071316]">
			{/* ── Noise texture overlay ── */}
			<svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.028]">
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>

			{/* ════════════════════════════════════════════
                VISUAL CANVAS — left 58%
            ════════════════════════════════════════════ */}
			<div className="relative hidden overflow-hidden lg:flex lg:w-[58%]">
				{/* Deep atmospheric base */}
				<div
					aria-hidden
					className="absolute inset-0 bg-gradient-to-br from-[#081a1f] via-[#071316] to-[#0a1e1a]"
				/>

				{/* Animated mesh gradient blobs */}
				<div aria-hidden className="absolute inset-0 overflow-hidden">
					<div
						className="absolute -top-20 right-[10%] h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
						style={{
							background: "radial-gradient(circle, rgba(96,215,207,0.5), rgba(96,215,207,0) 70%)",
							animation: "mesh-drift-1 20s cubic-bezier(0.4,0,0.6,1) infinite",
						}}
					/>
					<div
						className="absolute top-[40%] -left-[10%] h-[440px] w-[440px] rounded-full opacity-35 blur-[100px]"
						style={{
							background: "radial-gradient(circle, rgba(47,138,106,0.55), rgba(47,138,106,0) 70%)",
							animation: "mesh-drift-2 26s cubic-bezier(0.4,0,0.6,1) infinite",
						}}
					/>
					<div
						className="absolute -bottom-16 right-[30%] h-[480px] w-[480px] rounded-full opacity-30 blur-[110px]"
						style={{
							background: "radial-gradient(circle, rgba(50,143,151,0.5), rgba(50,143,151,0) 70%)",
							animation: "mesh-drift-3 18s cubic-bezier(0.4,0,0.6,1) infinite",
						}}
					/>
				</div>

				{/* Thin vertical accent line */}
				<div
					aria-hidden
					className="absolute left-14 top-14 bottom-14 w-px bg-gradient-to-b from-transparent via-[rgba(96,215,207,0.12)] to-transparent"
				/>

				{/* Editorial typography — anchored to bottom */}
				<div className="relative z-10 mt-auto p-14 pb-16 pl-20">
					<p
						className="mb-10 text-[0.7rem] font-bold tracking-[0.3em] uppercase text-[rgba(141,229,219,0.4)]"
						style={{
							animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 200ms both",
						}}
					>
						Meeting Room System
					</p>
					<h2
						className="font-['Fraunces'] text-[clamp(3.5rem,5.5vw,5.2rem)] leading-[0.92] font-normal italic text-[#e8dfd4] opacity-90"
						style={{
							animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 350ms both",
						}}
					>
						Reserve
						<br />
						the room.
					</h2>
					<h2
						className="mt-3 font-['Fraunces'] text-[clamp(3.5rem,5.5vw,5.2rem)] leading-[0.92] font-normal italic text-[#e8dfd4] opacity-30"
						style={{
							animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 550ms both",
						}}
					>
						Reclaim
						<br />
						the hour.
					</h2>
				</div>

				{/* Right edge fade into form side */}
				<div
					aria-hidden
					className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#0c1b1f]"
				/>
			</div>

			{/* ════════════════════════════════════════════
                FORM SIDE — right 42%
            ════════════════════════════════════════════ */}
			<div className="relative flex w-full flex-col justify-center px-8 sm:px-14 lg:w-[42%] lg:px-14 xl:px-18 bg-[#0c1b1f]">
				{/* Subtle ambient wash */}
				<div
					aria-hidden
					className="absolute inset-0 bg-gradient-to-br from-[rgba(96,215,207,0.03)] via-transparent to-[rgba(47,138,106,0.02)]"
				/>

				<div className="relative z-10 mx-auto w-full max-w-[380px] py-16">
					{/* Logo mark — circular ring with glow */}
					<div
						className="mb-14"
						style={{
							animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both",
						}}
					>
						<div
							className="inline-flex size-14 items-center justify-center rounded-full border border-[rgba(96,215,207,0.2)]"
							style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
						>
							<Calendar className="size-6 text-[#60d7cf]" strokeWidth={1.4} />
						</div>
					</div>

					{/* Heading */}
					<div
						style={{
							animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 200ms both",
						}}
					>
						<h1 className="font-['Fraunces'] text-[clamp(2.6rem,4vw,3.4rem)] leading-[1.02] font-normal italic tracking-tight text-[#e8dfd4]">
							Welcome
							<br />
							back
						</h1>
						<p className="mt-4 text-[0.92rem] leading-relaxed text-[#6a9590]">
							Sign in to manage your bookings
						</p>
					</div>

					{/* Form */}
					<form
						onSubmit={(e) => e.preventDefault()}
						className="mt-12 space-y-8"
						style={{
							animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 400ms both",
						}}
					>
						<div className="space-y-3">
							<Label
								htmlFor="email"
								className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]"
							>
								Email address
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@company.com"
								autoComplete="email"
								className="login-input-underline h-11 text-[#e8dfd4] shadow-none placeholder:text-[#3e5e58] focus-visible:ring-0"
							/>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="password"
									className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]"
								>
									Password
								</Label>
								<Link
									to="/"
									className="text-[0.75rem] font-medium text-[#4a8a84] no-underline transition-colors hover:text-[#60d7cf]"
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									autoComplete="current-password"
									className="login-input-underline h-11 pr-12 text-[#e8dfd4] shadow-none placeholder:text-[#3e5e58] focus-visible:ring-0"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center cursor-pointer text-[#4a6e68] transition-colors hover:text-[#60d7cf]"
									tabIndex={-1}
								>
									{showPassword ? (
										<EyeOff className="size-[18px]" />
									) : (
										<Eye className="size-[18px]" />
									)}
								</button>
							</div>
						</div>

						<div className="pt-2">
							<Button
								type="submit"
								className="h-12 w-full cursor-pointer rounded-lg text-[0.82rem] font-semibold tracking-[0.06em] uppercase text-[#0a1418] shadow-[0_4px_24px_rgba(96,215,207,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(96,215,207,0.3)]"
								style={{
									background: "linear-gradient(135deg, #60d7cf 0%, #2f8a6a 100%)",
								}}
							>
								Sign in
							</Button>
						</div>
					</form>

					{/* Create account */}
					<p
						className="mt-10 text-[0.84rem] text-[#4a6e68]"
						style={{
							animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 600ms both",
						}}
					>
						Don't have an account?{" "}
						<Link
							to="/"
							className="font-semibold text-[#60d7cf] no-underline transition-colors hover:text-[#8de5db]"
						>
							Create account
						</Link>
					</p>
				</div>

				{/* Footer */}
				<p className="absolute bottom-6 left-0 right-0 text-center text-[0.68rem] tracking-wide text-[#2e4a46]">
					&copy; {new Date().getFullYear()} Meeting Room Booking System
				</p>
			</div>
		</div>
	);
}
