import type { ReactNode } from "react";

import { createServerFn } from "@tanstack/react-start";
import { createCompositeComponent } from "@tanstack/react-start/rsc";

import { RegisterShell } from "@/features/register/components/RegisterShell";

export const getRegisterPage = createServerFn().handler(async () => {
    const src = await createCompositeComponent((props: { children: ReactNode }) => (
        <RegisterShell>{props.children}</RegisterShell>
    ));

    return { src };
});
