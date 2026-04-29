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
        />
    );
};
