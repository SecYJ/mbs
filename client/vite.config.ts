import process from "node:process";
import { fileURLToPath } from "node:url";

import reactScan from "@react-scan/vite-plugin-react-scan";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { unstableRolldownAdapter } from "vite-bundle-analyzer";
import { analyzer } from "vite-bundle-analyzer";
import { defineConfig } from "vite-plus";

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
    staged: {
        "*": ["vp fmt --write --config ../.oxfmtrc.json", "vp check --fix --no-fmt"],
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
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                configure: (proxy) => {
                    proxy.on("proxyReq", (proxyReq, req) => {
                        console.log(`[Proxy] ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
                    });

                    proxy.on("proxyRes", (proxyRes, req) => {
                        console.log(`[Proxy Response] ${req.url} <- ${proxyRes.statusCode}`);
                        proxyRes.headers["x-dev-proxy"] = "vite";
                    });
                },
            },
        },
    },
});

export default config;
