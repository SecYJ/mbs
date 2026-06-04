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
    side = "bottom",
    sideOffset = 4,
    positionMethod = "absolute",
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
    align?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
    side?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
    sideOffset?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["sideOffset"];
    positionMethod?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["positionMethod"];
}) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
                align={align}
                side={side}
                sideOffset={sideOffset}
                positionMethod={positionMethod}
                className="z-50"
            >
                <PopoverPrimitive.Popup
                    data-slot="popover-content"
                    className={cn(
                        "w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden transition-[opacity,transform] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95",
                        className,
                    )}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}

export { Popover, PopoverTrigger, PopoverContent };
