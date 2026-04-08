import { defineConfig } from "oxlint";

export default defineConfig({
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
});
