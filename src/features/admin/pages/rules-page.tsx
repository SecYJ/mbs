import { useState } from "react";
import { Clock, CalendarClock } from "lucide-react";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { useAdminToast } from "@/features/admin/components/admin-layout";

export function RulesPage() {
	const { toast } = useAdminToast();
	const [maxDuration, setMaxDuration] = useState(8);
	const [savedDuration, setSavedDuration] = useState(8);
	const hasChanges = maxDuration !== savedDuration;

	const handleSave = () => {
		setSavedDuration(maxDuration);
		toast("Booking rules updated", "success");
	};

	return (
		<div>
			<AdminHeader title="Booking Rules" />

			<div className="p-6">
				<div className="max-w-xl space-y-4">
					{/* ── Max duration card ── */}
					<div className="admin-rule-card">
						<div className="flex items-start gap-4">
							<div
								className="flex size-9 shrink-0 items-center justify-center rounded-lg"
								style={{
									background: "var(--a-accent-subtle)",
									border: "1px solid var(--a-accent-border)",
								}}
							>
								<Clock className="size-4" style={{ color: "var(--a-accent)" }} strokeWidth={1.6} />
							</div>
							<div className="flex-1">
								<h3
									className="text-sm font-semibold"
									style={{ color: "var(--a-text)" }}
								>
									Maximum booking duration
								</h3>
								<p
									className="mt-0.5 text-[0.8125rem] leading-relaxed"
									style={{ color: "var(--a-text-secondary)" }}
								>
									How long a single booking can last. Users won't be able to
									create bookings longer than this.
								</p>

								<div className="mt-4 flex items-center gap-3">
									<div className="relative">
										<input
											type="number"
											min={1}
											max={24}
											value={maxDuration}
											onChange={(e) =>
												setMaxDuration(
													Math.max(1, Math.min(24, Number(e.target.value))),
												)
											}
											className="admin-input tabular-nums w-20 text-center pr-0"
										/>
									</div>
									<span
										className="text-sm font-medium"
										style={{ color: "var(--a-text-secondary)" }}
									>
										hours
									</span>

									{hasChanges && (
										<button
											type="button"
											onClick={handleSave}
											className="ml-auto rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
											style={{
												background: "var(--a-accent)",
												color: "#fff",
											}}
										>
											Save
										</button>
									)}
								</div>

								{/* Duration slider */}
								<div className="mt-3">
									<input
										type="range"
										min={1}
										max={24}
										value={maxDuration}
										onChange={(e) => setMaxDuration(Number(e.target.value))}
										className="w-full accent-[var(--a-accent)]"
										style={{ height: 4 }}
									/>
									<div className="mt-1 flex justify-between text-[0.625rem] tabular-nums" style={{ color: "var(--a-text-muted)" }}>
										<span>1h</span>
										<span>6h</span>
										<span>12h</span>
										<span>18h</span>
										<span>24h</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ── Placeholder for future rules ── */}
					<div
						className="admin-rule-card flex items-center gap-4"
						style={{ opacity: 0.4 }}
					>
						<div
							className="flex size-9 shrink-0 items-center justify-center rounded-lg"
							style={{
								background: "var(--a-surface-2)",
								border: "1px solid var(--a-border)",
							}}
						>
							<CalendarClock
								className="size-4"
								style={{ color: "var(--a-text-muted)" }}
								strokeWidth={1.6}
							/>
						</div>
						<div>
							<h3
								className="text-sm font-semibold"
								style={{ color: "var(--a-text-secondary)" }}
							>
								More rules coming soon
							</h3>
							<p
								className="mt-0.5 text-[0.8125rem]"
								style={{ color: "var(--a-text-muted)" }}
							>
								Advance booking limits, recurring booking policies, and more.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
