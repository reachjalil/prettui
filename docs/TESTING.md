# prettui test matrix

prettui tests should prove that renderers are deterministic and bounded.

## Covered Scenarios

| Area | Scenario | Test |
| --- | --- | --- |
| Core | Dashboard renders exact width and height | `test/index.test.ts` |
| Core | Required panels remain visible in compact terminal sizes | `test/index.test.ts` |
| Components | Summary cards, segmented donuts, and footers render as reusable pieces | `test/index.test.ts` |
| Framework | App shell exact frames, focus flow, expandable navigation, route history, menus, and transition ticks behave predictably | `test/framework.test.ts` |
| Demo | Launcher, mock dashboards, kitchen sink, focus/options, graphs, layouts, and best-practice guides render bounded frames | `test/demo.test.ts` |
| CLI | Help, snapshots, kitchen sink snapshots, and invalid choices behave predictably | `test/cli.test.ts` |

## Manual Smoke Commands

```bash
pnpm run quality
pnpm --filter @prettui/cli exec node dist/bin.js demo --snapshot --no-color --cols 120 --rows 32
pnpm --filter @prettui/cli exec node dist/bin.js demo --choice kitchen-sink --snapshot --no-color --cols 178 --rows 48
```

For a package-tarball smoke check:

```bash
pnpm --filter @prettui/cli pack
npm exec --package ./packages/cli/prettui-cli-*.tgz prettui demo --snapshot --no-color
```
