import type { ReactNode } from "react";

import { createServerFn } from "@tanstack/react-start";
import { createCompositeComponent } from "@tanstack/react-start/rsc";

import { ForgotPasswordShell } from "@/features/forgot-password/components/ForgotPasswordShell";

export const getForgotPasswordPage = createServerFn().handler(async () => {
    const src = await createCompositeComponent((props: { children: ReactNode }) => (
        <ForgotPasswordShell>{props.children}</ForgotPasswordShell>
    ));

    return { src };
});
