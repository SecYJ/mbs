import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const year = new Date().getFullYear();

	return (
		<div className="relative flex min-h-dvh bg-black text-[var(--bone)]">
			{/* Film grain overlay */}
			<svg
				aria-hidden
				className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]"
			>
				<filter id="grain-register">
					<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain-register)" />
			</svg>

			{/* ════════════════════════════════════════════
			    EDITORIAL CANVAS — left 58%
			    Pure black, anchored by a serif italic
			    enrolment statement. Mirrors login but
			    rhythmically offset (different offset on
			    second line, different chapter, different folio).
			════════════════════════════════════════════ */}
			<aside className="relative hidden overflow-hidden bg-black lg:flex lg:w-[58%]">
				{/* Margin rule — 96px from left this time (mirrors login) */}
				<div
					aria-hidden
					className="hairline-draw-in pointer-events-none absolute top-0 bottom-0 left-24 w-px bg-[var(--hairline)]"
					style={{ animationDelay: "300ms" }}
				/>

				{/* Top-right bracket + admission mark */}
				<div
					className="absolute right-14 top-14 flex items-start gap-3"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
				>
					<span className="eyebrow eyebrow-gold mt-1">Admission · Meridian</span>
					<span className="font-['Fraunces'] text-[22px] leading-none text-[var(--gold)]">
						&#9488;
					</span>
				</div>

				{/* Top-left: hairline chapter stamp */}
				<div
					className="absolute left-32 top-14 flex items-center gap-3"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
				>
					<span className="eyebrow">Chapter</span>
					<span className="tabular-num text-[0.7rem] tracking-[0.2em] text-[var(--bone-muted)]">
						II / III
					</span>
				</div>

				{/* Editorial statement — anchored bottom, mirrored rhythm vs login */}
				<div className="relative z-10 mt-auto flex w-full flex-col px-20 pb-20">
					<p
						className="eyebrow eyebrow-gold mb-14"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
					>
						Meridian &middot; Request an Account
					</p>

					<h2
						className="display-italic pl-[22%] text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-[var(--bone)]"
						style={{ animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 450ms both" }}
					>
						Compose
						<br />
						the ledger.
					</h2>
					<h2
						className="display-italic mt-4 text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-[var(--bone-dim)]"
						style={{ animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 650ms both" }}
					>
						Keep
						<br />
						the hours.
					</h2>

					{/* Hairline rule below the statement */}
					<div
						aria-hidden
						className="hairline-draw-in mt-14 h-px w-48 bg-[var(--hairline-strong)]"
						style={{ animationDelay: "900ms" }}
					/>

					<p
						className="mt-6 max-w-[44ch] text-[0.88rem] leading-relaxed text-[var(--bone-muted)]"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 1000ms both" }}
					>
						A quiet enrolment &mdash; your credentials are the only key you&rsquo;ll need to
						the suite.
					</p>
				</div>

				{/* Bottom-left: page-number flourish */}
				<div
					className="absolute bottom-14 left-32 flex items-center gap-3"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
				>
					<span className="eyebrow">Folio</span>
					<span className="tabular-num text-[0.7rem] tracking-[0.2em] text-[var(--bone-muted)]">
						002 &middot; {year}
					</span>
				</div>
			</aside>

			{/* ════════════════════════════════════════════
			    FORM COLUMN — right 42%
			════════════════════════════════════════════ */}
			<main className="relative flex w-full flex-col justify-center bg-black px-8 sm:px-14 lg:w-[42%] lg:px-16 xl:px-20">
				{/* Mobile ornament */}
				<div
					className="absolute left-8 top-8 flex items-center gap-3 lg:hidden"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
				>
					<span className="font-['Fraunces'] text-[18px] leading-none text-[var(--gold)]">
						&#9488;
					</span>
					<span className="eyebrow eyebrow-gold">Admission · Meridian</span>
				</div>

				<div className="relative mx-auto w-full max-w-[400px] py-20">
					{/* Monogram */}
					<div
						className="mb-14 flex items-center gap-4"
						style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 150ms both" }}
					>
						<div className="inline-flex size-11 items-center justify-center border border-[var(--gold)]">
							<span className="display-italic text-[1.35rem] leading-none text-[var(--gold)]">
								M
							</span>
						</div>
						<div className="flex flex-col leading-tight">
							<span className="text-[0.78rem] font-semibold tracking-[0.24em] uppercase text-[var(--bone)]">
								Meridian
							</span>
							<span className="eyebrow mt-0.5">Est. {year}</span>
						</div>
					</div>

					{/* Heading */}
					<div
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 250ms both" }}
					>
						<p className="eyebrow eyebrow-gold">Request your suite</p>
						<h1 className="mt-3 display-italic text-[2.6rem] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
							A new ledger.
						</h1>
						<p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--bone-muted)]">
							Begin your concierge account &mdash; a few quiet lines, then every hour is yours
							to reserve.
						</p>
					</div>

					{/* Form */}
					<form
						onSubmit={(e) => e.preventDefault()}
						className="mt-10 space-y-7"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
					>
						<div className="space-y-3">
							<Label htmlFor="name" className="eyebrow block">
								Full Name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Jane Doe"
								autoComplete="name"
								className="login-input-underline h-11 rounded-none bg-transparent text-[0.95rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
							/>
						</div>

						<div className="space-y-3">
							<Label htmlFor="email-register" className="eyebrow block">
								Email Address
							</Label>
							<Input
								id="email-register"
								type="email"
								placeholder="you@company.com"
								autoComplete="email"
								className="login-input-underline h-11 rounded-none bg-transparent text-[0.95rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
							/>
						</div>

						<div className="space-y-3">
							<Label htmlFor="password-register" className="eyebrow block">
								Passphrase
							</Label>
							<div className="relative">
								<Input
									id="password-register"
									type={showPassword ? "text" : "password"}
									placeholder="Minimum eight characters"
									autoComplete="new-password"
									className="login-input-underline h-11 rounded-none bg-transparent pr-12 text-[0.95rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
									className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center cursor-pointer text-[var(--bone-dim)] transition-colors hover:text-[var(--gold)]"
									tabIndex={-1}
								>
									{showPassword ? (
										<EyeOff className="size-[17px]" strokeWidth={1.4} />
									) : (
										<Eye className="size-[17px]" strokeWidth={1.4} />
									)}
								</button>
							</div>
						</div>

						<div className="space-y-3">
							<Label htmlFor="confirm-register" className="eyebrow block">
								Confirm Passphrase
							</Label>
							<div className="relative">
								<Input
									id="confirm-register"
									type={showConfirm ? "text" : "password"}
									placeholder="Repeat to confirm"
									autoComplete="new-password"
									className="login-input-underline h-11 rounded-none bg-transparent pr-12 text-[0.95rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
								/>
								<button
									type="button"
									onClick={() => setShowConfirm((prev) => !prev)}
									aria-label={showConfirm ? "Hide passphrase" : "Show passphrase"}
									className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center cursor-pointer text-[var(--bone-dim)] transition-colors hover:text-[var(--gold)]"
									tabIndex={-1}
								>
									{showConfirm ? (
										<EyeOff className="size-[17px]" strokeWidth={1.4} />
									) : (
										<Eye className="size-[17px]" strokeWidth={1.4} />
									)}
								</button>
							</div>
						</div>

						{/* Terms — hairline note */}
						<p className="text-[0.72rem] leading-relaxed text-[var(--bone-dim)]">
							By requesting a suite, you accept the{" "}
							<Link
								to="/"
								className="text-[var(--bone-muted)] no-underline transition-colors hover:text-[var(--gold)]"
								style={{
									textUnderlineOffset: "3px",
									textDecoration: "underline",
									textDecorationColor: "rgba(255,255,255,0.12)",
								}}
							>
								house rules
							</Link>{" "}
							and our{" "}
							<Link
								to="/"
								className="text-[var(--bone-muted)] no-underline transition-colors hover:text-[var(--gold)]"
								style={{
									textUnderlineOffset: "3px",
									textDecoration: "underline",
									textDecorationColor: "rgba(255,255,255,0.12)",
								}}
							>
								discretion clause
							</Link>
							.
						</p>

						{/* Primary */}
						<div className="pt-2">
							<button
								type="submit"
								className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-[var(--bone)] bg-[var(--bone)] text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em]"
							>
								<span>Open Ledger</span>
								<ArrowRight
									className="size-4 transition-transform duration-300 group-hover:translate-x-1"
									strokeWidth={1.6}
								/>
							</button>
						</div>
					</form>

					{/* Hairline divider + secondary */}
					<div
						className="mt-10"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 600ms both" }}
					>
						<div className="flex items-center gap-4">
							<div aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
							<span className="eyebrow">Or</span>
							<div aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
						</div>
						<p className="mt-6 text-center text-[0.84rem] text-[var(--bone-muted)]">
							Already enrolled?{" "}
							<Link
								to="/login"
								className="font-medium text-[var(--gold)] no-underline transition-colors hover:text-[var(--bone)]"
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
				</div>

				{/* Footer — tabular colophon */}
				<div
					className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8 sm:px-14 lg:px-16 xl:px-20"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
				>
					<span className="tabular-num text-[0.62rem] tracking-[0.2em] text-[var(--bone-faint)]">
						&copy; {year}
					</span>
					<span className="tabular-num text-[0.62rem] tracking-[0.2em] text-[var(--bone-faint)]">
						Meridian / v1.0
					</span>
				</div>
			</main>
		</div>
	);
}
