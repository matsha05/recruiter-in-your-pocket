import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const require = createRequire(import.meta.url);

// Highlighter 1.1 style budgets (Nov 1, 2026). The production audit counted 121 text styles, 31 sizes,
// weights 400-800, and nine builds of the dark pill. Each budget is the ceiling after consolidation:
// lower it when debt is paid down; raising one is a design decision recorded in docs/design-system.md.
export const STYLE_BUDGETS = {
  textRoles: 11,
  // primary, secondary, quiet, destructive, and destructiveFinal (filled only on the last irreversible step).
  buttonVariants: 5,
  buttonSizes: 4,
  handBuiltPills: 0,
  // className on <Button> that restyles its height, padding, label size, or weight.
  buttonOverrides: 0,
  radii: 7,
  shadows: 5,
  adHocHovers: 51,
  legacyTypeUtilities: 119,
  // Roles own their line height; these are the overrides left in pages another workstream is editing.
  leadingOverrides: 5,
  rawCssFontSizes: 0,
  // Characters per line for shared reading rails, measured with Schibsted Grotesk's average glyph width.
  proseMeasure: 75,
};

const WEIGHTS = new Set(["400", "600", "800"]);

// Illustrations may mimic the document they draw (design-system.md §10), and the stacked wordmark is
// waiting on the D6 logotype. Separate pipelines (PDF, email, Open Graph) carry their own literals.
const RAW_SIZE_EXEMPT = new Set([
  "components/landing/home/VerdictHero.module.css",
  "components/icons/Wordmark.module.css",
]);
// Drawings of paper, screens, and chart bars keep the geometry of the thing they draw.
const ILLUSTRATIONS = new Set([
  "components/landing/home/VerdictHero.module.css",
  "components/research/figures/FigureKit.tsx",
  "components/guides/comp-calculator/CompCalculatorResults.tsx",
]);
const NON_PRODUCT = ["app/internal/", "app/playground/", "app/preview/", "app/sentry-example-page/", "components/internal/"];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function walk(dir, exts, files = []) {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, exts, files);
    else if (exts.some((ext) => entry.name.endsWith(ext))) files.push(rel);
  }
  return files;
}

function productFiles(exts) {
  return ["app", "components", "lib"].flatMap((dir) => walk(dir, exts)).filter((file) => !NON_PRODUCT.some((prefix) => file.startsWith(prefix)));
}

/** Rules outside @font-face and keyframes, as [selector, body, insideMedia]. */
function cssRules(source) {
  const rules = [];
  const visit = (text, inMedia) => {
    let i = 0;
    while (true) {
      const open = text.indexOf("{", i);
      if (open < 0) return;
      let depth = 0;
      let close = open;
      for (; close < text.length; close++) {
        if (text[close] === "{") depth++;
        else if (text[close] === "}" && --depth === 0) break;
      }
      const prelude = text.slice(i, open).replace(/\/\*[\s\S]*?\*\//g, "").trim();
      const body = text.slice(open + 1, close);
      if (/^@(media|supports|layer)/.test(prelude)) visit(body, true);
      else if (!/^@(font-face|keyframes)/.test(prelude) && !/^(from|to|\d+%)/.test(prelude)) rules.push([prelude, body, inMedia]);
      i = close + 1;
    }
  };
  visit(source.replace(/\/\*[\s\S]*?\*\//g, ""), false);
  return rules;
}

function declarations(body, prop) {
  return [...body.matchAll(new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*([^;]+)`, "g"))].map((match) => match[1].trim());
}

function countTextRoles(globals) {
  const roles = new Set([...globals.matchAll(/--type-([a-z]+)-size\s*:/g)].map((match) => match[1]));
  return [...roles];
}

function validateTailwindRoles(errors) {
  const configPath = path.join(ROOT, "tailwind.config.js");
  delete require.cache[configPath];
  const config = require(configPath);
  const sizes = config.theme?.extend?.fontSize ?? {};
  for (const [key, value] of Object.entries(sizes)) {
    const size = Array.isArray(value) ? value[0] : value;
    if (!/^var\(--type-[a-z]+-size\)$/.test(size)) errors.push(`tailwind fontSize "${key}" must resolve to a --type-* role (got ${size})`);
  }
  const weights = config.theme?.extend?.fontWeight ?? {};
  for (const name of ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"]) {
    if (!WEIGHTS.has(String(weights[name]))) errors.push(`tailwind fontWeight "${name}" must fold onto 400, 600, or 800`);
  }
}

const RADIUS_UTILITY_PX = {
  "rounded-none": "0", rounded: "10px", "rounded-sm": "10px", "rounded-md": "10px", "rounded-lg": "12px",
  "rounded-xl": "18px", "rounded-2xl": "16px", "rounded-3xl": "24px", "rounded-full": "pill",
  "rounded-sheet": "18px", "rounded-inset": "12px",
};

function normalizeRadius(value) {
  const v = value.trim().replace(/\s+/g, " ");
  if (/^50%$|^9999rem$/.test(v) || Number(v.match(/^(\d+)px$/)?.[1]) >= 100) return "pill";
  const rem = v.match(/^([\d.]+)rem$/);
  if (rem) return `${Number(rem[1]) * 16}px`;
  const known = { "var(--radius)": "10px", "var(--radius-sm)": "10px", "var(--radius-lg)": "12px", "var(--radius-xl)": "18px", "var(--radius-sheet)": "18px", "var(--radius-inset)": "12px", inherit: null, "0": "0" };
  return v in known ? known[v] : v;
}

function collectGeometry() {
  const radii = new Map();
  const shadows = new Map();
  const note = (map, value, where) => {
    if (value === null || value === undefined) return;
    if (!map.has(value)) map.set(value, where);
  };
  for (const file of productFiles([".css"]).filter((file) => !ILLUSTRATIONS.has(file))) {
    for (const [, body] of cssRules(read(file))) {
      for (const value of declarations(body, "border-radius")) note(radii, normalizeRadius(value), file);
      for (const value of declarations(body, "box-shadow")) if (!/^none\b/.test(value)) note(shadows, value.replace(/\s+/g, " "), file);
    }
  }
  for (const file of productFiles([".tsx", ".ts"]).filter((file) => !ILLUSTRATIONS.has(file))) {
    const source = read(file);
    for (const match of source.matchAll(/(?<![\w-])rounded(?:-(?:t|b|l|r|tl|tr|bl|br|s|e))?(?:-(none|sm|md|lg|xl|2xl|3xl|full|sheet|inset))?(?:-\[([^\]]+)\])?(?![\w-])/g)) {
      const token = match[2] ? normalizeRadius(match[2]) : RADIUS_UTILITY_PX[`rounded${match[1] ? `-${match[1]}` : ""}`];
      note(radii, token, file);
    }
    for (const match of source.matchAll(/(?<![\w:-])shadow(?:-(sm|md|lg|xl|2xl|inner|sheet|\[[^\]]+\]))?(?![\w-])/g)) {
      note(shadows, `shadow${match[1] ? `-${match[1]}` : ""}`, file);
    }
  }
  return { radii, shadows };
}

function countButtonSystem(errors) {
  const source = read("components/ui/button.tsx");
  const block = (name) => source.match(new RegExp(`${name}:\\s*\\{([\\s\\S]*?)\\n\\s{12}\\}`))?.[1] ?? "";
  const keys = (text) => [...text.matchAll(/^\s{16}(?:\/\/[^\n]*\n\s{16})?([a-zA-Z]+):/gm)].map((match) => match[1]);
  const variants = keys(block("variant"));
  const sizes = keys(block("size"));
  for (const size of ["sm", "md", "lg"]) if (!sizes.includes(size)) errors.push(`Button is missing the ${size} size`);
  const heights = { sm: "min-h-11", md: "min-h-12", lg: "min-h-[3.75rem]" };
  for (const [size, height] of Object.entries(heights)) {
    if (!new RegExp(`${size}:\\s*"[^"]*${height.replace(/[[\]]/g, "\\$&")}`).test(source)) errors.push(`Button ${size} must be ${height} (44/48/60px)`);
  }
  return { variants, sizes };
}

function countHandBuiltPills() {
  const offenders = [];
  for (const file of productFiles([".tsx", ".ts"])) {
    if (file === "components/ui/button.tsx") continue;
    const source = read(file);
    for (const match of source.matchAll(/["'`]([^"'`]*\brounded-full\b[^"'`]*)["'`]/g)) {
      const cls = match[1];
      if (/\bmin-h-/.test(cls) && /(?<![\w:/-])(?:bg-foreground|bg-primary|bg-ink)(?![\w/-])/.test(cls)) offenders.push(file);
    }
  }
  for (const file of productFiles([".module.css"])) {
    for (const [selector, body] of cssRules(read(file))) {
      const pill = declarations(body, "border-radius").some((v) => normalizeRadius(v) === "pill");
      const ink = declarations(body, "background").concat(declarations(body, "background-color")).some((v) => /--(?:text-strong|primary|foreground)\)/.test(v));
      if (pill && ink && declarations(body, "min-height").length) offenders.push(`${file} ${selector}`);
    }
  }
  return offenders;
}

function countButtonOverrides() {
  const offenders = [];
  const override = /(?<![\w:-])(?:min-h-\S+|h-(?:8|9|10|11|12|14)|px-\d\S*|py-\d\S*|text-(?:2xs|xs|sm|base|lg|xl)|font-(?:normal|medium|semibold|bold)|rounded-(?!full)\S+)(?![\w-])/;
  for (const file of productFiles([".tsx"])) {
    if (file === "components/ui/button.tsx") continue;
    const source = read(file);
    for (const match of source.matchAll(/<Button\b((?:[^<>{}]|\{(?:[^{}]|\{[^{}]*\})*\})*?)>/g)) {
      if (/size="icon"/.test(match[1])) continue;
      const classes = [...match[1].matchAll(/className=(?:"([^"]*)"|\{([\s\S]*)\})/g)].map((m) => m[1] ?? m[2]).join(" ");
      const hit = classes.match(override);
      if (hit) offenders.push(`${file} -> ${hit[0]}`);
    }
  }
  return offenders;
}

function countAdHocHovers() {
  let count = 0;
  for (const file of productFiles([".tsx", ".ts"])) {
    if (file.startsWith("components/ui/")) continue;
    count += (read(file).match(/(?<![\w-])hover:(?:bg|border|opacity|underline|no-underline|shadow|scale|translate|-translate)[\w/.[\]-]*/g) ?? []).length;
  }
  return count;
}

function validateTypeDeclarations(errors) {
  const rawSizes = [];
  const badWeights = [];
  for (const file of productFiles([".css"])) {
    const source = read(file);
    for (const [selector, body] of cssRules(source)) {
      for (const value of declarations(body, "font-size")) {
        if (/var\(--type-[a-z]+-size\)|^inherit$|^[\d.]+em$/.test(value)) continue;
        if (!RAW_SIZE_EXEMPT.has(file)) rawSizes.push(`${file} ${selector} -> ${value}`);
      }
      for (const value of declarations(body, "font-weight")) {
        if (/^var\(--weight-[a-z]+\)$/.test(value) || WEIGHTS.has(value) || /^\d+ \d+$/.test(value)) continue;
        if (!RAW_SIZE_EXEMPT.has(file)) badWeights.push(`${file} ${selector} -> ${value}`);
      }
      const font = declarations(body, "font").find((value) => !/^var\(--type-[a-z]+\)$|var\(--type-[a-z]+-size\)|^inherit$/.test(value));
      if (font && !RAW_SIZE_EXEMPT.has(file)) rawSizes.push(`${file} ${selector} -> font: ${font}`);
    }
  }
  for (const file of productFiles([".tsx", ".ts"])) {
    const source = read(file);
    for (const match of source.matchAll(/(?<![\w-])(?:[a-z]+:)*text-\[(?:length:)?[\d.]+(?:px|rem|em)\]|text-\[clamp\([^\]]+\]/g)) rawSizes.push(`${file} -> ${match[0]}`);
    for (const match of source.matchAll(/(?<![\w-])font-\[\d+\]/g)) badWeights.push(`${file} -> ${match[0]}`);
  }
  if (badWeights.length) errors.push(`Font weights must be 400, 600, or 800:\n    ${badWeights.slice(0, 20).join("\n    ")}`);
  return rawSizes;
}

function countLeadingOverrides() {
  let count = 0;
  for (const file of productFiles([".tsx", ".ts"])) {
    count += (read(file).match(/(?<![\w:-])(?:(?:sm|md|lg):)?leading-(?:\d+|none|tight|snug|normal|relaxed|loose|\[[^\]]+\])(?![\w-])/g) ?? []).length;
  }
  return count;
}

function countLegacyTypeUtilities() {
  let count = 0;
  for (const file of productFiles([".tsx", ".ts"])) {
    count += (read(file).match(/(?<![\w-])(?:riyp-(?:type|weight|track|display)-[\w-]+|text-(?:report-title|data))(?![\w-])/g) ?? []).length;
  }
  return count;
}

/** The shared reading rails, converted to characters per line at the prose size (18px Schibsted Grotesk). */
function validateProseMeasure(errors) {
  // Average advance of running English text in Schibsted Grotesk 400, in em. Measured Nov 1, 2026 with canvas
  // on 44 body paragraphs across six research, legal, and guide routes (0.456-0.470). A "0" is 0.611em, so a
  // 66ch rail sets about 87 characters per full line.
  const AVERAGE_ADVANCE_EM = 0.46;
  const ZERO_ADVANCE_EM = 0.611;
  const config = require(path.join(ROOT, "tailwind.config.js"));
  const reading = config.theme?.extend?.maxWidth?.reading ?? "";
  const toCharacters = (width) => {
    const ch = width.match(/^([\d.]+)ch$/);
    if (ch) return (Number(ch[1]) * ZERO_ADVANCE_EM) / AVERAGE_ADVANCE_EM;
    const rem = width.match(/^([\d.]+)rem$/);
    if (rem) return (Number(rem[1]) * 16) / (18 * AVERAGE_ADVANCE_EM);
    return Infinity;
  };
  const rails = { "max-w-reading": reading };
  const globals = read("app/globals.css");
  for (const rail of [".riyp-prose", ".research-body"]) {
    const rule = cssRules(globals).find(([selector]) => selector.trim() === rail);
    if (rule) rails[rail] = declarations(rule[1], "max-width")[0] ?? "none";
  }
  const measured = {};
  for (const [name, width] of Object.entries(rails)) {
    const characters = Math.round(toCharacters(width));
    measured[name] = characters;
    if (characters > STYLE_BUDGETS.proseMeasure) errors.push(`${name} (${width}) sets about ${characters} characters per line; keep shared reading rails at ${STYLE_BUDGETS.proseMeasure} or fewer.`);
  }
  return measured;
}

export function validateStyleBudgets() {
  const errors = [];
  const globals = read("app/globals.css");
  const roles = countTextRoles(globals);
  validateTailwindRoles(errors);
  const rawSizes = validateTypeDeclarations(errors);
  const { variants, sizes } = countButtonSystem(errors);
  const pills = countHandBuiltPills();
  const buttonOverrides = countButtonOverrides();
  const { radii, shadows } = collectGeometry();
  const hovers = countAdHocHovers();
  const legacy = countLegacyTypeUtilities();
  const leading = countLeadingOverrides();
  const measure = validateProseMeasure(errors);

  const over = (label, value, budget, detail = "") => {
    if (value > budget) errors.push(`${label}: ${value} exceeds the budget of ${budget}.${detail}`);
  };
  over("Text roles", roles.length, STYLE_BUDGETS.textRoles, ` Roles: ${roles.join(", ")}`);
  over("Button variants", variants.length, STYLE_BUDGETS.buttonVariants, ` Variants: ${variants.join(", ")}`);
  over("Button sizes", sizes.length, STYLE_BUDGETS.buttonSizes);
  over("Hand-built pill buttons (use components/ui/button.tsx)", pills.length, STYLE_BUDGETS.handBuiltPills, `\n    ${pills.slice(0, 20).join("\n    ")}`);
  over("Button restyled through className (pick a size and variant instead)", buttonOverrides.length, STYLE_BUDGETS.buttonOverrides, `\n    ${buttonOverrides.slice(0, 20).join("\n    ")}`);
  over("Distinct corner radii", radii.size, STYLE_BUDGETS.radii, ` Values: ${[...radii.keys()].join(", ")}`);
  over("Distinct shadows", shadows.size, STYLE_BUDGETS.shadows, ` Values: ${[...shadows.keys()].join(" | ")}`);
  over("Ad-hoc hover utilities (use Button, .riyp-link, or .riyp-surface-link)", hovers, STYLE_BUDGETS.adHocHovers);
  over("Legacy type utilities (riyp-type/weight/track/display, text-report-title, text-data)", legacy, STYLE_BUDGETS.legacyTypeUtilities);
  over("Line-height overrides (leading-*) on top of a type role", leading, STYLE_BUDGETS.leadingOverrides);
  over("Raw font sizes outside the type roles", rawSizes.length, STYLE_BUDGETS.rawCssFontSizes, `\n    ${rawSizes.slice(0, 20).join("\n    ")}`);

  return {
    errors,
    summary: {
      textRoles: roles.length,
      buttonVariants: variants.length,
      buttonSizes: sizes.length,
      handBuiltPills: pills.length,
      buttonOverrides: buttonOverrides.length,
      radii: radii.size,
      shadows: shadows.size,
      adHocHovers: hovers,
      legacyTypeUtilities: legacy,
      leadingOverrides: leading,
      rawFontSizes: rawSizes.length,
      proseMeasure: measure,
    },
  };
}
