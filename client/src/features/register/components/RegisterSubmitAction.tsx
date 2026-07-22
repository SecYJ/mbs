import { ArrowRight } from "lucide-react";
import { useFormState, type Control, type FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = {
    control: Control<T>;
    isPending: boolean;
    label: string;
};

export const RegisterSubmitAction = <T extends FieldValues>({ control, isPending, label }: Props<T>) => {
    const { isSubmitting } = useFormState({ control });

    return (
        <div className="pt-2">
            <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] text-black uppercase transition-all duration-300 hover:border-white hover:bg-white hover:tracking-[0.34em] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span>{isPending ? "Opening" : label}</span>
                <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.6}
                />
            </button>
        </div>
    );
};
