import { Link, Outlet, linkOptions, useMatches } from "@tanstack/react-router";
import { ArrowLeft, Building2, Users, Settings, Wrench, CalendarDays, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useRef, createContext, useContext } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { adminToastClasses } from "@/features/admin/admin-classes";
import "@/features/admin/admin.css";

/* ── Toast context ── */

interface Toast {
    id: number;
    message: string;
    variant: "success" | "danger" | "info";
    leaving?: boolean;
}

interface ToastCtx {
    toast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useAdminToast = () => useContext(ToastContext);

/* ── Sidebar context ── */

interface SidebarCtx {
    collapsed: boolean;
    toggle: () => void;
}

const SidebarContext = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

/* ── Nav config ── */

const navItems = linkOptions([
    { to: "/admin/rooms", label: "Rooms", icon: Building2 },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/rules", label: "Rules", icon: Settings },
    { to: "/admin/equipment", label: "Equipment", icon: Wrench },
    { to: "/admin/bookings", label: "All Bookings", icon: CalendarDays },
]);

/* ── Layout ── */

interface AdminLayoutProps {
    user: { name: string; email: string };
    onSignOut: () => void;
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

const sidebarLabelClasses =
    "overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsed]:pointer-events-none group-data-[collapsed]:w-0 group-data-[collapsed]:opacity-0";

const navItemClasses =
    "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-(--a-text-secondary) no-underline transition-[color,background-color,justify-content] duration-150 hover:bg-(--a-surface-2) hover:text-(--a-text) data-[status=active]:bg-(--a-accent-subtle) data-[status=active]:font-semibold data-[status=active]:text-(--a-accent) [&[data-status=active]_svg]:text-(--a-accent) group-data-[collapsed]:justify-center group-data-[collapsed]:gap-0 group-data-[collapsed]:p-2";

export const AdminLayout = ({ user, onSignOut }: AdminLayoutProps) => {
    const matches = useMatches();
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const nextToastId = useRef(0);
    const sidebarWidth = collapsed ? 72 : 240;

    const showToast = (message: string, variant: Toast["variant"] = "success") => {
        const id = ++nextToastId.current;
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 220);
        }, 3000);
    };

    const toggleSidebar = () => setCollapsed((c) => !c);
    const sidebarToggle = (
        <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="admin-sidebar-collapse-btn flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--a-text-muted)" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--a-surface-2)";
                e.currentTarget.style.color = "var(--a-text)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--a-text-muted)";
            }}
        >
            {collapsed ? (
                <ChevronsRight className="size-[1.125rem]" strokeWidth={1.8} />
            ) : (
                <ChevronsLeft className="size-[1.125rem]" strokeWidth={1.8} />
            )}
        </button>
    );

    return (
        <ToastContext.Provider value={{ toast: showToast }}>
            <SidebarContext.Provider value={{ collapsed, toggle: toggleSidebar }}>
                <div className="admin-shell flex h-dvh">
                    {/* ── Sidebar ── */}
                    <aside
                        className="group fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                        data-collapsed={collapsed || undefined}
                        style={{
                            width: sidebarWidth,
                            background: "var(--a-surface-0)",
                            borderColor: "var(--a-border-hover)",
                        }}
                    >
                        {/* Logo + Collapse toggle */}
                        <div
                            className={`flex h-14 items-center ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div
                                    className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                                    style={{
                                        background: "linear-gradient(135deg, var(--a-accent) 0%, #4f46e5 100%)",
                                    }}
                                >
                                    <Building2 className="size-3.5 text-white" strokeWidth={2.2} />
                                </div>
                                <span
                                    className={`${sidebarLabelClasses} text-sm font-bold tracking-tight`}
                                    style={{ color: "var(--a-text)" }}
                                >
                                    MRS Admin
                                </span>
                            </div>
                            {!collapsed && sidebarToggle}
                        </div>

                        {/* Nav */}
                        <nav className="mt-2 flex-1 space-y-0.5 px-3">
                            <Link
                                to="/bookings"
                                className={navItemClasses}
                                title={collapsed ? "Back to bookings" : undefined}
                            >
                                <ArrowLeft className="size-4 shrink-0" strokeWidth={1.6} />
                                <span className={sidebarLabelClasses}>Back to bookings</span>
                            </Link>
                            {navItems.map((item) => {
                                const isActive = matches.some((m) => m.fullPath.startsWith(item.to));
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={navItemClasses}
                                        data-status={isActive ? "active" : undefined}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="size-4 shrink-0" strokeWidth={1.6} />
                                        <span className={sidebarLabelClasses}>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {collapsed && <div className="mb-2 flex justify-center px-3">{sidebarToggle}</div>}

                        {/* Admin account */}
                        <Popover>
                            <PopoverTrigger
                                type="button"
                                aria-label="Account"
                                className={`mx-3 mb-3 flex cursor-pointer items-center rounded-lg border-0 text-left transition-colors hover:bg-(--a-surface-2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--a-accent) ${
                                    collapsed ? "justify-center p-2" : "gap-2.5 p-2.5"
                                }`}
                                style={{ background: "var(--a-surface-1)" }}
                            >
                                <span
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                    style={{
                                        background: "var(--a-accent-subtle)",
                                        color: "var(--a-accent)",
                                        border: "1px solid var(--a-accent-border)",
                                    }}
                                >
                                    {getInitials(user.name)}
                                </span>
                                <span className={`${sidebarLabelClasses} min-w-0 flex-1`}>
                                    <span
                                        className="block truncate text-xs font-semibold"
                                        style={{ color: "var(--a-text)" }}
                                    >
                                        {user.name}
                                    </span>
                                    <span
                                        className="block truncate text-[0.65rem]"
                                        style={{ color: "var(--a-text-muted)" }}
                                    >
                                        {user.email}
                                    </span>
                                </span>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                side={collapsed ? "right" : "top"}
                                sideOffset={collapsed ? 10 : 8}
                                positionMethod="fixed"
                                className="admin-shell w-56 rounded-lg border p-1 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                                style={{
                                    background: "var(--a-surface-1)",
                                    borderColor: "var(--a-border-hover)",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={onSignOut}
                                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-(--a-surface-2)"
                                    style={{ color: "var(--a-text-secondary)" }}
                                >
                                    <LogOut className="size-3.5" strokeWidth={1.8} />
                                    <span>Sign out</span>
                                </button>
                            </PopoverContent>
                        </Popover>
                    </aside>

                    {/* ── Main content ── */}
                    <main
                        className="flex-1 overflow-y-auto transition-[margin-left] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{
                            marginLeft: sidebarWidth,
                            background: "var(--a-bg)",
                        }}
                    >
                        <Outlet />
                    </main>

                    {/* ── Toast container ── */}
                    {toasts.length > 0 && (
                        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
                            {toasts.map((t) => (
                                <ToastItem key={t.id} toast={t} />
                            ))}
                        </div>
                    )}
                </div>
            </SidebarContext.Provider>
        </ToastContext.Provider>
    );
};

function ToastItem({ toast }: { toast: Toast }) {
    const colorMap = {
        success: {
            bg: "var(--a-surface-2)",
            border: "rgba(52,211,153,0.25)",
            dot: "var(--a-success)",
        },
        danger: {
            bg: "var(--a-surface-2)",
            border: "rgba(196,64,64,0.25)",
            dot: "var(--a-danger)",
        },
        info: {
            bg: "var(--a-surface-2)",
            border: "rgba(83,155,245,0.25)",
            dot: "var(--a-info)",
        },
    };
    const c = colorMap[toast.variant];

    return (
        <div
            className={`${adminToastClasses} flex items-center gap-2.5 rounded-lg px-4 py-3 shadow-lg`}
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                minWidth: 260,
            }}
            data-leaving={toast.leaving || undefined}
        >
            <span className="size-2 shrink-0 rounded-full" style={{ background: c.dot }} />
            <span className="text-[0.8125rem] font-medium" style={{ color: "var(--a-text)" }}>
                {toast.message}
            </span>
        </div>
    );
}
