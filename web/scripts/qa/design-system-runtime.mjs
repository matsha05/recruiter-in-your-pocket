import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const MARKER_ASSET_BUDGETS = [
  { file: "public/assets/brand/citron-marker-shallow-v3.webp", maxBytes: 50 * 1024 },
  { file: "public/assets/brand/citron-marker-bold-v3.webp", maxBytes: 200 * 1024 },
];

function validateCanonicalPalette(globalsSource) {
  const rootSource = globalsSource.match(/:root\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  const tokens = new Map([...rootSource.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
  const expected = {
    "--background": "f6f3ef",
    "--surface-page": "f6f3ef",
    "--card": "fbfaf8",
    "--secondary": "f0efeb",
    "--foreground": "12191b",
    "--primary": "12191b",
    "--text-muted": "5f6667",
    "--muted-foreground": "5f6667",
    "--brand": "00738f",
    "--ring": "00738f",
    "--brand-tint": "e6f3f2",
    "--surface-sky": "e6f3f2",
    "--line": "dcdedb",
    "--control-line": "7e888a",
    "--input": "7e888a",
  };
  const errors = [];

  for (const [token, hex] of Object.entries(expected)) {
    let value = tokens.get(token) ?? "";
    const visited = new Set([token]);
    while (/^var\((--[\w-]+)\)$/.test(value)) {
      const reference = value.slice(4, -1);
      if (visited.has(reference)) break;
      visited.add(reference);
      value = tokens.get(reference) ?? "";
    }
    const match = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    if (!match) {
      errors.push(`${token} must resolve to HSL channels compatible with hsl(var(...)).`);
      continue;
    }
    const hue = Number(match[1]) / 60;
    const saturation = Number(match[2]) / 100;
    const lightness = Number(match[3]) / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const secondary = chroma * (1 - Math.abs(hue % 2 - 1));
    const offset = lightness - chroma / 2;
    const sectors = [[chroma, secondary, 0], [secondary, chroma, 0], [0, chroma, secondary], [0, secondary, chroma], [secondary, 0, chroma], [chroma, 0, secondary]];
    const rgb = sectors[Math.floor(hue) % 6].map((channel) => Math.round((channel + offset) * 255));
    const target = hex.match(/../g).map((channel) => parseInt(channel, 16));
    if (rgb.some((channel, index) => Math.abs(channel - target[index]) > 1)) {
      errors.push(`${token} must represent the approved Alpine color #${hex}.`);
    }
  }

  return errors;
}

export function validateRuntimeSystem() {
  const globalsSource = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
  const tailwindSource = fs.readFileSync(path.join(ROOT, "tailwind.config.js"), "utf8");
  const errors = validateCanonicalPalette(globalsSource);

  const requiredTokenDefinitions = [
    '--font-brand-sans: "Instrument Sans"',
    '--font-editorial: "Source Serif 4"',
    "--font-display: var(--font-brand-sans)",
    "--font-body: var(--font-brand-sans)",
    "--font-mono: var(--font-brand-sans)",
    "--weight-display: 700",
    "--weight-heading: 650",
    "--weight-title: 600",
    "--weight-body: 400",
    "--weight-control: 600",
    "--weight-label: 600",
    "--brand-strong:",
    "--brand-tint:",
    "--surface-sky:",
    "--surface-proof:",
    "--accent-apricot:",
    "--accent-butter:",
    "--text-muted:",
    "--line:",
    "--control-line:",
    "--radius-sheet:",
    "--radius-inset:",
    "--success-surface:",
    "--warning-surface:",
    "--destructive-surface:",
    "--disabled-surface:",
  ];

  for (const token of requiredTokenDefinitions) {
    if (!globalsSource.includes(token)) errors.push(`globals.css missing ${token}`);
  }

  const forbiddenRuntimeClaims = [
    "Brand: Teal",
    "V2.1 Brand: Teal",
    "Sentient (Display)",
    '--font-brand-sans: "Satoshi Variable"',
    "--font-editorial: Georgia",
  ];
  for (const claim of forbiddenRuntimeClaims) {
    if (globalsSource.includes(claim)) errors.push(`globals.css contains stale claim: ${claim}`);
  }

  for (const token of ["brand", "paper", "line", "iris", "surface-sky", "accent-apricot", "accent-butter", "control-line", "error-surface", "success-surface", "warning-surface", "disabled-surface"]) {
    if (!tailwindSource.includes(`${token}:`) && !tailwindSource.includes(`'${token}':`)) {
      errors.push(`tailwind.config.js missing ${token} semantic alias`);
    }
  }

  if (/citron-marker-(?:shallow|bold)-v3\.png/.test(globalsSource)) {
    errors.push("globals.css must use the optimized WebP marker assets");
  }
  for (const { file, maxBytes } of MARKER_ASSET_BUDGETS) {
    // Retired artwork may remain for historical surfaces, but the active
    // Alpine system must not require a neon marker to be wired into CSS.
    const publicHref = `/${file.replace(/^public\//, "")}`;
    if (!globalsSource.includes(publicHref)) continue;
    const assetPath = path.join(ROOT, file);
    if (!fs.existsSync(assetPath)) {
      errors.push(`missing marker asset: ${file}`);
      continue;
    }
    if (fs.statSync(assetPath).size > maxBytes) {
      errors.push(`${file} exceeds its ${Math.round(maxBytes / 1024)} KB transfer budget`);
    }
  }

  return errors;
}

export function validateFontStack() {
  const layoutPath = path.join(ROOT, "app", "layout.tsx");
  const layoutSource = fs.readFileSync(layoutPath, "utf8");
  const globalsSource = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
  const layoutErrors = [];
  const dependencyErrors = [];

  if (/@fontsource-variable\/space-grotesk/.test(layoutSource) || /Satoshi Variable/.test(layoutSource)) {
    layoutErrors.push("The browser layout still imports a retired branded font.");
  }

  const fontFaces = globalsSource.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  const requiredFaces = [
    { family: "Instrument Sans", href: "/fonts/instrument-sans/InstrumentSans-Variable.woff2", weights: "400 700" },
    { family: "Source Serif 4", href: "/fonts/source-serif-4/SourceSerif4-Variable.woff2", weights: "200 900" },
  ];
  for (const { family, href, weights } of requiredFaces) {
    const fontFace = fontFaces.find((face) => face.includes(`font-family: "${family}"`)) ?? "";
    for (const declaration of [
      `url("${href}")`,
      'format("woff2")',
      `font-weight: ${weights}`,
      "font-style: normal",
      "font-display: swap",
    ]) {
      if (!fontFace.includes(declaration)) {
        layoutErrors.push(`The local ${family} @font-face is missing ${declaration}.`);
      }
    }

    const fontAsset = path.join(ROOT, "public", href.replace(/^\//, ""));
    if (!fs.existsSync(fontAsset) || fs.statSync(fontAsset).size === 0) {
      dependencyErrors.push(`Missing local font asset: public${href}`);
    }
  }
  if (fontFaces.some((face) => /font-family:\s*["']Satoshi Variable["']/.test(face))) {
    layoutErrors.push("globals.css still declares the retired Satoshi face.");
  }

  return { dependencyErrors, layoutErrors };
}
