import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    createMemoryHistory,
    createRootRouteWithContext,
    createRouter,
    RouterContextProvider,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { LoginForm } from "@/features/login/components/LoginForm";
import { getContext } from "@/integrations/tanstack-query/RootProvider";

type TestRouterContext = {
    queryClient: QueryClient;
};

const { queryClient } = getContext();

const rootRoute = createRootRouteWithContext<TestRouterContext>()({});

const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({
        initialEntries: ["/"],
    }),
    context: {
        queryClient,
    },
});

const TestProviders = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>{children}</RouterContextProvider>
    </QueryClientProvider>
);

const renderLoginForm = () => {
    return render(<LoginForm />, {
        wrapper: TestProviders,
    });
};

beforeEach(async () => {
    await renderLoginForm();
});

afterEach(() => {
    queryClient.clear();
});

describe("Login Form", async () => {
    test("submit button is enabled by default", async () => {
        await expect.element(page.getByRole("button", { name: /continue/i })).toBeEnabled();
    });

    test("toggle password fields visibility", async () => {
        const passphraseInput = page.getByLabelText("Passphrase", {
            exact: true,
        });

        await expect.element(passphraseInput).toHaveAttribute("type", "password");

        await page
            .getByRole("button", {
                name: "Show passphrase",
                exact: true,
            })
            .click();

        await expect.element(passphraseInput).toHaveAttribute("type", "text");
    });

    test("displays error messages for email and password when submit with empty fields", async () => {
        await page.getByRole("button", { name: /continue/i }).click();

        await expect.element(page.getByText("Enter a valid email address")).toBeVisible();
        await expect.element(page.getByText("Passphrase is required")).toBeVisible();
    });
});
