# preTUIy framework

`pretuiy/framework` is the opinionated layer for building dynamic terminal apps
on top of the lower-level render primitives. It keeps the app model typed and
plain: routes, navigation, menus, focus, transitions, and render context are all
serializable data plus pure reducer/render functions.

## Architecture

Use this split for advanced TUIs:

- `TuiAppDefinition` describes routes, expandable navigation sections, optional
  right-side menus, footer status, and dynamic context.
- `createTuiAppState` creates a bounded initial state from the definition.
- `reduceTuiAppEvent` handles framework events such as focus movement,
  navigation selection, route changes, back navigation, menu selection, and
  transition ticks.
- `renderTuiApp` composes a responsive exact-frame shell: header, left
  navigation, main route preview, optional menu panel, and footer controls.
- Route render functions stay application-specific. They receive exact
  dimensions, color mode, current state, route metadata, and typed context.

## Minimal App

```ts
import { renderPanel } from "pretuiy/components";
import { createTuiAppState, renderTuiApp, type TuiAppDefinition } from "pretuiy/framework";

type ConsoleContext = {
  queueDepth: number;
};

const app: TuiAppDefinition<ConsoleContext> = {
  title: "preTUIy",
  subtitle: "Operations console",
  version: "0.1.0",
  initialRouteId: "overview",
  context: { queueDepth: 12 },
  navigation: [
    {
      id: "workspace",
      label: "Workspace",
      items: [
        { id: "overview", label: "Overview", routeId: "overview", icon: "*" },
        { id: "queues", label: "Queues", routeId: "queues", icon: "#" },
      ],
    },
  ],
  routes: [
    {
      id: "overview",
      title: "Overview",
      render: ({ width, height, context, color }) =>
        renderPanel({ title: "Queue", children: [`Depth: ${context.queueDepth}`], width, height, color }),
    },
    {
      id: "queues",
      title: "Queues",
      render: ({ width, height, color }) =>
        renderPanel({ title: "Workers", children: ["ingest", "enrich", "export"], width, height, color }),
    },
  ],
};

const state = createTuiAppState(app);
const frame = renderTuiApp(app, state, { width: 120, height: 36, color: false });
```

## Recommended Event Loop

Map your terminal runtime into framework events. Keep process and terminal
control in your app, then pass normalized events into the reducer.

```ts
import { createTuiAppState, reduceTuiAppEvent, renderTuiApp, type TuiAppEvent } from "pretuiy/framework";

let state = createTuiAppState(app);

function dispatch(event: TuiAppEvent) {
  state = reduceTuiAppEvent(app, state, event);
  process.stdout.write(renderTuiApp(app, state, { width: process.stdout.columns, height: process.stdout.rows }));
}

dispatch({ type: "key", key: "tab" });
dispatch({ type: "navigate", routeId: "queues" });
dispatch({ type: "tick" });
```

## Interaction Model

The default focus zones are:

- `navigation` for expandable sections and route rows.
- `main` for interactive route content owned by your app.
- `menu` for optional right-side command or variant panels.

Default key events:

- `tab` and `shift-tab` cycle focus zones.
- `up` and `down` move the active row inside navigation or menus.
- `enter`, `space`, and `right` open selected routes, toggle sections, or run a
  menu route transition.
- `left` moves from main or menu back toward navigation.
- `escape` and `back` navigate route history.

## Composition Patterns

Use the framework for app concerns and low-level preTUIy exports for rendering:

- Navigation layout: model route groups as `TuiNavigationSection[]`, keep labels
  stable, and use `defaultExpanded: false` for secondary areas.
- Route composition: route renderers should call components such as
  `renderPanel`, `renderSummaryCard`, chart helpers, or dashboard layouts.
- Menu transitions: use `menus` for command palettes, data variants, or
  inspector controls that route to alternate views without replacing the whole
  shell.
- Dynamic data: pass snapshots through `definition.context`; update context in
  the host app before rendering the next frame.
- Exact frames: route renderers receive a width and height budget and should
  return a bounded frame. `renderTuiApp` normalizes the final result to the
  requested terminal size.

## Public Helpers

Focused helpers are exported for teams that need custom shells:

- `buildNavigationRows`, `defaultExpandedSectionIds`,
  `findNavigationRowIndexForRoute`, and `toggleNavigationSection`.
- `createRouteMap`, `resolveRoute`, `navigateToRoute`, and `goBack`.
- `normalizeFocusZone`, `moveFocusZone`, and `defaultFocusZones`.
- `startTransition` and `advanceTransition`.
