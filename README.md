# preTUIy

[![CI](https://github.com/reachjalil/pretuiy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/reachjalil/pretuiy/actions/workflows/ci.yml?query=branch%3Amain)
[![npm pretuiy](https://img.shields.io/npm/v/pretuiy?label=pretuiy)](https://www.npmjs.com/package/pretuiy)
[![Security](https://img.shields.io/badge/security-policy-111827)](./SECURITY.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](./LICENSE)

preTUIy is a TypeScript library for rendering composable terminal UI frames:
ANSI helpers, layout primitives, charts, panels, dashboard layouts, and a
kitchen-sink demo that shows advanced TUI patterns.

```bash
npx pretuiy demo
npx pretuiy demo --choice kitchen-sink
npx pretuiy demo --snapshot --cols 178 --rows 48 --no-color
```

## Install

```bash
npm install pretuiy
```

## Usage

```ts
import { renderTuiDashboard } from "pretuiy";

const frame = renderTuiDashboard({
  width: 120,
  height: 36,
  color: true,
  brand: {
    title: "preTUIy",
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
import { fitAnsi, visibleLength } from "pretuiy/ansi";
import { bars, segmentedDonut } from "pretuiy/charts";
import { renderPanel } from "pretuiy/components";
import { renderTuiDemo } from "pretuiy/demo";
```

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

## Boundaries

preTUIy renders strings. It does not own application state, terminal input,
process lifecycle, persistence, telemetry, or network behavior. Apps pass data
in, decide how frames are displayed, and wire their own runtime controls.

## Development

```bash
pnpm install
pnpm run quality
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).
