import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { unstableRolldownAdapter } from "vite-bundle-analyzer";
import { analyzer } from "vite-bundle-analyzer";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

import tailwindcss from "@tailwindcss/vite";
import reactScan from "@react-scan/vite-plugin-react-scan";

const pgNativeShim = fileURLToPath(new URL("./src/lib/pg-native.ts", import.meta.url));
const nodePostgresPackages = ["pg", "pg-pool", "pg-native"];
const analyzeClientBundle = process.env.ANALYZE === "true";
const enableReactScan = process.env.REACT_SCAN === "true";
const clientBundleAnalyzer = {
    ...unstableRolldownAdapter(
        analyzer({
            analyzerMode: "static",
            enabled: analyzeClientBundle,
            fileName: "client-stats",
            openAnalyzer: false,
            reportTitle: "Client Bundle Analyzer",
        }),
    ),
    applyToEnvironment: (environment: { name: string }) => environment.name === "client",
};

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
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        typecheck: { enabled: true },
        watch: false,
        globals: true,
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
    // Vendor code-splitting for the client bundle only; the SSR build is left untouched.
    environments: {
        client: {
            build: {
                rolldownOptions: {
                    output: {
                        codeSplitting: {
                            // minSize 0 so each requested group materializes even when small.
                            minSize: 0,
                            // `[\\/]` matches the path separator on both POSIX and Windows.
                            // Base libs (react, zod) get higher priority so dependents like the
                            // zod resolver reference those chunks instead of duplicating them.
                            groups: [
                                { name: "react", test: /node_modules[\\/](react-dom|react)[\\/]/, priority: 100 },
                                { name: "zod", test: /node_modules[\\/]zod[\\/]/, priority: 1 },
                                {
                                    name: "form",
                                    test: /node_modules[\\/](react-hook-form|@hookform[\\/]resolvers)[\\/]/,
                                },
                                { name: "auth", test: /node_modules[\\/]better-auth[\\/]/ },
                                { name: "calendar", test: /node_modules[\\/]@fullcalendar[\\/]/ },
                                { name: "ui", test: /node_modules[\\/]@base-ui[\\/]/ },
                                { name: "legend-list", test: /node_modules[\\/]@legendapp[\\/]list[\\/]/ },
                            ],
                        },
                    },
                },
            },
        },
    },
    plugins: [
        // zod v4's entry does `export * as locales from "./locales/index.js"`, pulling
        // all ~50 locale files. We only use the default `en` (imported directly by zod
        // core), so stub the barrel to drop the rest. Manual chunking preserves this
        // otherwise-tree-shaken export, so without this the zod chunk bundles them all.
        {
            name: "stub-unused-zod-locales",
            load(id: string) {
                if (id.replace(/\\/g, "/").endsWith("/zod/v4/locales/index.js")) {
                    return "export {};";
                }
            },
        },
        tailwindcss(),
        tanstackStart(),
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        ...(enableReactScan ? [reactScan({ enable: true })] : []),
        clientBundleAnalyzer,
    ],
    preview: {
        allowedHosts: ["mbs-web.onrender.com"],
    },
});

export default config;
