import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { RotateCcw, TriangleAlert } from "lucide-react";

// Error fallback for admin pages; keeps the admin sidebar visible.
export const AdminError = ({ error, reset }: ErrorComponentProps) => {
    const router = useRouter();

    // reset() clears the error boundary; invalidate() re-runs the failed loaders.
    const retry = () => {
        reset();
        router.invalidate();
    };

    return (
        <div role="alert" className="flex flex-col items-center justify-center px-6 py-24 text-center">
            <TriangleAlert className="size-8 text-(--a-text-muted)" strokeWidth={1.2} />
            <h2 className="mt-5 text-base font-semibold text-(--a-text)">This page could not be loaded</h2>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-(--a-text-secondary)">{error.message}</p>
            <button
                type="button"
                onClick={retry}
                className="mt-6 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-(--a-border-hover) bg-(--a-surface-1) px-4 text-[0.8125rem] font-semibold text-(--a-text-secondary) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text)"
            >
                <RotateCcw className="size-3.5" strokeWidth={1.8} />
                <span>Try again</span>
            </button>
        </div>
    );
};
