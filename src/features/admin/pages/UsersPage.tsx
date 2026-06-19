import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { Plus, Users } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { adminBadgeClasses } from "@/features/admin/admin-classes";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminSearchInput } from "@/features/admin/components/AdminSearchInput";
import { CreateUserDialog } from "@/features/admin/components/CreateUserDialog";
import { EmptyState } from "@/features/admin/components/EmptyState";
import { usersSearchDefaults } from "@/features/admin/schema/users-search.schema";
import { userQueries } from "@/features/admin/services/users/queries";
import type { AdminUser } from "@/features/admin/types";
import { isSuperAdminRole, USER_ROLE_LABELS, type UserRole } from "@/lib/roles";

type SortField = "name" | "email" | "role" | "lastLogin";
type SortDirection = "asc" | "desc";
type AdminUserRow = Omit<AdminUser, "lastLogin"> & { createdAt: string };

const Route = getRouteApi("/admin");

const selectAdminUsers = (rows: AdminUserRow[]) =>
    rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        lastLogin: row.lastLoginAt ? format(new Date(row.lastLoginAt), "yyyy-MMM-dd HH:mm:ss") : "Never",
        lastLoginAt: row.lastLoginAt,
        image: row.image,
    }));

export const UsersPage = () => {
    const { user: currentUser } = Route.useRouteContext();
    const filters = useSearch({ from: "/admin/users" });
    const q = useDeferredValue(filters.q);
    const sort = useDeferredValue(filters.sort);
    const dir = useDeferredValue(filters.dir);
    const { data: users } = useSuspenseQuery({
        ...userQueries.list({ q, sort, dir }),
        select: selectAdminUsers,
    });
    const navigate = useNavigate({ from: "/admin/users" });
    const [createOpen, setCreateOpen] = useState(false);
    const normalizedQ = q?.trim();

    const toggleSort = (field: SortField) => {
        navigate({
            search: (prev) => {
                if (prev.sort !== field) return { ...prev, sort: field, dir: "asc" };
                if (prev.dir === "asc") return { ...prev, sort: field, dir: "desc" };
                return { ...prev, sort: usersSearchDefaults.sort, dir: usersSearchDefaults.dir };
            },
            replace: true,
        });
    };

    const setSearch = (value: string) => {
        const trimmed = value.trim();
        navigate({
            search: (prev) => ({ ...prev, q: trimmed || undefined }),
            replace: true,
        });
    };

    return (
        <div>
            <CreateUserDialog
                canCreateSuperAdmin={isSuperAdminRole(currentUser.role)}
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
            <AdminHeader title="Users">
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
                {!(users.length === 0 && !normalizedQ) && (
                    <div className="mb-4 flex items-center gap-3">
                        <AdminSearchInput value={filters.q} onChange={setSearch} placeholder="Search users..." />
                    </div>
                )}
                {users.length === 0 && !normalizedQ ? (
                    <EmptyState
                        icon={Users}
                        title="No users found"
                        description="Users who register for the booking system will appear here."
                    />
                ) : users.length === 0 ? (
                    <p className="py-12 text-center text-sm" style={{ color: "var(--a-text-muted)" }}>
                        No users match "{normalizedQ}"
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
                                    <UsersSortHeader
                                        sort={sort}
                                        dir={dir}
                                        onSort={toggleSort}
                                        field="name"
                                        label="User"
                                        width="30%"
                                    />
                                    <UsersSortHeader
                                        sort={sort}
                                        dir={dir}
                                        onSort={toggleSort}
                                        field="email"
                                        label="Email"
                                        width="28%"
                                    />
                                    <UsersSortHeader
                                        sort={sort}
                                        dir={dir}
                                        onSort={toggleSort}
                                        field="role"
                                        label="Role"
                                        width="14%"
                                    />
                                    <UsersSortHeader
                                        sort={sort}
                                        dir={dir}
                                        onSort={toggleSort}
                                        field="lastLogin"
                                        label="Last Login"
                                        width="28%"
                                    />
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                {user.image ? (
                                                    <img
                                                        className="size-7 shrink-0 rounded-full object-cover"
                                                        src={user.image}
                                                        alt=""
                                                    />
                                                ) : (
                                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--a-accent-subtle) text-[0.625rem] font-bold text-(--a-accent)">
                                                        {user.name
                                                            .split(" ")
                                                            .map((w: string) => w[0])
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
                                                style={getUserRoleBadgeStyle(user.role)}
                                            >
                                                {USER_ROLE_LABELS[user.role]}
                                            </span>
                                        </td>
                                        <td className="tabular-nums" style={{ color: "var(--a-text-muted)" }}>
                                            {user.lastLogin}
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

const getUserRoleBadgeStyle = (role: UserRole) => {
    if (role === "super_admin") {
        return {
            background: "color-mix(in srgb, var(--a-accent) 22%, transparent)",
            color: "var(--a-accent)",
            border: "1px solid var(--a-accent-border)",
        };
    }

    if (role === "admin") {
        return {
            background: "var(--a-accent-subtle)",
            color: "var(--a-accent)",
            border: "1px solid var(--a-accent-border)",
        };
    }

    return {
        background: "var(--a-surface-2)",
        color: "var(--a-text-secondary)",
        border: "1px solid var(--a-border)",
    };
};

const UsersSortHeader = ({
    field,
    label,
    width,
    sort,
    dir,
    onSort,
}: {
    field: SortField;
    label: string;
    width: string;
    sort?: SortField;
    dir?: SortDirection;
    onSort: (field: SortField) => void;
}) => (
    <th
        data-sortable
        style={{ width }}
        aria-sort={sort === field && dir ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
        <button
            type="button"
            onClick={() => onSort(field)}
            className="flex w-full items-center gap-1 text-left font-inherit"
        >
            {label}
            {sort === field && dir ? (
                <span className="ml-1 text-[0.5rem]" style={{ color: "var(--a-accent)" }}>
                    {dir === "asc" ? "▲" : "▼"}
                </span>
            ) : null}
        </button>
    </th>
);
