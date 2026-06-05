import { dim, fitAnsi, joinAligned, rgb, theme, truncate, visibleLength } from "../ansi";
import { hstack } from "../layout";

export type BrandHeaderProps = {
  title: string;
  subtitle: string;
  status?: string[];
  mark?: string[];
  width: number;
  color?: boolean;
};

const defaultMarkPattern = ["gpppy", "p r p", "wpppg"];
const markColors = {
  g: theme.green,
  y: theme.amber,
  r: theme.red,
  p: theme.slate,
  w: theme.white,
};

const brailleDotMasks = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

const dotMatrixLetters: Record<string, string[]> = {
  P: ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
  R: ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
  E: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  I: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "#####"],
  Y: ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
  H: ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  A: [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
  X: ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
  S: [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
  ".": [" ", " ", " ", " ", " ", " ", "#"],
};

function renderDefaultNodeMark(color: boolean): string[] {
  return [
    `${rgb("○", theme.green, color)}${dim("─", color)}${dim("╮", color)} ${dim("╭", color)}${dim("─", color)}${rgb("●", theme.amber, color)}`,
    `${dim("│", color)} ${dim("╲", color)} ${dim("╱", color)} ${dim("│", color)}`,
    `${rgb("○", theme.white, color)}${dim("─", color)} ${rgb("●", theme.red, color)} ${dim("─", color)}${rgb("○", theme.green, color)}`,
    `${dim("│", color)} ${dim("╱", color)} ${dim("╲", color)} ${dim("│", color)}`,
    `${rgb("●", theme.amber, color)}${dim("─", color)}${dim("╯", color)} ${dim("╰", color)}${dim("─", color)}${rgb("○", theme.green, color)}`,
  ];
}

function braillePattern(rows: string[], color: boolean): string[] {
  const sourceWidth = Math.max(...rows.map((row) => row.length));
  const outputRows = Math.ceil(rows.length / 4);
  const outputCols = Math.ceil(sourceWidth / 2);
  const lines: string[] = [];

  for (let row = 0; row < outputRows; row += 1) {
    const cells: string[] = [];
    for (let col = 0; col < outputCols; col += 1) {
      let mask = 0;

      for (let dotY = 0; dotY < 4; dotY += 1) {
        for (let dotX = 0; dotX < 2; dotX += 1) {
          const token = rows[row * 4 + dotY]?.[col * 2 + dotX] ?? " ";
          if (token === " ") continue;
          mask += brailleDotMasks[dotY][dotX];
        }
      }

      cells.push(mask ? rgb(String.fromCharCode(0x2800 + mask), theme.white, color) : " ");
    }
    lines.push(cells.join(""));
  }

  return lines;
}

function renderDotWordmark(title: string, color: boolean): string[] | null {
  const normalized = title.trim().toUpperCase();
  if (normalized !== "PRETUIY") return null;

  const letters = Array.from(normalized).map((letter) => dotMatrixLetters[letter] ?? dotMatrixLetters.P);
  const pixelRows = Array.from({ length: 7 }, (_, row) => letters.map((letter) => letter[row] ?? "").join("  "));
  return braillePattern(pixelRows, color);
}

function renderPatternMark(pattern: string[], color: boolean): string[] {
  return pattern.map((line) =>
    Array.from(line)
      .map((char) => (char === " " ? " " : rgb("•", markColors[char as keyof typeof markColors] ?? theme.white, color)))
      .join("")
  );
}

export function renderBrandHeader({ title, subtitle, status = [], mark, width, color = true }: BrandHeaderProps): string {
  const renderedMark = mark ?? renderDefaultNodeMark(color);
  const titleLines = renderDotWordmark(title, color) ?? [rgb(title, theme.white, color)];
  const brandText = [...titleLines, dim(subtitle, color), "", ""].slice(0, Math.max(2, renderedMark.length));
  const brand = hstack([renderedMark.join("\n"), brandText.join("\n")], 3).split("\n");
  const statusLine = status.join("  ");
  const lines = brand.map((line, index) => {
    if (index === 0 && statusLine) {
      const lineWidth = visibleLength(line);
      const statusBudget = width - lineWidth - 4;
      if (statusBudget < 18) return fitAnsi(line, width);
      return joinAligned(line, truncate(statusLine, statusBudget), width, 4);
    }
    return fitAnsi(line, width);
  });
  return lines.join("\n");
}
