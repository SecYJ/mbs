import { queryOptions } from "@tanstack/react-query";

import { type UsersSearch } from "@/features/admin/schema/users-search.schema";
import { getUsersFn } from "@/features/admin/services/users/fns";

export const usersQueryKey = ["admin", "users"] as const;

export const usersQueryOptions = (filters: UsersSearch) =>
    queryOptions({
        queryKey: [...usersQueryKey, filters],
        queryFn: () => getUsersFn({ data: filters }),
    });
