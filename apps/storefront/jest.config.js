/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "tsx", "json"],
  moduleNameMapper: {
    "^server-only$": "<rootDir>/src/lib/empty-module.js",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@dtc/gallery-experience$": "<rootDir>/../../packages/gallery-experience/src/index.ts",
  },
  testMatch: ["**/src/**/__tests__/**/*.unit.spec.[jt]s"],
  modulePathIgnorePatterns: ["dist/", ".next/", "node_modules/"],
}