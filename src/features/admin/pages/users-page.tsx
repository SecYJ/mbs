import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Users, Shield, ShieldOff, KeyRound, UserX, UserCheck, Check, X, Plus, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { adminBadgeClasses, adminConfirmClasses } from "@/features/admin/admin-classes";
import { CreateUserDialog } from "@/features/admin/components/create-user-dialog";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { useAdminToast } from "@/features/admin/components/admin-layout";
import { usersQueryOptions } from "@/features/admin/services/users/queries";

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    active: boolean;
    lastLogin: string;
    lastLoginAt: string | null;
    image: string | null;
    avatarColor: string;
}

type SortField = "name" | "email" | "role" | "lastLogin";

export const UsersPage = () => {
    const { toast } = useAdminToast();
    const { data: users } = useSuspenseQuery(usersQueryOptions());
    const { q = "", sort, dir } = useSearch({ from: "/admin/users" });
    const navigate = useNavigate({ from: "/admin/users" });
    const [createOpen, setCreateOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        userId: string;
        type: "reset" | "toggleAdmin" | "toggleActive";
    } | null>(null);

    const toggleSort = (field: SortField) => {
        navigate({
            search: (prev) => {
                if (prev.sort !== field) return { ...prev, sort: field, dir: "asc" };
                if (prev.dir === "asc") return { ...prev, sort: field, dir: "desc" };
                return { ...prev, sort: undefined, dir: undefined };
            },
            replace: true,
        });
    };

    const setSearch = (value: string) => {
        navigate({
            search: (prev) => ({ ...prev, q: value || undefined }),
            replace: true,
        });
    };

    let filtered = users;
    if (q) {
        const needle = q.toLowerCase();
        filtered = filtered.filter(
            (u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
        );
    }
    if (sort && dir) {
        // oxlint-disable-next-line unicorn/no-array-sort -- tsconfig targets ES2022, so Array#toSorted is not typed.
        filtered = [...filtered].sort((a, b) => {
            if (sort === "lastLogin") {
                const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
                const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
                return dir === "asc" ? aTime - bTime : bTime - aTime;
            }

            const cmp = String(a[sort]).localeCompare(String(b[sort]));
            return dir === "asc" ? cmp : -cmp;
        });
    }

    const handleConfirm = () => {
        if (!confirmAction) return;
        const { userId, type } = confirmAction;
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        if (type === "reset") {
            toast(`Password reset for ${user.email} is not wired up yet`, "info");
        } else if (type === "toggleAdmin") {
            toast(`Role management for ${user.name} is not wired up yet`, "info");
        } else if (type === "toggleActive") {
            toast(`Account status management for ${user.name} is not wired up yet`, "info");
        }
        setConfirmAction(null);
    };

    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sort !== field || !dir) return null;
        return (
            <span className="ml-1 text-[0.5rem]" style={{ color: "var(--a-accent)" }}>
                {dir === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div>
            <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
            <AdminHeader title="Users" searchPlaceholder="Search users..." searchValue={q} onSearchChange={setSearch}>
                <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
                >
                    <Plus className="size-3.5" strokeWidth={2.2} />
                    New User
                </button>
            </AdminHeader>

            <div className="p-6">
                {filtered.length === 0 && !q ? (
                    <EmptyState
                        icon={Users}
                        title="No users found"
                        description="Users who register for the booking system will appear here."
                        action={<EmptyStateCreateUserButton onClick={() => setCreateOpen(true)} />}
                    />
                ) : filtered.length === 0 ? (
                    <p className="py-12 text-center text-sm" style={{ color: "var(--a-text-muted)" }}>
                        No users match "{q}"
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
                                                {user.image ? (
                                                    <img
                                                        className="size-7 shrink-0 rounded-full object-cover"
                                                        src={user.image}
                                                        alt=""
                                                    />
                                                ) : (
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
                                                )}
                                                <span className="font-medium" style={{ color: "var(--a-text)" }}>
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--a-text-secondary)" }}>{user.email}</td>
                                        <td>
                                            <span
                                                className={adminBadgeClasses}
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
};

const EmptyStateCreateUserButton = ({ onClick }: { onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
    >
        <Plus className="size-4" strokeWidth={2} />
        Create User
    </button>
);

/* ── Action button ── */

const ActionButton = ({
    icon: Icon,
    label,
    danger,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    danger?: boolean;
    onClick: () => void;
}) => {
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
};

/* ── Inline confirm ── */

const InlineConfirm = ({
    type,
    onConfirm,
    onCancel,
}: {
    type: "reset" | "toggleAdmin" | "toggleActive";
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    const labels = {
        reset: "Reset password?",
        toggleAdmin: "Change role?",
        toggleActive: "Change status?",
    };

    return (
        <div className={`${adminConfirmClasses} flex items-center gap-2`}>
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
};
