import {
  demoChoices,
  demoPanels,
  demoRiskFilters,
  getTuiDemoEventCount,
  kitchenSinkFocusZones,
  renderTuiDemo,
  type TuiDemoChoice,
  type TuiDemoInteractionState,
} from "./renderDemo";
import { buildKitchenSinkNavigationRows, kitchenSinkComponents, kitchenSinkDefaultExpandedSectionMask } from "./kitchenSinkData";

type WritableLike = {
  columns?: number;
  rows?: number;
  isTTY?: boolean;
  write(chunk: string): unknown;
  on?(event: "resize", listener: () => void): unknown;
  off?(event: "resize", listener: () => void): unknown;
};

type ReadableLike = {
  isTTY?: boolean;
  setRawMode?(enabled: boolean): unknown;
  resume?(): unknown;
  pause?(): unknown;
  on?(event: "data", listener: (input: Buffer) => void): unknown;
};

export type PrettuiCliIo = {
  stdout?: WritableLike;
  stderr?: WritableLike;
  stdin?: ReadableLike;
  env?: Record<string, string | undefined>;
};

function rootHelp(): string {
  return [
    "prettui",
    "",
    "Usage:",
    "  prettui demo [options]",
    "  prettui --help",
    "",
    "Commands:",
    "  demo    Run the interactive terminal UI demo or print a snapshot.",
    "",
    "Examples:",
    "  npx @prettui/cli demo",
    "  npx @prettui/cli demo --choice kitchen-sink",
    "  npx @prettui/cli demo --snapshot --cols 178 --rows 48 --no-color",
  ].join("\n");
}

function demoHelp(): string {
  return [
    "prettui demo",
    "",
    "Usage:",
    "  prettui demo [--choice <name>] [--snapshot] [--cols <n>] [--rows <n>] [--no-color]",
    "",
    "Choices:",
    `  ${demoChoices.join(", ")}`,
    "",
    "Options:",
    "  --choice, --demo <name>   Demo choice to open.",
    "  --snapshot, --once        Print one frame and exit.",
    "  --cols, --columns <n>     Snapshot or frame width.",
    "  --rows, --height <n>      Snapshot or frame height.",
    "  --no-color                Disable ANSI color.",
    "  --help                    Show this help.",
  ].join("\n");
}

function hasFlag(args: string[], names: string[]): boolean {
  return args.some((arg) => names.includes(arg));
}

function readNumberFlag(args: string[], names: string[]): number | undefined {
  for (let index = 0; index < args.length; index += 1) {
    if (names.includes(args[index] ?? "")) {
      const parsed = Number(args[index + 1]);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }
  }
  return undefined;
}

function readChoiceFlag(args: string[]): TuiDemoChoice | undefined | "invalid" {
  for (let index = 0; index < args.length; index += 1) {
    if (["--choice", "--demo"].includes(args[index] ?? "")) {
      const value = args[index + 1];
      if (value && (demoChoices as readonly string[]).includes(value)) return value as TuiDemoChoice;
      return "invalid";
    }
  }
  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function wrap(value: number, count: number): number {
  return ((value % count) + count) % count;
}

export function runPrettuiCli(argv = process.argv.slice(2), io: PrettuiCliIo = {}): number {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const stdin = io.stdin ?? process.stdin;
  const env = io.env ?? process.env;
  const [command, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    stdout.write(`${rootHelp()}\n`);
    return 0;
  }

  if (command !== "demo") {
    stderr.write(`Unknown command: ${command}\n\n${rootHelp()}\n`);
    return 1;
  }

  if (hasFlag(rest, ["--help", "-h"])) {
    stdout.write(`${demoHelp()}\n`);
    return 0;
  }

  const initialChoice = readChoiceFlag(rest);
  if (initialChoice === "invalid") {
    stderr.write(`Invalid demo choice. Expected one of: ${demoChoices.join(", ")}\n`);
    return 1;
  }

  const fixedWidth = readNumberFlag(rest, ["--cols", "--columns", "--width"]);
  const fixedHeight = readNumberFlag(rest, ["--rows", "--height"]);
  const color = !rest.includes("--no-color") && !env.NO_COLOR;
  const snapshot = hasFlag(rest, ["--snapshot", "--once"]) || !stdout.isTTY;

  function currentSize(): { width: number; height: number } {
    return {
      width: fixedWidth ?? stdout.columns ?? 178,
      height: fixedHeight ?? stdout.rows ?? 48,
    };
  }

  if (snapshot) {
    stdout.write(`${renderTuiDemo({ ...currentSize(), color, choice: initialChoice ?? "menu" })}\n`);
    return 0;
  }

  let tick = 0;
  let paused = false;
  let closed = false;
  let selectedChoice: TuiDemoChoice | null = initialChoice ?? null;
  let menuIndex = 0;
  let activePanelIndex = demoPanels.indexOf("eventStream");
  let riskFilterIndex = 0;
  let searchMode = false;
  let searchQuery = "";
  let selectedEventIndex = 0;
  let navigationIndex = 0;
  let kitchenSinkFocusIndex = 0;
  let kitchenSinkOptionGroupIndex = 0;
  let kitchenSinkDataIndex = 0;
  let kitchenSinkVariantIndex = 0;
  let kitchenSinkDensityIndex = 1;
  let kitchenSinkPreviewIndex = 0;
  let kitchenSinkExpandedSectionMask = kitchenSinkDefaultExpandedSectionMask;
  let kitchenSinkNavRowIndex = 1;

  function interactionState(): TuiDemoInteractionState {
    return {
      activePanel: demoPanels[activePanelIndex] ?? "eventStream",
      eventFilter: demoRiskFilters[riskFilterIndex] ?? "All",
      searchMode,
      searchQuery,
      selectedEventIndex,
      navigationIndex,
      kitchenSinkFocus: kitchenSinkFocusZones[kitchenSinkFocusIndex] ?? "navigation",
      kitchenSinkComponentIndex: selectedEventIndex,
      kitchenSinkOptionGroupIndex,
      kitchenSinkDataIndex,
      kitchenSinkVariantIndex,
      kitchenSinkDensityIndex,
      kitchenSinkPreviewIndex,
      kitchenSinkExpandedSectionMask,
      kitchenSinkNavRowIndex,
    };
  }

  function resetKitchenSink(): void {
    kitchenSinkFocusIndex = 0;
    kitchenSinkOptionGroupIndex = 0;
    kitchenSinkDataIndex = 0;
    kitchenSinkVariantIndex = 0;
    kitchenSinkDensityIndex = 1;
    kitchenSinkPreviewIndex = 0;
    kitchenSinkExpandedSectionMask = kitchenSinkDefaultExpandedSectionMask;
    kitchenSinkNavRowIndex = 1;
  }

  function clampSelectedEvent(): void {
    if (!selectedChoice) return;
    const count = getTuiDemoEventCount({ tick, paused, choice: selectedChoice, interaction: interactionState() });
    selectedEventIndex = clamp(selectedEventIndex, 0, Math.max(0, count - 1));
  }

  function renderFrame(): void {
    clampSelectedEvent();
    const frame = renderTuiDemo({
      ...currentSize(),
      color,
      tick,
      paused,
      choice: selectedChoice ?? "menu",
      menuIndex,
      interaction: interactionState(),
    });
    stdout.write(`\x1b[H${frame}\x1b[J`);
  }

  function close(code = 0): never {
    if (closed) {
      process.exit(code);
    }

    closed = true;
    clearInterval(interval);
    stdout.off?.("resize", renderFrame);

    if (stdin.isTTY) {
      stdin.setRawMode?.(false);
      stdin.pause?.();
    }

    stdout.write("\x1b[?25h\x1b[0m\x1b[?1049l");
    process.exit(code);
  }

  function tokenizeInput(input: string): string[] {
    const tokens: string[] = [];

    for (let index = 0; index < input.length; ) {
      if (input[index] === "\x1b") {
        const escapeSequence = input.slice(index).match(/^\x1b\[[A-Za-z]/u);
        if (escapeSequence) {
          tokens.push(escapeSequence[0]);
          index += escapeSequence[0].length;
          continue;
        }

        tokens.push("\x1b");
        index += 1;
        continue;
      }

      const char = Array.from(input.slice(index))[0] ?? "";
      tokens.push(char);
      index += char.length;
    }

    return tokens;
  }

  function changeKitchenSinkOption(delta: number): void {
    const focus = kitchenSinkFocusZones[kitchenSinkFocusIndex] ?? "navigation";

    if (focus === "navigation") {
      const row = buildKitchenSinkNavigationRows(kitchenSinkExpandedSectionMask)[kitchenSinkNavRowIndex];
      if (row?.kind === "section") {
        kitchenSinkExpandedSectionMask ^= 1 << row.sectionIndex;
        const rows = buildKitchenSinkNavigationRows(kitchenSinkExpandedSectionMask);
        kitchenSinkNavRowIndex = clamp(kitchenSinkNavRowIndex, 0, Math.max(0, rows.length - 1));
      } else if (row?.kind === "component") {
        selectedEventIndex = row.componentIndex;
      }
      return;
    }

    if (focus === "preview") {
      kitchenSinkPreviewIndex = clamp(kitchenSinkPreviewIndex + delta, 0, 8);
      return;
    }

    const component = kitchenSinkComponents[selectedEventIndex] ?? kitchenSinkComponents[0];
    const group = component?.optionGroups[kitchenSinkOptionGroupIndex] ?? component?.optionGroups[0];
    const choiceCount = Math.max(1, group?.choices.length ?? 1);

    if (group?.id === "variant") {
      kitchenSinkVariantIndex = wrap(kitchenSinkVariantIndex + delta, choiceCount);
      kitchenSinkPreviewIndex = 0;
      return;
    }

    if (group?.id === "density") {
      kitchenSinkDensityIndex = wrap(kitchenSinkDensityIndex + delta, choiceCount);
      return;
    }

    kitchenSinkDataIndex = wrap(kitchenSinkDataIndex + delta, choiceCount);
    kitchenSinkPreviewIndex = 0;
  }

  function moveFocusedSelection(delta: number): void {
    if (selectedChoice === "kitchen-sink") {
      const focus = kitchenSinkFocusZones[kitchenSinkFocusIndex] ?? "navigation";

      if (focus === "navigation") {
        const rows = buildKitchenSinkNavigationRows(kitchenSinkExpandedSectionMask);
        kitchenSinkNavRowIndex = clamp(kitchenSinkNavRowIndex + delta, 0, Math.max(0, rows.length - 1));
        const row = rows[kitchenSinkNavRowIndex];
        if (row?.kind === "component") {
          selectedEventIndex = row.componentIndex;
          kitchenSinkOptionGroupIndex = 0;
          kitchenSinkVariantIndex = 0;
          kitchenSinkPreviewIndex = 0;
        }
      } else if (focus === "options") {
        const component = kitchenSinkComponents[selectedEventIndex] ?? kitchenSinkComponents[0];
        kitchenSinkOptionGroupIndex = clamp(kitchenSinkOptionGroupIndex + delta, 0, Math.max(0, (component?.optionGroups.length ?? 1) - 1));
      } else {
        kitchenSinkPreviewIndex = clamp(kitchenSinkPreviewIndex + delta, 0, 8);
      }

      renderFrame();
      return;
    }

    if (demoPanels[activePanelIndex] === "navigation") {
      navigationIndex = clamp(navigationIndex + delta, 0, 6);
    } else {
      const count = getTuiDemoEventCount({ tick, paused, choice: selectedChoice ?? "mock2", interaction: interactionState() });
      selectedEventIndex = clamp(selectedEventIndex + delta, 0, Math.max(0, count - 1));
    }

    renderFrame();
  }

  function handleMenuInput(key: string): void {
    if (key.toLowerCase() === "q") close(0);

    const numeric = Number(key);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= demoChoices.length) {
      selectedChoice = demoChoices[numeric - 1] ?? null;
      selectedEventIndex = 0;
      resetKitchenSink();
      renderFrame();
      return;
    }

    if (key === "\r" || key === "\n") {
      selectedChoice = demoChoices[menuIndex] ?? null;
      selectedEventIndex = 0;
      resetKitchenSink();
      renderFrame();
      return;
    }

    if (key.toLowerCase() === "j" || key === "\x1b[B") {
      menuIndex = clamp(menuIndex + 1, 0, demoChoices.length - 1);
      renderFrame();
      return;
    }

    if (key.toLowerCase() === "k" || key === "\x1b[A") {
      menuIndex = clamp(menuIndex - 1, 0, demoChoices.length - 1);
      renderFrame();
    }
  }

  function handleSearchInput(key: string): void {
    if (key === "\r" || key === "\n" || key === "\x1b") {
      searchMode = false;
      renderFrame();
      return;
    }

    if (key === "\x7f" || key === "\b") {
      searchQuery = searchQuery.slice(0, -1);
      selectedEventIndex = 0;
      renderFrame();
      return;
    }

    if (key === "\u0015") {
      searchQuery = "";
      selectedEventIndex = 0;
      renderFrame();
      return;
    }

    if (key.length === 1 && key >= " ") {
      searchQuery += key;
      selectedEventIndex = 0;
      renderFrame();
    }
  }

  function handleKey(key: string): void {
    if (key === "\u0003") close(0);
    if (!selectedChoice) {
      handleMenuInput(key);
      return;
    }
    if (searchMode) {
      handleSearchInput(key);
      return;
    }
    if (key === "\x1b") {
      selectedChoice = null;
      searchMode = false;
      renderFrame();
      return;
    }
    if (key.toLowerCase() === "q") close(0);
    if (key.toLowerCase() === "p" || key === " ") {
      if (selectedChoice === "kitchen-sink" && (kitchenSinkFocusZones[kitchenSinkFocusIndex] ?? "navigation") === "options") {
        changeKitchenSinkOption(1);
        renderFrame();
        return;
      }
      paused = !paused;
      renderFrame();
      return;
    }
    if (selectedChoice === "kitchen-sink" && (key === "\r" || key === "\n")) {
      changeKitchenSinkOption(1);
      renderFrame();
      return;
    }
    if (key.toLowerCase() === "r") {
      tick += 1;
      renderFrame();
      return;
    }
    if (key.toLowerCase() === "f") {
      if (selectedChoice === "kitchen-sink") {
        changeKitchenSinkOption(1);
        renderFrame();
        return;
      }
      riskFilterIndex = (riskFilterIndex + 1) % demoRiskFilters.length;
      selectedEventIndex = 0;
      renderFrame();
      return;
    }
    if (key === "/") {
      searchMode = true;
      renderFrame();
      return;
    }
    if (key === "\t") {
      if (selectedChoice === "kitchen-sink") {
        kitchenSinkFocusIndex = (kitchenSinkFocusIndex + 1) % kitchenSinkFocusZones.length;
        renderFrame();
        return;
      }
      activePanelIndex = (activePanelIndex + 1) % demoPanels.length;
      renderFrame();
      return;
    }
    if (key === "\x1b[Z") {
      if (selectedChoice === "kitchen-sink") {
        kitchenSinkFocusIndex = (kitchenSinkFocusIndex - 1 + kitchenSinkFocusZones.length) % kitchenSinkFocusZones.length;
        renderFrame();
        return;
      }
      activePanelIndex = (activePanelIndex - 1 + demoPanels.length) % demoPanels.length;
      renderFrame();
      return;
    }
    if (key.toLowerCase() === "j" || key === "\x1b[B") {
      moveFocusedSelection(1);
      return;
    }
    if (key.toLowerCase() === "k" || key === "\x1b[A") {
      moveFocusedSelection(-1);
      return;
    }
    if (selectedChoice === "kitchen-sink" && (key.toLowerCase() === "l" || key === "\x1b[C")) {
      changeKitchenSinkOption(1);
      renderFrame();
      return;
    }
    if (selectedChoice === "kitchen-sink" && (key.toLowerCase() === "h" || key === "\x1b[D")) {
      changeKitchenSinkOption(-1);
      renderFrame();
    }
  }

  function handleInput(input: Buffer): void {
    for (const key of tokenizeInput(input.toString("utf8"))) {
      handleKey(key);
      if (closed) return;
    }
  }

  stdout.write("\x1b[?1049h\x1b[?25l\x1b[H");
  renderFrame();

  const interval = setInterval(() => {
    if (!paused) tick += 1;
    renderFrame();
  }, 900);

  stdout.on?.("resize", renderFrame);
  process.once("SIGINT", () => close(0));
  process.once("SIGTERM", () => close(0));

  if (stdin.isTTY) {
    stdin.setRawMode?.(true);
    stdin.resume?.();
    stdin.on?.("data", handleInput);
  }

  return 0;
}
