import type { ReactNode } from "react";

import { createServerFn } from "@tanstack/react-start";
import { createCompositeComponent } from "@tanstack/react-start/rsc";

import { LoginShell } from "@/features/login/components/LoginShell";

export const getLoginPage = createServerFn().handler(async () => {
    const src = await createCompositeComponent((props: { children: ReactNode }) => (
        <LoginShell>{props.children}</LoginShell>
    ));

    return { src };
});
