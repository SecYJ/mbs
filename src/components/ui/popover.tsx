import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
    className,
    align = "center",
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
    align?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
    sideOffset?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["sideOffset"];
}) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset}>
                <PopoverPrimitive.Popup
                    data-slot="popover-content"
                    className={cn(
                        "z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden transition-[opacity,transform] duration-150 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
                        className,
                    )}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
    return <div data-slot="popover-header" className={cn("flex flex-col gap-1 text-sm", className)} {...props} />;
}

function PopoverTitle({ className, ...props }: React.ComponentProps<typeof PopoverPrimitive.Title>) {
    return <PopoverPrimitive.Title data-slot="popover-title" className={cn("font-medium", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<typeof PopoverPrimitive.Description>) {
    return (
        <PopoverPrimitive.Description
            data-slot="popover-description"
            className={cn("text-muted-foreground", className)}
            {...props}
        />
    );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription };
