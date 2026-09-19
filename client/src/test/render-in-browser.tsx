import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

export const renderInBrowser = async (ui: ReactNode) => {
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);

    await act(async () => {
        root.render(ui);
    });

    return async () => {
        await act(async () => {
            root.unmount();
        });
        container.remove();
    };
};
