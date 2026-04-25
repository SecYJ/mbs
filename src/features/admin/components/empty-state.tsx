import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            {/* Geometric frame */}
            <div className="relative mb-6 size-28">
                <svg viewBox="0 0 120 120" className="size-full" style={{ color: "var(--a-text-muted)" }} aria-hidden>
                    <rect
                        x="18"
                        y="18"
                        width="84"
                        height="84"
                        rx="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        opacity="0.25"
                    />
                    <rect
                        x="28"
                        y="28"
                        width="64"
                        height="64"
                        rx="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        opacity="0.12"
                        strokeDasharray="4 4"
                    />
                    <line x1="60" y1="6" x2="60" y2="18" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                    <line x1="60" y1="102" x2="60" y2="114" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                    <line x1="6" y1="60" x2="18" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                    <line x1="102" y1="60" x2="114" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
                    <circle cx="60" cy="60" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.1" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="size-8" strokeWidth={1.2} style={{ color: "var(--a-text-muted)" }} />
                </div>
            </div>

            <h3 className="text-base font-semibold" style={{ color: "var(--a-text)" }}>
                {title}
            </h3>
            <p
                className="mt-1.5 max-w-xs text-center text-sm leading-relaxed"
                style={{ color: "var(--a-text-secondary)" }}
            >
                {description}
            </p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
