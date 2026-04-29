import { queryOptions } from "@tanstack/react-query";

import { getBookingRulesFn } from "@/features/admin/services/booking-rules/fns";

export const bookingRulesQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "booking-rules"],
        queryFn: getBookingRulesFn,
    });
