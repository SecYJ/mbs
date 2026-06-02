import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { badgeVariants } from "@/components/ui/badge-variants";
import { cn } from "@/lib/utils";

function Badge({
    className,
    variant = "default",
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
    return (
        <span
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge };
