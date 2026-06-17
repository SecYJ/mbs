import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import reactScan from "@react-scan/vite-plugin-react-scan";

const pgNativeShim = fileURLToPath(new URL("./src/lib/pg-native.ts", import.meta.url));
const nodePostgresPackages = ["pg", "pg-pool", "pg-native"];

const config = defineConfig({
    staged: { "*": "vp check --fix" },
    lint: {
        options: { typeAware: true, typeCheck: true },
        plugins: ["import", "jsx-a11y", "unicorn"],
        categories: {
            suspicious: "warn",
        },
        settings: {
            react: {
                version: "19",
            },
        },
        rules: {
            "react/react-in-jsx-scope": "off",
        },
        overrides: [
            {
                files: ["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"],
                rules: {
                    "typescript/no-explicit-any": "off",
                },
            },
        ],
    },
    fmt: {
        ignorePatterns: ["AGENTS.md", "src/routeTree.gen.ts"],
        printWidth: 120,
        tabWidth: 4,
    },
    resolve: {
        alias: {
            "pg-native": pgNativeShim,
        },
        tsconfigPaths: true,
    },
    optimizeDeps: {
        exclude: nodePostgresPackages,
    },
    ssr: {
        external: nodePostgresPackages,
    },
    plugins: [
        tailwindcss(),
        tanstackStart(),
        viteReact({
            babel: {
                plugins: ["babel-plugin-react-compiler"],
            },
        }),
        reactScan({
            enable: true,
        }),
    ],
});

export default config;
