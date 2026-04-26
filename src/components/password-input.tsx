import { Eye, EyeOff } from "lucide-react";
import { useId, useReducer, type ReactNode } from "react";
import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordInputProps<T extends FieldValues> = {
    label: string;
    placeholder: string;
    name: FieldPath<T>;
    control: Control<T>;
    autoComplete?: "new-password" | "current-password";
    labelAccessory?: ReactNode;
};

export const PasswordInput = <T extends FieldValues>({
    label,
    placeholder,
    name,
    control,
    autoComplete = "new-password",
    labelAccessory,
}: PasswordInputProps<T>) => {
    const id = useId();
    const [show, toggle] = useReducer((s) => !s, false);
    const { field, fieldState } = useController({ control, name });

    const labelNode = (
        <Label htmlFor={id} className="eyebrow block">
            {label}
        </Label>
    );

    return (
        <div className="space-y-3">
            {labelAccessory ? (
                <div className="flex items-center justify-between">
                    {labelNode}
                    {labelAccessory}
                </div>
            ) : (
                labelNode
            )}
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    aria-invalid={fieldState.error ? true : undefined}
                    className="login-input-underline h-11 rounded-none bg-transparent pr-12 text-[0.95rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus-visible:ring-0"
                    {...field}
                />
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={show ? "Hide passphrase" : "Show passphrase"}
                    className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center cursor-pointer text-(--bone-dim) transition-colors hover:text-(--gold)"
                    tabIndex={-1}
                >
                    {show ? (
                        <EyeOff className="size-4.25" strokeWidth={1.4} />
                    ) : (
                        <Eye className="size-4.25" strokeWidth={1.4} />
                    )}
                </button>
            </div>
            {fieldState.error ? <p className="text-[0.72rem] text-red-400/80">{fieldState.error.message}</p> : null}
        </div>
    );
};
