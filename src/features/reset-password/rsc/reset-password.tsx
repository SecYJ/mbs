import type { ReactNode } from "react";

import { createServerFn } from "@tanstack/react-start";
import { createCompositeComponent } from "@tanstack/react-start/rsc";

import { ResetPasswordShell } from "@/features/reset-password/components/ResetPasswordShell";

export const getResetPasswordPage = createServerFn().handler(async () => {
    const src = await createCompositeComponent((props: { children: ReactNode }) => (
        <ResetPasswordShell>{props.children}</ResetPasswordShell>
    ));

    return { src };
});
