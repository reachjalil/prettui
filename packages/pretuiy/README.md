# pretuiy

Composable terminal UI rendering primitives, panels, charts, dashboard layouts,
and a runnable kitchen-sink demo.

```bash
npm install pretuiy
npx pretuiy demo
```

## Library Usage

```ts
import { renderPanel } from "pretuiy";

const frame = renderPanel({
  title: "Status",
  children: ["Service online", "Queue depth: 3"],
  width: 48,
  height: 8,
  color: true,
});
```

## CLI Demo

```bash
pretuiy demo
pretuiy demo --choice kitchen-sink
pretuiy demo --snapshot --cols 178 --rows 48 --no-color
```

## Exports

- `pretuiy`
- `pretuiy/ansi`
- `pretuiy/charts`
- `pretuiy/components`
- `pretuiy/demo`
- `pretuiy/layout`
- `pretuiy/layouts`

preTUIy renders strings. It does not own application state, terminal input,
process lifecycle, persistence, telemetry, or network behavior.
