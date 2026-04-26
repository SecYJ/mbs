import { Link, Outlet, linkOptions, useMatches } from "@tanstack/react-router";
import { Building2, Users, Settings, Wrench, CalendarDays, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useCallback, createContext, useContext } from "react";
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

export const AdminLayout = ({ user, onSignOut }: AdminLayoutProps) => {
    const matches = useMatches();
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = collapsed ? 72 : 240;
    let nextId = 0;

    const showToast = useCallback((message: string, variant: Toast["variant"] = "success") => {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 220);
        }, 3000);
    }, []);

    const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);

    return (
        <ToastContext.Provider value={{ toast: showToast }}>
            <SidebarContext.Provider value={{ collapsed, toggle: toggleSidebar }}>
                <div className="admin-shell flex min-h-dvh">
                    {/* ── Sidebar ── */}
                    <aside
                        className="admin-sidebar fixed inset-y-0 left-0 z-30 flex flex-col border-r"
                        data-collapsed={collapsed || undefined}
                        style={{
                            width: sidebarWidth,
                            background: "var(--a-surface-0)",
                            borderColor: "var(--a-border-hover)",
                        }}
                    >
                        {/* Logo + Collapse toggle */}
                        <div
                            className={`relative flex h-14 items-center ${collapsed ? "justify-center px-3" : "px-4"}`}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <div
                                    className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                                    style={{
                                        background: "linear-gradient(135deg, var(--a-accent) 0%, #4f46e5 100%)",
                                    }}
                                >
                                    <Building2 className="size-3.5 text-white" strokeWidth={2.2} />
                                </div>
                                <span
                                    className="admin-sidebar-label text-sm font-bold tracking-tight"
                                    style={{ color: "var(--a-text)" }}
                                >
                                    MRS Admin
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                aria-expanded={!collapsed}
                                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                className={`admin-sidebar-collapse-btn absolute top-3.5 z-10 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                                    collapsed ? "left-1/2 -translate-x-1/2" : "right-4"
                                }`}
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
                        </div>

                        {/* Nav */}
                        <nav className="mt-2 flex-1 space-y-0.5 px-3">
                            {navItems.map((item) => {
                                const isActive = matches.some((m) => m.fullPath.startsWith(item.to));
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="admin-nav-item"
                                        data-status={isActive ? "active" : undefined}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="size-4 shrink-0" strokeWidth={1.6} />
                                        <span className="admin-sidebar-label">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Admin account */}
                        <div
                            className="mx-3 mb-3 flex items-center gap-2.5 rounded-lg p-2.5 transition-colors"
                            style={{ background: "var(--a-surface-1)" }}
                        >
                            <div
                                className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                style={{
                                    background: "var(--a-accent-subtle)",
                                    color: "var(--a-accent)",
                                    border: "1px solid var(--a-accent-border)",
                                }}
                            >
                                {getInitials(user.name)}
                            </div>
                            <div className="admin-sidebar-label min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold" style={{ color: "var(--a-text)" }}>
                                    {user.name}
                                </p>
                                <p className="truncate text-[0.65rem]" style={{ color: "var(--a-text-muted)" }}>
                                    {user.email}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onSignOut}
                                aria-label="Sign out"
                                className="admin-sidebar-label flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
                                style={{ color: "var(--a-text-muted)" }}
                                title="Sign out"
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--a-danger)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--a-text-muted)")}
                            >
                                <LogOut className="size-3.5" strokeWidth={1.8} />
                            </button>
                        </div>
                    </aside>

                    {/* ── Main content ── */}
                    <main
                        className="admin-main flex-1 overflow-y-auto"
                        data-collapsed={collapsed || undefined}
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
            className="admin-toast flex items-center gap-2.5 rounded-lg px-4 py-3 shadow-lg"
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
