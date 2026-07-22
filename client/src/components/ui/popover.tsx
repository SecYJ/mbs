import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Popover({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({ ...props }: ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
    className,
    align = "center",
    side = "bottom",
    sideOffset = 4,
    positionMethod = "absolute",
    ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> & {
    align?: ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
    side?: ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
    sideOffset?: ComponentProps<typeof PopoverPrimitive.Positioner>["sideOffset"];
    positionMethod?: ComponentProps<typeof PopoverPrimitive.Positioner>["positionMethod"];
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
                        "bg-popover text-popover-foreground w-72 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden transition-[opacity,transform] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
                        className,
                    )}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}

export { Popover, PopoverTrigger, PopoverContent };
