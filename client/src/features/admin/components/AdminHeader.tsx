import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    title: string;
}>;

export const AdminHeader = ({ title, children }: Props) => {
    return (
        <header className="sticky top-0 z-20 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-(--a-border-hover) bg-[#0F1117E0] px-6 backdrop-blur-sm">
            <div />
            <h1 className="text-center text-[0.9375rem] font-bold tracking-tight text-(--a-text)">{title}</h1>
            <div className="flex items-center justify-end gap-3">{children}</div>
        </header>
    );
};
