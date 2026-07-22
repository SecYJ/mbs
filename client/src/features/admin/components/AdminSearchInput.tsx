import { Search } from "lucide-react";

import { adminInputClasses } from "@/features/admin/admin-classes";
import { cn } from "@/lib/utils";

type Props = {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export const AdminSearchInput = ({ value, onChange, placeholder = "Search...", className }: Props) => (
    <div className={cn("relative", className)}>
        <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--a-text-muted)"
            strokeWidth={1.8}
        />
        <input
            type="text"
            className={cn(adminInputClasses, "w-50 pl-8")}
            aria-label={placeholder}
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);
