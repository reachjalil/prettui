import { readFileSync } from "node:fs";

const tag = process.argv[2] ?? "";
const version = tag.startsWith("v") ? tag.slice(1) : tag;
const notes = readFileSync("docs/RELEASE_NOTES.md", "utf8");
const heading = `## ${version}`;
const start = notes.indexOf(heading);

if (start === -1) {
  console.log(notes.trim());
  process.exit(0);
}

const rest = notes.slice(start + heading.length);
const next = rest.search(/\n##\s/u);
console.log((next === -1 ? rest : rest.slice(0, next)).trim());
