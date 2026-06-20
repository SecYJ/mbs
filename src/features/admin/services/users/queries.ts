import { queryOptions } from "@tanstack/react-query";

import { type UsersSearch } from "@/features/admin/schema/users-search.schema";
import { getUsersFn } from "@/features/admin/services/users/fns";

export const userQueries = {
    all: () => ["admin", "users"],
    lists: () => [...userQueries.all(), "list"],
    list: (filters: UsersSearch) =>
        queryOptions({
            queryKey: [...userQueries.lists(), filters],
            queryFn: () => getUsersFn({ data: filters }),
        }),
};
