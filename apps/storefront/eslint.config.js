const coreWebVitals = require("eslint-config-next/core-web-vitals")
const typescript = require("eslint-config-next/typescript")

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      "**/.next/**",
      "**/.out/**",
      "**/build/**",
      "**/next-env.d.ts",
      "eslint.config.js",
      "next.config.js",
      "check-env-variables.js",
      "tailwind.config.js",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
]