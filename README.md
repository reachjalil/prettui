# prettui

[![CI](https://github.com/reachjalil/prettui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/reachjalil/prettui/actions/workflows/ci.yml?query=branch%3Amain)
[![npm @prettui/kit](https://img.shields.io/npm/v/%40prettui%2Fkit?label=%40prettui%2Fkit)](https://www.npmjs.com/package/@prettui/kit)
[![Security](https://img.shields.io/badge/security-policy-111827)](./SECURITY.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](./LICENSE)

prettui is a TypeScript library for rendering composable terminal UI frames:
ANSI helpers, layout primitives, charts, panels, dashboard layouts, and a
kitchen-sink demo that shows advanced TUI patterns. It also includes an
opinionated framework layer for dynamic TUI apps with typed routes, expandable
navigation, focus zones, menus, transitions, and exact-frame shell rendering.

```bash
npx @prettui/cli demo
npx @prettui/cli demo --choice kitchen-sink
npx @prettui/cli demo --snapshot --cols 178 --rows 48 --no-color
```

## Install

```bash
npm install @prettui/kit
```

For the modular packages, install only what you use:

```bash
npm install @prettui/core @prettui/components @prettui/dashboard
npm install @prettui/kit
```

## Usage

```ts
import { renderTuiDashboard } from "@prettui/kit";

const frame = renderTuiDashboard({
  width: 120,
  height: 36,
  color: true,
  brand: {
    title: "prettui",
    subtitle: "Terminal operations dashboard",
  },
  metrics: [],
  navigation: { items: [] },
  events: [],
  inspector: { title: "INSPECTOR", id: "evt_1", value: {} },
  files: [],
  footer: { status: [], controls: ["[q] Quit"] },
});

process.stdout.write(frame);
```

Subpath exports are available for focused imports:

```ts
import { fitAnsi, visibleLength } from "@prettui/core/ansi";
import { bars, segmentedDonut } from "@prettui/core/charts";
import { renderPanel } from "@prettui/components";
import { renderTuiDemo } from "@prettui/demo";
import { createTuiAppState, reduceTuiAppEvent, renderTuiApp } from "@prettui/framework";
```

## Packages

| Package | Use |
| --- | --- |
| `@prettui/core` | ANSI helpers, chart primitives, and exact-frame layout utilities. |
| `@prettui/components` | Reusable panels, cards, tables, footers, and data widgets. |
| `@prettui/dashboard` | Opinionated event/dashboard frame renderer. |
| `@prettui/framework` | Typed routes, navigation, focus, menus, transitions, and shell rendering. |
| `@prettui/layouts` | Higher-order analytics, stream, event, and workflow layouts. |
| `@prettui/demo` | Demo renderers and kitchen-sink fixtures. |
| `@prettui/cli` | `prettui` demo executable. |
| `@prettui/kit` | Convenience package that re-exports the public toolkit. |

## Opinionated Framework

Use `@prettui/framework` when you want prettui to own the standard TUI app
patterns: navigation layout, route history, focus movement, menu-driven route
changes, transitions, responsive shell composition, and dynamic render context.

```ts
import { createTuiAppState, renderTuiApp, type TuiAppDefinition } from "@prettui/framework";
import { renderPanel } from "@prettui/components";

const app: TuiAppDefinition<{ queueDepth: number }> = {
  title: "prettui",
  subtitle: "Operations console",
  initialRouteId: "overview",
  context: { queueDepth: 12 },
  navigation: [
    { id: "primary", label: "Primary", items: [{ id: "overview", label: "Overview", routeId: "overview" }] },
  ],
  routes: [
    {
      id: "overview",
      title: "Overview",
      render: ({ width, height, context }) =>
        renderPanel({ title: "Queue", children: [`Depth: ${context.queueDepth}`], width, height, color: false }),
    },
  ],
};

const state = createTuiAppState(app);
process.stdout.write(renderTuiApp(app, state, { width: 120, height: 36, color: false }));
```

See [docs/FRAMEWORK.md](./docs/FRAMEWORK.md) for routing, composition, and
interaction patterns.

## What It Includes

- ANSI color, width, truncation, padding, and selection helpers.
- Layout primitives for boxes, horizontal stacks, tables, ratios, and exact
  frame normalization.
- Terminal chart primitives: bars, low bars, sparklines, dash states, and
  segmented donuts.
- Reusable panels for brand headers, navigation, events, JSON inspectors, file
  activity, tables, footers, analytics widgets, timelines, logs, heatmaps, and
  key/value groups.
- Higher-level dashboard layouts and a kitchen sink that documents layout
  patterns and TUI implementation practices.
- An optional framework layer for route-driven TUI apps with typed state,
  expandable navigation, focus zones, menus, and transitions.

## Boundaries

prettui renders strings. The low-level primitives do not own application state.
The optional framework reducer can own common TUI state such as routes, focus,
menus, and transitions, while host apps still control terminal input, process
lifecycle, persistence, telemetry, and network behavior.

## Development

```bash
pnpm install
pnpm run quality
```

See [CONTRIBUTING.md](./CONTRIBUTING.md), [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md), and
[docs/PUBLISHING.md](./docs/PUBLISHING.md).
