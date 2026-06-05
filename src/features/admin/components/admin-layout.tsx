import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";
import { adminNavItems } from "@/features/admin/constants/navigation";
import { useSignOut } from "@/features/account/hooks/useSignOut";
import { cn } from "@/lib/utils";
import { Link, Outlet, useRouteContext } from "@tanstack/react-router";
import { ArrowLeft, Building2, ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { useReducer, type ReactNode } from "react";
// oxlint-disable-next-line import/no-unassigned-import -- Admin stylesheet is imported for its side effects.
import "@/features/admin/admin.css";

const getInitials = (name: string) =>
    name
        .split(" ")
        .flatMap((part) => (part[0] ? [part[0]] : []))
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

const sidebarLabelClasses =
    "overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-collapsed:pointer-events-none group-data-collapsed:w-0 group-data-collapsed:opacity-0";

const navItemClasses =
    "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-(--a-text-secondary) no-underline transition-[color,background-color,justify-content] duration-150 hover:bg-(--a-surface-2) hover:text-(--a-text) data-[status=active]:bg-(--a-accent-subtle) data-[status=active]:font-semibold data-[status=active]:text-(--a-accent) [&[data-status=active]_svg]:text-(--a-accent) group-data-collapsed:justify-center group-data-collapsed:gap-0 group-data-collapsed:p-2";

export const AdminLayout = () => {
    const [collapsed, onCollapsedChange] = useReducer((s) => !s, false);
    const sidebarWidth = collapsed ? 72 : 240;
    const sidebarToggle = <AdminSidebarToggle collapsed={collapsed} onToggle={onCollapsedChange} />;

    return (
        <div className="admin-shell flex h-dvh">
            <aside
                data-collapsed={collapsed ? "" : undefined}
                className="group sticky top-0 bottom-0 z-30 grid flex-none grid-rows-[auto_1fr_auto] overflow-hidden border-r border-(--a-border-hover) bg-(--a-surface-0) transition-[width] duration-300 ease-in-out"
                style={{ width: sidebarWidth }}
            >
                <AdminSidebarBrand collapsed={collapsed} sidebarToggle={sidebarToggle} />
                <AdminSidebarNav />
                {collapsed ? <div className="mb-2 flex justify-center px-3">{sidebarToggle}</div> : null}
                <AdminAccountMenu collapsed={collapsed} />
            </aside>

            <main className="min-w-0 flex-1 overflow-y-auto bg-(--a-bg)">
                <Outlet />
            </main>

            <Toaster className="admin-shell" position="bottom-right" />
        </div>
    );
};

const AdminSidebarToggle = ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => (
    <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggle}
        className="admin-sidebar-collapse-btn flex size-7 shrink-0 items-center justify-center rounded-md text-(--a-text-muted) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text)"
    >
        {collapsed ? (
            <ChevronsRight className="size-4.5" strokeWidth={1.8} />
        ) : (
            <ChevronsLeft className="size-4.5" strokeWidth={1.8} />
        )}
    </button>
);

const AdminSidebarBrand = ({ collapsed, sidebarToggle }: { collapsed: boolean; sidebarToggle: ReactNode }) => (
    <div className={cn("flex h-14 items-center", collapsed ? "justify-center px-3" : "justify-between px-4")}>
        <div className="flex min-w-0 items-center gap-2.5">
            <div
                className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                    background: "linear-gradient(135deg, var(--a-accent) 0%, #4f46e5 100%)",
                }}
            >
                <Building2 className="size-3.5 text-white" strokeWidth={2.2} />
            </div>
            <span className={cn(sidebarLabelClasses, "text-sm font-bold tracking-tight text-(--a-text)")}>
                MRS Admin
            </span>
        </div>
        {collapsed ? null : sidebarToggle}
    </div>
);

const AdminSidebarNav = () => (
    <nav className="mt-2 flex-1 space-y-0.5 px-3">
        <Link to="/bookings" activeOptions={{ includeSearch: false }} className={navItemClasses}>
            <ArrowLeft className="size-4 shrink-0" strokeWidth={1.6} />
            <span className={sidebarLabelClasses}>Back to bookings</span>
        </Link>
        {adminNavItems.map((item) => (
            <Link key={item.to} {...item} className={navItemClasses}>
                <item.icon className="size-4 shrink-0" strokeWidth={1.6} />
                <span className={sidebarLabelClasses}>{item.label}</span>
            </Link>
        ))}
    </nav>
);

const AdminAccountMenu = ({ collapsed }: { collapsed: boolean }) => {
    const { user } = useRouteContext({ from: "/admin" });
    const { signOut } = useSignOut();

    return (
        <Popover>
            <PopoverTrigger
                type="button"
                aria-label="Account"
                className={cn(
                    "mx-3 mb-3 flex cursor-pointer items-center rounded-lg border-0 bg-(--a-surface-1) text-left transition-colors hover:bg-(--a-surface-2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a-accent)",
                    collapsed ? "justify-center p-2" : "gap-2.5 p-2.5",
                )}
            >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-(--a-accent-border) bg-(--a-accent-subtle) text-xs font-bold text-(--a-accent)">
                    {getInitials(user.name)}
                </span>
                <span className={cn(sidebarLabelClasses, "min-w-0 flex-1")}>
                    <span className="block truncate text-xs font-semibold text-(--a-text)">{user.name}</span>
                    <span className="block truncate text-[0.65rem] text-(--a-text-muted)">{user.email}</span>
                </span>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                side={collapsed ? "right" : "top"}
                sideOffset={collapsed ? 10 : 8}
                positionMethod="fixed"
                className="admin-shell w-56 rounded-lg border border-(--a-border-hover) bg-(--a-surface-1) p-1 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            >
                <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-xs font-semibold text-(--a-text-secondary) transition-colors hover:bg-(--a-surface-2)"
                >
                    <LogOut className="size-3.5" strokeWidth={1.8} />
                    <span>Sign out</span>
                </button>
            </PopoverContent>
        </Popover>
    );
};
