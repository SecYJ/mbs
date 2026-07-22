import type { ComponentType, ReactNode } from "react";

export const EmptyState = ({
    icon: Icon,
    eyebrow,
    title,
    description,
    action,
}: {
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) => (
    <section className="animate-fade-up animation-duration-700 border-y border-(--hairline) py-16 [animation-delay:400ms]">
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center">
            <div className="relative mb-6 flex size-20 items-center justify-center border border-(--hairline) bg-(--surface-01)">
                <span aria-hidden className="absolute inset-3 border border-dashed border-(--hairline)" />
                <Icon className="relative size-7 text-(--gold)" strokeWidth={1.35} />
            </div>
            <p className="eyebrow text-(--gold)">{eyebrow}</p>
            <h2 className="display-italic mt-3 text-[clamp(1.8rem,3vw,2.4rem)] leading-none text-(--bone)">{title}</h2>
            <p className="mt-4 max-w-md text-[0.86rem] leading-relaxed text-(--bone-muted)">{description}</p>
            {action && <div className="mt-7">{action}</div>}
        </div>
    </section>
);
