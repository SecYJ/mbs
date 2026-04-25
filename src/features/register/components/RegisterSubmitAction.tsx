import { ArrowRight } from "lucide-react";
import { useFormState, type Control, type FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
    control: Control<T>;
    label: string;
};

export const RegisterSubmitAction = <T extends FieldValues>({ control, label }: Props<T>) => {
    const { isSubmitting, isValid } = useFormState({ control });

    return (
        <div className="pt-2">
            <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span>{label}</span>
                <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.6}
                />
            </button>
        </div>
    );
};
