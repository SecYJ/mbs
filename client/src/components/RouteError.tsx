import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { RotateCcw, TriangleAlert } from "lucide-react";

// Router-level fallback for a failed page inside the authenticated layout: the nav bar stays
// usable while the content area shows the error.
export const RouteError = ({ error, reset }: ErrorComponentProps) => {
    const router = useRouter();

    // reset() clears the error boundary; invalidate() re-runs the failed loaders.
    const retry = () => {
        reset();
        router.invalidate();
    };

    return (
        <section
            role="alert"
            className="mx-auto flex min-h-80 w-full max-w-xl flex-col items-center justify-center border border-dashed border-(--hairline) px-6 py-10 text-center"
        >
            <TriangleAlert className="size-8 text-(--gold)" strokeWidth={1.4} />
            <h2 className="mt-5 text-lg font-semibold text-(--bone)">This page could not be loaded</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-(--bone-muted)">{error.message}</p>
            <button
                type="button"
                onClick={retry}
                className="mt-6 inline-flex h-10 cursor-pointer items-center gap-2 border border-(--hairline-strong) px-4 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-muted) uppercase transition-colors hover:border-(--bone) hover:text-(--bone)"
            >
                <RotateCcw className="size-3.5" strokeWidth={1.6} />
                <span>Try again</span>
            </button>
        </section>
    );
};
