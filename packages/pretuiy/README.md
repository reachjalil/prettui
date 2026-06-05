# pretuiy

Composable terminal UI rendering primitives, panels, charts, dashboard layouts,
an opinionated app framework, and a runnable kitchen-sink demo.

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

## Framework Usage

```ts
import { createTuiAppState, reduceTuiAppEvent, renderTuiApp } from "pretuiy/framework";

const state = createTuiAppState(app);
const next = reduceTuiAppEvent(app, state, { type: "key", key: "tab" });
process.stdout.write(renderTuiApp(app, next, { width: 120, height: 36 }));
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
- `pretuiy/framework`
- `pretuiy/layout`
- `pretuiy/layouts`

preTUIy renders strings. The optional framework owns common route, focus, menu,
and transition state. Host apps still own terminal input, process lifecycle,
persistence, telemetry, and network behavior.
