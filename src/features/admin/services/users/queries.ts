import { queryOptions } from "@tanstack/react-query";

import { getUsersFn } from "@/features/admin/services/users/fns";
import type { AdminUser } from "@/features/admin/types";

const avatarColors = ["#e4a441", "#539bf5", "#34d399", "#c084fc", "#f97066", "#2dd4bf"];

const getAvatarColor = (id: string) => {
    const total = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatarColors[total % avatarColors.length] ?? avatarColors[0];
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatLastLogin = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return "Never";

    const date = new Date(lastLoginAt);
    const month = monthNames[date.getUTCMonth()] ?? "Jan";
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${month} ${day}, ${year} ${hours}:${minutes} UTC`;
};

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "users"],
        queryFn: getUsersFn,
        select: (rows) =>
            rows.map<AdminUser>((row) => ({
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                lastLogin: formatLastLogin(row.lastLoginAt),
                lastLoginAt: row.lastLoginAt,
                image: row.image,
                avatarColor: getAvatarColor(row.id),
            })),
    });
