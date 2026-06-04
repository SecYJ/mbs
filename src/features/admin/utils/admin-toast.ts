import { toast as sonnerToast } from "sonner";

type AdminToastVariant = "success" | "danger" | "info";

export const adminToast = (message: string, variant: AdminToastVariant = "success") => {
    if (variant === "danger") {
        sonnerToast.error(message);
        return;
    }

    if (variant === "info") {
        sonnerToast.info(message);
        return;
    }

    sonnerToast.success(message);
};
