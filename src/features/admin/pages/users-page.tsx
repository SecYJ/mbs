import { useState, useMemo } from "react";
import { Users, Shield, ShieldOff, KeyRound, UserX, UserCheck, Check, X } from "lucide-react";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { useAdminToast } from "@/features/admin/components/admin-layout";

/* ── Mock data ── */

interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    active: boolean;
    lastLogin: string;
    avatarColor: string;
}

const initialUsers: User[] = [
    {
        id: "1",
        name: "Alice Chen",
        email: "alice@company.com",
        role: "admin",
        active: true,
        lastLogin: "2 hours ago",
        avatarColor: "#e4a441",
    },
    {
        id: "2",
        name: "Bob Wang",
        email: "bob@company.com",
        role: "user",
        active: true,
        lastLogin: "1 day ago",
        avatarColor: "#539bf5",
    },
    {
        id: "3",
        name: "Carol Liu",
        email: "carol@company.com",
        role: "user",
        active: false,
        lastLogin: "30 days ago",
        avatarColor: "#34d399",
    },
    {
        id: "4",
        name: "David Zhang",
        email: "david@company.com",
        role: "admin",
        active: true,
        lastLogin: "5 min ago",
        avatarColor: "#c084fc",
    },
    {
        id: "5",
        name: "Eve Huang",
        email: "eve@company.com",
        role: "user",
        active: true,
        lastLogin: "3 hours ago",
        avatarColor: "#f97066",
    },
    {
        id: "6",
        name: "Frank Li",
        email: "frank@company.com",
        role: "user",
        active: true,
        lastLogin: "6 hours ago",
        avatarColor: "#2dd4bf",
    },
];

type SortField = "name" | "email" | "role" | "lastLogin";
type SortDir = "asc" | "desc" | null;

export function UsersPage() {
    const { toast } = useAdminToast();
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [confirmAction, setConfirmAction] = useState<{
        userId: string;
        type: "reset" | "toggleAdmin" | "toggleActive";
    } | null>(null);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
            if (sortDir === "desc") setSortField(null);
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const filtered = useMemo(() => {
        let list = users;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
        }
        if (sortField && sortDir) {
            list = [...list].sort((a, b) => {
                const cmp = String(a[sortField]).localeCompare(String(b[sortField]));
                return sortDir === "asc" ? cmp : -cmp;
            });
        }
        return list;
    }, [users, search, sortField, sortDir]);

    const handleConfirm = () => {
        if (!confirmAction) return;
        const { userId, type } = confirmAction;
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        if (type === "reset") {
            toast(`Password reset link sent to ${user.email}`, "success");
        } else if (type === "toggleAdmin") {
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u)),
            );
            toast(`${user.name} is now ${user.role === "admin" ? "a regular user" : "an admin"}`, "success");
        } else if (type === "toggleActive") {
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)));
            toast(`${user.name}'s account ${user.active ? "disabled" : "enabled"}`, user.active ? "danger" : "success");
        }
        setConfirmAction(null);
    };

    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sortField !== field || !sortDir) return null;
        return (
            <span className="ml-1 text-[0.5rem]" style={{ color: "var(--a-accent)" }}>
                {sortDir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div>
            <AdminHeader
                title="Users"
                searchPlaceholder="Search users..."
                searchValue={search}
                onSearchChange={setSearch}
            />

            <div className="p-6">
                {filtered.length === 0 && !search ? (
                    <EmptyState
                        icon={Users}
                        title="No users found"
                        description="Users who register for the booking system will appear here."
                    />
                ) : filtered.length === 0 ? (
                    <p className="py-12 text-center text-sm" style={{ color: "var(--a-text-muted)" }}>
                        No users match "{search}"
                    </p>
                ) : (
                    <div
                        className="overflow-hidden rounded-xl border"
                        style={{
                            borderColor: "var(--a-border-hover)",
                            background: "var(--a-surface-0)",
                        }}
                    >
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th data-sortable onClick={() => toggleSort("name")} style={{ width: "24%" }}>
                                        User <SortIndicator field="name" />
                                    </th>
                                    <th data-sortable onClick={() => toggleSort("email")} style={{ width: "22%" }}>
                                        Email <SortIndicator field="email" />
                                    </th>
                                    <th data-sortable onClick={() => toggleSort("role")} style={{ width: "10%" }}>
                                        Role <SortIndicator field="role" />
                                    </th>
                                    <th style={{ width: "10%" }}>Status</th>
                                    <th data-sortable onClick={() => toggleSort("lastLogin")} style={{ width: "14%" }}>
                                        Last Login <SortIndicator field="lastLogin" />
                                    </th>
                                    <th style={{ width: "20%" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} style={{ opacity: user.active ? 1 : 0.55 }}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold"
                                                    style={{
                                                        background: `${user.avatarColor}18`,
                                                        color: user.avatarColor,
                                                    }}
                                                >
                                                    {user.name
                                                        .split(" ")
                                                        .map((w) => w[0])
                                                        .join("")}
                                                </div>
                                                <span className="font-medium" style={{ color: "var(--a-text)" }}>
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--a-text-secondary)" }}>{user.email}</td>
                                        <td>
                                            <span
                                                className="admin-badge"
                                                style={
                                                    user.role === "admin"
                                                        ? {
                                                              background: "var(--a-accent-subtle)",
                                                              color: "var(--a-accent)",
                                                              border: "1px solid var(--a-accent-border)",
                                                          }
                                                        : {
                                                              background: "var(--a-surface-2)",
                                                              color: "var(--a-text-secondary)",
                                                              border: "1px solid var(--a-border)",
                                                          }
                                                }
                                            >
                                                {user.role === "admin" ? "Admin" : "User"}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="inline-flex items-center gap-1.5 text-xs font-medium"
                                                style={{
                                                    color: user.active ? "var(--a-success)" : "var(--a-text-muted)",
                                                }}
                                            >
                                                <span
                                                    className="size-1.5 rounded-full"
                                                    style={{
                                                        background: user.active
                                                            ? "var(--a-success)"
                                                            : "var(--a-text-muted)",
                                                    }}
                                                />
                                                {user.active ? "Active" : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="tabular-nums" style={{ color: "var(--a-text-muted)" }}>
                                            {user.lastLogin}
                                        </td>
                                        <td>
                                            {confirmAction?.userId === user.id ? (
                                                <InlineConfirm
                                                    type={confirmAction.type}
                                                    onConfirm={handleConfirm}
                                                    onCancel={() => setConfirmAction(null)}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <ActionButton
                                                        icon={KeyRound}
                                                        label="Reset password"
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                userId: user.id,
                                                                type: "reset",
                                                            })
                                                        }
                                                    />
                                                    <ActionButton
                                                        icon={user.role === "admin" ? ShieldOff : Shield}
                                                        label={user.role === "admin" ? "Remove admin" : "Make admin"}
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                userId: user.id,
                                                                type: "toggleAdmin",
                                                            })
                                                        }
                                                    />
                                                    <ActionButton
                                                        icon={user.active ? UserX : UserCheck}
                                                        label={user.active ? "Disable account" : "Enable account"}
                                                        danger={user.active}
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                userId: user.id,
                                                                type: "toggleActive",
                                                            })
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Action button ── */

function ActionButton({
    icon: Icon,
    label,
    danger,
    onClick,
}: {
    icon: typeof Shield;
    label: string;
    danger?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            title={label}
            onClick={onClick}
            className="flex size-7 items-center justify-center rounded-md transition-colors"
            style={{ color: danger ? "var(--a-danger)" : "var(--a-text-muted)" }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = danger ? "var(--a-danger-subtle)" : "var(--a-surface-2)";
                if (!danger) e.currentTarget.style.color = "var(--a-text-secondary)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = danger ? "var(--a-danger)" : "var(--a-text-muted)";
            }}
        >
            <Icon className="size-3.5" strokeWidth={1.6} />
        </button>
    );
}

/* ── Inline confirm ── */

function InlineConfirm({
    type,
    onConfirm,
    onCancel,
}: {
    type: "reset" | "toggleAdmin" | "toggleActive";
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const labels = {
        reset: "Reset password?",
        toggleAdmin: "Change role?",
        toggleActive: "Change status?",
    };

    return (
        <div className="admin-confirm flex items-center gap-2">
            <span className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-secondary)" }}>
                {labels[type]}
            </span>
            <button
                type="button"
                onClick={onConfirm}
                className="flex size-6 items-center justify-center rounded-md transition-colors"
                style={{
                    background: "var(--a-success-subtle)",
                    color: "var(--a-success)",
                }}
            >
                <Check className="size-3.5" strokeWidth={2} />
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="flex size-6 items-center justify-center rounded-md transition-colors"
                style={{
                    background: "var(--a-surface-2)",
                    color: "var(--a-text-muted)",
                }}
            >
                <X className="size-3.5" strokeWidth={2} />
            </button>
        </div>
    );
}
