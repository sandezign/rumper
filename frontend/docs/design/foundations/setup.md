# Project Setup

Rumper applications use **React**, **TypeScript**, **Vite**, **Tailwind CSS
v4**, and **shadcn/ui**.

## Package Installation

**CRITICAL**: Every package imported by application or generated component
source MUST be installed as a direct dependency. Transitive availability does
not count as installed.

Rules:

- Use the exact package names shown in this guide.
- Do not import React components from `shadcn`, `shadcn-ui`, or `@shadcn/ui`.
- Use `npx shadcn@latest` as a CLI that copies source into the application.
- Keep every dependency added by the shadcn CLI in `package.json`.
- Do not remove Radix dependencies used by generated components.
- Do not substitute another icon package for `lucide-react`.

Create a new Vite application with the shadcn/ui CLI:

```bash
npx shadcn@latest init -t vite
```

For an existing React and Vite application, install the required base
packages:

```bash
npm install react react-dom lucide-react class-variance-authority clsx tailwind-merge tw-animate-css
npm install -D vite typescript @vitejs/plugin-react tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

When adding a component, use the CLI and retain every dependency it installs:

```bash
npx shadcn@latest add button
npx shadcn@latest add card input label select tabs
```

Do not install both historical CLI package names such as `shadcn-ui` and
`@shadcn/ui`. Use the current `shadcn` CLI through `npx shadcn@latest`.

---

## Package Analysis

### `shadcn`

`shadcn` is a CLI and source-distribution tool. It is not a runtime component
library.

- It copies component source files into `src/components/ui/`.
- It updates `package.json` with dependencies required by added components.
- It uses `components.json` to determine aliases, CSS location, icon library,
  and component style.
- It does not provide a stylesheet or provider that should be imported into
  application code.
- Do NOT write `import { Button } from "shadcn"` or similar imports.

Once added, components are imported from application-owned source:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

### Tailwind CSS v4 and `@tailwindcss/vite`

Tailwind CSS v4 uses CSS-first configuration. Rumper tokens are defined as CSS
variables and exposed to utilities through `@theme inline`.

- Use the `@tailwindcss/vite` plugin in `vite.config.ts`.
- Do not create a Tailwind v3 `tailwind.config.js`.
- Keep the `tailwind.config` field empty in `components.json`.
- Do not use arbitrary values when a Rumper token exists.

### Radix UI dependencies

Many shadcn/ui components use Radix primitives for accessible interaction
behavior.

- Radix packages are installed when required by a component.
- Keep them as direct dependencies when generated source imports them.
- Preserve keyboard navigation, focus management, and ARIA behavior.
- Do not replace Radix behavior with custom interaction code without an
  accessibility-equivalent reason.

### `lucide-react`

Lucide is the approved icon library and must match the `iconLibrary` setting in
`components.json`.

```tsx
import { MapPin, Search } from "lucide-react"
```

- Verify icon names before importing them.
- Do not guess icon names.
- Do not create inline SVG replacements when an approved Lucide icon exists.
- Read `icon-discovery.md` before selecting or adding icons.

### Utility packages

- `class-variance-authority` defines approved component variants.
- `clsx` and `tailwind-merge` support the shared `cn` utility.
- `tw-animate-css` provides Tailwind v4 animation utilities used by shadcn/ui.

Do not recreate these capabilities with one-off helpers.

---

## Required CSS Import Order

Use `src/index.css` as the application CSS entry point:

```css
/* src/index.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* Rumper primitive, semantic, and component tokens follow. */
```

The required order is:

1. Tailwind CSS
2. `tw-animate-css`
3. Custom variants
4. Rumper primitive variables
5. Rumper semantic variables
6. Dark-mode overrides
7. `@theme inline` mappings
8. Base element styles

Example token structure:

```css
:root {
  /* Primitive values */
  --rumper-green-400: #00ed64;
  --rumper-green-600: #00b545;
  --rumper-teal-950: #001e2b;
  --rumper-white: #ffffff;
  --rumper-surface-soft: #f9fbfa;
  --rumper-surface-feature: #e3fcef;
  --rumper-hairline: #e1e5e8;

  /* Semantic purpose */
  --background: var(--rumper-white);
  --foreground: var(--rumper-teal-950);
  --primary: var(--rumper-green-400);
  --primary-foreground: var(--rumper-teal-950);
  --surface: var(--rumper-surface-soft);
  --surface-feature: var(--rumper-surface-feature);
  --border: var(--rumper-hairline);
}

.dark {
  --background: var(--rumper-teal-950);
  --foreground: var(--rumper-white);
  --primary: var(--rumper-green-400);
  --primary-foreground: var(--rumper-teal-950);
}

@theme inline {
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-surface: var(--surface);
  --color-surface-feature: var(--surface-feature);
  --color-border: var(--border);
}
```

Bright `brand-green` is an identity and action color. Never map it to semantic
success, verified evidence, low risk, or safety.

---

## Provider / Wrapper Components

shadcn/ui, Tailwind CSS, and Lucide do not require an application-root
provider.

Rumper requires an application-owned `ThemeProvider` for light, dark, and
system modes. Create it at `src/components/theme-provider.tsx`.

```tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "rumper-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme

    root.classList.add(resolvedTheme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (nextTheme) => {
          localStorage.setItem(storageKey, nextTheme)
          setTheme(nextTheme)
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
```

Wrap the application root:

```tsx
import { ThemeProvider } from "@/components/theme-provider"

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="rumper-theme">
      {/* application content */}
    </ThemeProvider>
  )
}
```

`ThemeProvider` must be an ancestor of every component calling `useTheme()`.

---

## Build Tool Configuration

Use Vite with React, Tailwind CSS v4, and the `@` source alias:

```ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

Tailwind CSS v4 is configured through CSS. Do not create
`tailwind.config.js`.

Use this standard source structure:

```text
src/
├── components/
│   ├── theme-provider.tsx
│   ├── ui/
│   ├── evidence/
│   ├── maps/
│   ├── reports/
│   └── risks/
├── hooks/
├── lib/
│   └── utils.ts
└── index.css
```

Keep reusable low-level primitives under `src/components/ui/`. Keep
Rumper-specific compositions outside `ui/`, grouped by feature.

---

## shadcn/ui Configuration

Use CSS variables, Lucide icons, and application-owned component paths:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- Keep `cssVariables` enabled.
- Keep `tailwind.config` empty.
- Keep generated components under `src/components/ui/`.
- Import components from `@/components/ui/{name}`.
- Use `@/lib/utils` for the shared `cn` utility.
- Review generated diffs before overwriting customized components.

---

## TypeScript

Configure the `@` alias in TypeScript to match Vite:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Use TypeScript for all application-owned components. Do not weaken generated
component types with `any` to bypass integration issues.

---

## Dependency Ownership

| Package or source | Ownership | Required behavior |
|---|---|---|
| `shadcn` CLI | Development tool | Use through `npx shadcn@latest`; never import in app code |
| `src/components/ui/` | Rumper-owned source | Customize deliberately and review generated diffs |
| Radix packages | Direct runtime dependencies when imported | Preserve accessibility and keyboard behavior |
| `lucide-react` | Direct runtime dependency | Use verified icon names only |
| `class-variance-authority` | Direct runtime dependency | Define approved variants |
| `clsx` and `tailwind-merge` | Direct runtime dependencies | Use through shared `cn` utility |
| `tw-animate-css` | Direct dependency | Import once after Tailwind CSS |
| React and React DOM | Direct runtime dependencies | Provided by the Rumper application |
| Vite, TypeScript, and Vite plugins | Development dependencies | Keep build tooling out of runtime code |

Do not treat shadcn/ui components as immutable third-party code. They become
Rumper-owned source after generation.

---

## Build and Verification

Use the standard Vite scripts:

```bash
npm run dev
npm run build
```

Before considering setup complete, verify:

1. `npm run build` succeeds.
2. Every imported package is declared directly in `package.json`.
3. `@/` imports resolve in TypeScript and Vite.
4. A component added with `npx shadcn@latest add` renders correctly.
5. Rumper semantic-token utilities resolve from `@theme inline`.
6. Light, dark, and system themes apply and persist with `rumper-theme`.
7. Focus, keyboard, and reduced-motion behavior remain accessible.
8. Brand green is not used as semantic-positive evidence.

---

## Common Gotchas

1. **Do not import components from `shadcn`, `shadcn-ui`, or `@shadcn/ui`.**
   The current shadcn CLI copies components into application source. Import
   them from `@/components/ui/{name}`.

2. **Do not treat transitive packages as installed.** If generated or
   application source imports a package, keep it as a direct dependency.

3. **Do not overwrite customized components blindly.** Review the diff before
   running `shadcn add` over an existing component.

4. **Tailwind CSS v4 uses CSS-first configuration.** Do not create a Tailwind
   v3 `tailwind.config.js`. Theme tokens belong in CSS custom properties and
   `@theme inline`.

5. **Keep `cssVariables` enabled.** Rumper modes and semantic tokens depend on
   CSS variables.

6. **Import `tw-animate-css` once.** Do not duplicate the import across CSS
   files.

7. **Use Lucide icons only.** Verify icon names and do not introduce unrelated
   icon families or inline SVG replacements.

8. **DM Sans must be loaded before use.** Do not require Euclid Circular A or
   Fraunces.

9. **Brand green is not semantic success.** Never use it to mean safe,
   verified, approved, positive evidence, or low risk.

10. **Preserve Radix accessibility behavior.** Do not remove keyboard
    navigation, focus management, accessible names, or ARIA behavior while
    tailoring components.

11. **Keep product compositions outside `src/components/ui/`.** Evidence,
    maps, reports, and risk patterns belong in feature folders.

12. **Read component guidelines before use.** Start with
    `../guidelines/components/overview.md`, then read the linked plural-category
    guideline.

