import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface AdminHeaderProps {
    title: string;
    action?: ReactNode;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

export function AdminHeader({
    title,
    action,
    searchPlaceholder = "Search...",
    searchValue,
    onSearchChange,
}: AdminHeaderProps) {
    return (
        <header
            className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b px-6"
            style={{
                background: "rgba(15,17,23,0.88)",
                backdropFilter: "blur(12px)",
                borderColor: "var(--a-border-hover)",
            }}
        >
            <div className="flex items-center gap-2.5">
                <h1 className="text-[0.9375rem] font-bold tracking-tight" style={{ color: "var(--a-text)" }}>
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {onSearchChange && (
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2"
                            style={{ color: "var(--a-text-muted)" }}
                            strokeWidth={1.8}
                        />
                        <input
                            type="text"
                            className="admin-input"
                            style={{ width: 200, paddingLeft: "2rem" }}
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                )}
                {action}
            </div>
        </header>
    );
}
