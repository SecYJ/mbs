import { mutationOptions } from "@tanstack/react-query";

export const bookingMutations = {
    all: ["bookings"] as const,
    create: () => {
        return mutationOptions({
            mutationKey: [...bookingMutations.all, "create"],
        });
    },
    update: () => {
        return mutationOptions({
            mutationKey: [...bookingMutations.all, "update"],
        });
    },
};
