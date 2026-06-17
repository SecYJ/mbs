import { adminSkeletonClasses } from "@/features/admin/admin-classes";
import { cn } from "@/lib/utils";

const statTones = [
    { background: "var(--a-accent-subtle)", border: "1px solid var(--a-accent-border)" },
    { background: "var(--a-info-subtle)", border: "1px solid rgba(83,155,245,0.2)" },
    { background: "var(--a-success-subtle)", border: "1px solid rgba(52,211,153,0.2)" },
] as const;

const tableColumns = ["12%", "10%", "20%", "14%", "14%", "8%", "10%", "12%"] as const;

const STATUS_COLUMN = 6;

const tableRows = [
    ["72%", "84%", "88%", "64%", "76%", "42%", "", "58%"],
    ["58%", "70%", "64%", "78%", "60%", "36%", "", "58%"],
    ["66%", "76%", "92%", "56%", "70%", "44%", "", "58%"],
    ["74%", "66%", "70%", "82%", "64%", "38%", "", "58%"],
    ["60%", "80%", "84%", "62%", "74%", "46%", "", "58%"],
    ["70%", "72%", "76%", "70%", "58%", "40%", "", "58%"],
    ["64%", "78%", "68%", "74%", "72%", "34%", "", "58%"],
] as const;

const fadeUpClasses = "animate-[fade-up_480ms_cubic-bezier(0.16,1,0.3,1)_both]";

export const AdminPending = () => {
    return (
        <div aria-busy="true" aria-live="polite" aria-label="Loading page">
            <header className="sticky top-0 z-20 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-(--a-border-hover) bg-[rgba(15,17,23,0.88)] px-6 backdrop-blur-sm">
                <div />
                <div className={cn(adminSkeletonClasses, "h-3.5 w-36")} />
                <div className="flex items-center justify-end">
                    <div className={cn(adminSkeletonClasses, "h-7 w-28 rounded-md")} />
                </div>
                <div className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                    <div className="h-full w-1/5 animate-[admin-pending-bar_1.4s_ease-in-out_infinite] bg-(--a-accent) motion-reduce:animate-none" />
                </div>
            </header>

            <div className="p-6">
                <div className="mb-6 grid grid-cols-3 gap-4">
                    {statTones.map((tone, index) => (
                        <div
                            key={tone.background}
                            className={cn(
                                fadeUpClasses,
                                "rounded-xl border border-(--a-border) bg-(--a-surface-0) p-4",
                            )}
                            style={{ animationDelay: `${index * 70}ms` }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-9 shrink-0 rounded-lg" style={tone} />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className={cn(adminSkeletonClasses, "h-4 w-12")} />
                                    <div className={cn(adminSkeletonClasses, "h-2.5 w-24")} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    className={cn(
                        fadeUpClasses,
                        "mb-4 flex items-center gap-3 rounded-lg border border-(--a-border) bg-(--a-surface-0) px-4 py-3",
                    )}
                    style={{ animationDelay: "140ms" }}
                >
                    <div className={cn(adminSkeletonClasses, "h-3 w-48")} />
                    <div className="ml-auto flex items-center gap-3">
                        <div className={cn(adminSkeletonClasses, "h-6 w-28 rounded-md")} />
                        <div className={cn(adminSkeletonClasses, "h-6 w-24 rounded-md")} />
                    </div>
                </div>

                <div
                    className={cn(
                        fadeUpClasses,
                        "overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)",
                    )}
                    style={{ animationDelay: "200ms" }}
                >
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {tableColumns.map((width, columnIndex) => (
                                    <th key={columnIndex} style={{ width }}>
                                        <div className={cn(adminSkeletonClasses, "h-2 w-3/5 max-w-16")} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="animate-[fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]"
                                    style={{ animationDelay: `${260 + rowIndex * 60}ms` }}
                                >
                                    {row.map((width, columnIndex) => (
                                        <td key={columnIndex}>
                                            {columnIndex === STATUS_COLUMN ? (
                                                <div className={cn(adminSkeletonClasses, "h-5 w-17 rounded-full")} />
                                            ) : (
                                                <div className={cn(adminSkeletonClasses, "h-3")} style={{ width }} />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
