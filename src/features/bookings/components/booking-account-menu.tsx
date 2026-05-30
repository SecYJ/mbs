import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBookingSignOut } from "@/features/bookings/hooks/useBookingSignOut";

interface BookingAccountMenuProps {
    user: {
        email: string;
        name: string;
    };
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

export const BookingAccountMenu = ({ user }: BookingAccountMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const signOut = useBookingSignOut();

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                aria-label="Account"
                className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) bg-(--surface-01) text-[0.7rem] font-semibold tracking-widest text-(--bone) transition-all duration-200 hover:border-(--hairline-strong) hover:bg-(--surface-02) data-[popup-open]:border-(--hairline-strong) data-[popup-open]:bg-(--surface-02)"
            >
                {getInitials(user.name)}
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={10}
                className="w-56 rounded-none border-(--hairline) bg-(--surface-01) p-1 text-(--bone) shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
            >
                <div className="border-b border-(--hairline) px-3 py-2.5">
                    <p className="truncate text-[0.78rem] font-semibold text-(--bone)">{user.name}</p>
                    <p className="truncate text-[0.66rem] text-(--bone-muted)">{user.email}</p>
                </div>
                <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:bg-(--surface-02) hover:text-(--bone)"
                >
                    <Settings className="size-4" strokeWidth={1.4} />
                    <span>Settings</span>
                </Link>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase transition-colors hover:bg-(--surface-02) hover:text-(--bone)"
                >
                    <LogOut className="size-4" strokeWidth={1.4} />
                    <span>Sign Out</span>
                </button>
            </PopoverContent>
        </Popover>
    );
};
