import { adminToggleClasses } from "@/features/admin/admin-classes";

interface StatusToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export const StatusToggle = ({ checked, onChange, label }: StatusToggleProps) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label ?? (checked ? "Active" : "Inactive")}
            className={adminToggleClasses}
            data-state={checked ? "on" : "off"}
            onClick={() => onChange(!checked)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
        />
    );
};
