# Package Reference Registry

Primary documentation entry points for the 205-skill atlas. Capability-specific `REFERENCES.md` files MUST resolve the exact skill metadata from the sibling `SKILL.md` and then select the narrowest relevant official page below.

| Package / family | Primary official reference | Secondary official reference | Notes |
|---|---|---|---|
| `next`, `eslint-config-next`, `server-only` | https://nextjs.org/docs | https://github.com/vercel/next.js | Match App Router/runtime behavior to the skill baseline. |
| `react`, `react-dom` | https://react.dev/ | https://github.com/facebook/react | Prefer React API/reference pages for hooks and rendering semantics. |
| `@clerk/nextjs` | https://clerk.com/docs/reference/nextjs/overview | https://clerk.com/docs | Use Clerk's Next.js SDK reference and feature guides. |
| `input-otp` | https://github.com/guilhermerodz/input-otp | https://www.npmjs.com/package/input-otp | Official repository is the behavioral source. |
| `pg`, `@types/pg` | https://node-postgres.com/ | https://github.com/brianc/node-postgres | For `@types/pg`, corroborate type shape against DefinitelyTyped when needed. |
| `zod` | https://zod.dev/ | https://github.com/colinhacks/zod | Skill baseline is Zod 3.x; explicitly record drift when consulting Zod 4 docs. |
| `react-hook-form`, `@hookform/resolvers` | https://react-hook-form.com/ | https://github.com/react-hook-form/react-hook-form | Prefer API pages for hooks/resolvers. |
| `date-fns` | https://date-fns.org/ | https://github.com/date-fns/date-fns | Match function semantics to the declared major version. |
| `react-day-picker` | https://daypicker.dev/ | https://github.com/gpbl/react-day-picker | Use versioned docs when the baseline differs from current package naming/API. |
| `@radix-ui/react-*` | https://www.radix-ui.com/primitives/docs/overview/introduction | https://github.com/radix-ui/primitives | Resolve the exact primitive page for each skill. |
| `tailwindcss`, `@tailwindcss/postcss` | https://tailwindcss.com/docs | https://github.com/tailwindlabs/tailwindcss | Baseline is Tailwind CSS 4.x. |
| `class-variance-authority` | https://cva.style/docs | https://github.com/joe-bell/cva | Prefer variant/TypeScript reference pages. |
| `clsx` | https://github.com/lukeed/clsx | https://www.npmjs.com/package/clsx | Official repository is the primary behavioral source. |
| `tailwind-merge` | https://github.com/dcastil/tailwind-merge | https://www.npmjs.com/package/tailwind-merge | Validate conflict semantics against the baseline major version. |
| `next-themes` | https://github.com/pacocoursey/next-themes | https://www.npmjs.com/package/next-themes | Official repository documents provider, system theme and no-flash behavior. |
| `@emotion/is-prop-valid` | https://github.com/emotion-js/emotion | https://www.npmjs.com/package/@emotion/is-prop-valid | Use the official Emotion repository/package source. |
| `postcss` | https://postcss.org/ | https://github.com/postcss/postcss | Prefer API/plugin documentation. |
| `autoprefixer` | https://github.com/postcss/autoprefixer | https://www.npmjs.com/package/autoprefixer | Official repository is primary. |
| `tailwindcss-animate` | https://github.com/jamiebuilds/tailwindcss-animate | https://www.npmjs.com/package/tailwindcss-animate | Official repository is primary. |
| `tw-animate-css` | https://github.com/Wombosvideo/tw-animate-css | https://www.npmjs.com/package/tw-animate-css | Official repository is primary. |
| `framer-motion` | https://motion.dev/docs/react | https://github.com/motiondivision/motion | Package branding/docs have evolved; record compatibility with the declared baseline. |
| `embla-carousel-react` | https://www.embla-carousel.com/get-started/react/ | https://github.com/davidjerleke/embla-carousel | Prefer API pages for options, methods and plugins. |
| `cmdk` | https://github.com/pacocoursey/cmdk | https://www.npmjs.com/package/cmdk | Official repository is primary. |
| `vaul` | https://vaul.emilkowal.ski/ | https://github.com/emilkowalski/vaul | Prefer official docs/repository for drawer gestures and snap points. |
| `react-resizable-panels` | https://github.com/bvaughn/react-resizable-panels | https://www.npmjs.com/package/react-resizable-panels | Official repository is primary. |
| `recharts` | https://recharts.org/ | https://github.com/recharts/recharts | Prefer API reference for components and accessibility props. |
| `sonner` | https://sonner.emilkowal.ski/ | https://github.com/emilkowalski/sonner | Prefer official docs/repository. |
| `lucide-react` | https://lucide.dev/guide/packages/lucide-react | https://github.com/lucide-icons/lucide | Use package guide and icon/API docs. |
| `@vercel/analytics` | https://vercel.com/docs/analytics | https://github.com/vercel/analytics | Prefer Vercel product docs for framework integration and privacy semantics. |
| `@vercel/speed-insights` | https://vercel.com/docs/speed-insights | https://github.com/vercel/speed-insights | Prefer Vercel product docs for RUM/Core Web Vitals semantics. |
| `@playwright/test` | https://playwright.dev/docs/intro | https://github.com/microsoft/playwright | Prefer official testing guides/API reference. |
| `@axe-core/playwright` | https://github.com/dequelabs/axe-core-npm | https://github.com/dequelabs/axe-core | Pair Playwright integration docs with axe rule documentation. |
| `vitest`, `@vitest/coverage-v8` | https://vitest.dev/guide/ | https://github.com/vitest-dev/vitest | Prefer current versioned configuration/API pages; record baseline drift. |
| `typescript` | https://www.typescriptlang.org/docs/ | https://github.com/microsoft/TypeScript | Prefer Handbook/TSConfig reference. |
| `eslint` | https://eslint.org/docs/latest/ | https://github.com/eslint/eslint | Baseline is ESLint 9.x; prefer flat-config/current rule docs. |
| `tsx` | https://tsx.is/ | https://github.com/privatenumber/tsx | Prefer official docs/repository. |
| `@types/node`, `@types/pg`, `@types/react`, `@types/react-dom` | https://github.com/DefinitelyTyped/DefinitelyTyped | https://www.npmjs.com/org/types | Type declarations are corroborative; behavior remains governed by the upstream runtime/library docs. |

## Selection rule

This registry defines trusted entry points, not proof of consultation. Each execution must resolve a capability-specific official page and record it through the reference evidence contract in the skill's `REFERENCES.md`.
