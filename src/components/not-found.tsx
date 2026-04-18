import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export function NotFound() {
	const year = new Date().getFullYear();

	return (
		<div className="relative flex min-h-dvh bg-black text-[var(--bone)]">
			{/* Film grain overlay — unique filter id per route per §6 */}
			<svg
				aria-hidden
				className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]"
			>
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
			<aside className="relative hidden overflow-hidden bg-black lg:flex lg:w-[58%]">
				{/* Margin rule — centered at 50%, standing in for the ledger's spine */}
				<div
					aria-hidden
					className="hairline-draw-in pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-[var(--hairline)]"
					style={{ animationDelay: "300ms" }}
				/>

				{/* Top-left: closing bracket + errata mark */}
				<div
					className="absolute left-14 top-14 flex items-start gap-3"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
				>
					<span className="font-['Fraunces'] text-[22px] leading-none text-[var(--gold)]">
						&#9492;
					</span>
					<span className="eyebrow eyebrow-gold mt-1">Errata &middot; Unbound Folio</span>
				</div>

				{/* Top-right: oversized appendix call-number */}
				<div
					className="absolute right-14 top-12 flex flex-col items-end gap-2"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
				>
					<span className="eyebrow">Appendix</span>
					<span className="tabular-num text-[1.75rem] leading-none tracking-[0.12em] text-[var(--bone)]">
						404<span className="text-[var(--bone-dim)]"> / &infin;</span>
					</span>
				</div>

				{/* Editorial statement — anchored bottom */}
				<div className="relative z-10 mt-auto flex w-full flex-col px-20 pb-20">
					<p
						className="eyebrow eyebrow-gold mb-14"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
					>
						Meridian &middot; Folio Not Found
					</p>

					<h2
						className="display-italic text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-[var(--bone)]"
						style={{ animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 450ms both" }}
					>
						Not in
						<br />
						the ledger.
					</h2>
					<h2
						className="display-italic mt-4 pl-[18%] text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] text-[var(--bone-dim)]"
						style={{ animation: "fade-up 900ms cubic-bezier(0.16,1,0.3,1) 650ms both" }}
					>
						Nothing
						<br />
						reserved here.
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
						The page you sought was never bound into this edition &mdash; perhaps a mistyped
						address, perhaps a folio since withdrawn. The ledger continues just beyond.
					</p>
				</div>

				{/* Bottom-left: missing-folio stamp */}
				<div
					className="absolute bottom-14 left-14 flex items-center gap-3"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
				>
					<span className="eyebrow">Folio</span>
					<span className="tabular-num text-[0.7rem] tracking-[0.2em] text-[var(--bone-muted)]">
						Missing &middot; {year}
					</span>
				</div>

				{/* Bottom-right: the void frame — a hollow hairline square where
				    the folio mark would have been. Unique ornament to 404. */}
				<div
					className="absolute bottom-14 right-14 flex items-center gap-4"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1200ms both" }}
				>
					<span className="eyebrow">Mark</span>
					<div
						aria-hidden
						className="inline-flex size-11 items-center justify-center border border-[var(--hairline-strong)]"
					>
						<span className="display-italic text-[1.35rem] leading-none text-[var(--bone-faint)]">
							&mdash;
						</span>
					</div>
				</div>
			</aside>

			{/* ════════════════════════════════════════════
			    RETURN COLUMN — right 42%
			    A directory of ways back onto the ledger.
			════════════════════════════════════════════ */}
			<main className="relative flex w-full flex-col justify-center bg-black px-8 sm:px-14 lg:w-[42%] lg:px-16 xl:px-20">
				{/* Mobile: compact top ornament mirroring the canvas mark */}
				<div
					className="absolute left-8 top-8 flex items-center gap-3 lg:hidden"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
				>
					<span className="font-['Fraunces'] text-[18px] leading-none text-[var(--gold)]">
						&#9492;
					</span>
					<span className="eyebrow eyebrow-gold">Errata &middot; 404</span>
				</div>

				{/* Mobile: show the tabular 404 when the canvas is hidden */}
				<div
					className="absolute right-8 top-8 flex flex-col items-end gap-1 lg:hidden"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
				>
					<span className="eyebrow">Appendix</span>
					<span className="tabular-num text-[1.1rem] leading-none tracking-[0.12em] text-[var(--bone)]">
						404<span className="text-[var(--bone-dim)]"> / &infin;</span>
					</span>
				</div>

				<div className="relative mx-auto w-full max-w-[400px] py-20">
					{/* Monogram — matched with the app's sign-in and register voice */}
					<div
						className="mb-16 flex items-center gap-4"
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
						<p className="eyebrow eyebrow-gold">Error &middot; 404</p>
						<h1 className="mt-3 display-italic text-[2.6rem] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
							Page not found.
						</h1>
						<p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--bone-muted)]">
							The address you followed doesn&rsquo;t correspond to a room, a reservation,
							or a page on record. Step back onto the ledger below.
						</p>
					</div>

					{/* Directory — editorial list of ways back */}
					<nav
						aria-label="Return navigation"
						className="mt-12"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
					>
						<p className="eyebrow mb-5">Step back to</p>
						<ul className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
							<DirectoryLink to="/" label="Return" destination="The lobby" index="I" />
							<DirectoryLink
								to="/bookings"
								label="Resume"
								destination="Today&rsquo;s ledger"
								index="II"
							/>
							<DirectoryLink
								to="/login"
								label="Re-enter"
								destination="Your suite"
								index="III"
							/>
						</ul>
					</nav>

					{/* Primary CTA — inverted bone, per §5 */}
					<div
						className="mt-10"
						style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 600ms both" }}
					>
						<Link
							to="/"
							className="group relative flex h-12 w-full items-center justify-center gap-3 border border-[var(--bone)] bg-[var(--bone)] text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black no-underline transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em]"
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
				<div
					className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-8 sm:px-14 lg:px-16 xl:px-20"
					style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 1100ms both" }}
				>
					<span className="tabular-num text-[0.62rem] tracking-[0.2em] text-[var(--bone-faint)]">
						&copy; {year}
					</span>
					<span className="tabular-num text-[0.62rem] tracking-[0.2em] text-[var(--bone-faint)]">
						Meridian / Errata 404
					</span>
				</div>
			</main>
		</div>
	);
}

type DirectoryLinkProps = {
	to: string;
	label: string;
	destination: string;
	index: string;
};

function DirectoryLink({ to, label, destination, index }: DirectoryLinkProps) {
	return (
		<li>
			<Link
				to={to}
				className="group flex items-center gap-4 py-4 no-underline"
			>
				<span className="tabular-num w-6 text-[0.62rem] tracking-[0.2em] text-[var(--bone-faint)] transition-colors group-hover:text-[var(--gold)]">
					{index}
				</span>
				<span className="eyebrow shrink-0 transition-colors group-hover:text-[var(--gold)]">
					{label} &middot;
				</span>
				<span className="display-italic flex-1 text-[1.1rem] leading-none text-[var(--bone)] transition-colors group-hover:text-[var(--gold)]">
					{destination}
				</span>
				<ArrowUpRight
					className="size-4 text-[var(--bone-dim)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--gold)]"
					strokeWidth={1.4}
				/>
			</Link>
		</li>
	);
}
