import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

function Button({
    className,
    variant = "default",
    size = "default",
    type = "button",
    ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
    return (
        <button
            type={type}
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button };
