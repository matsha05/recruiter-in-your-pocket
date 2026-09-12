import fs from "node:fs";
import path from "node:path";
import { validateFontStack, validateRuntimeSystem } from "./design-system-runtime.mjs";

const ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".md", ".mdx"]);

const EXCLUDED_DIRS = new Set([
  ".next", "node_modules", "dist", "coverage",
]);

const PRODUCTION_SCOPE_DIRS = [
  "app", "components", "lib",
];

const SYSTEM_NAME = "Alpine 1.0";
// Compatibility-first lock: these are the measured July 12 Lifted Line 1.1
// baselines after the cross-surface launch migration. New work may reduce this
// debt, but cannot silently increase it.
const DESIGN_DEBT_BUDGETS = {
  arbitraryClasses: 615,
  legacyPaletteClasses: 809,
  inlineStyleProps: 69,
  rawButtons: 94,
  rawInputs: 13,
};

const RESEARCH_SYSTEM_FILES = [
  "components/research/ResearchClient.tsx", "components/research/ResearchArticle.tsx",
  "components/shared/diagrams/DiagramPrimitives.tsx", "components/shared/diagrams/EvidenceVisuals.tsx",
];

const LEGACY_PALETTE_PATTERN = /\b(?:text|bg|border|ring|outline|decoration|divide|from|via|to)-(?:teal|emerald|cyan|indigo|violet|purple|slate|gray|zinc|neutral|stone|rose|amber|yellow|orange|blue|sky)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/[0-9]{1,3})?\b/g;

const HEX_ALLOWLIST = new Set([
  "app/globals.css",
  "app/manifest.ts",
  "app/icon.tsx",
  "app/apple-icon.tsx",
  // Next ImageResponse requires inline, literal styles and cannot consume the
  // runtime CSS token sheet. Values here must mirror the canonical palette.
  "app/opengraph-image.tsx",
  "app/(editorial)/guides/tools/comp-calculator/page.tsx",
  "components/research/diagrams/LinkedInResumeFlow.tsx",
  "lib/backend/pdf.ts",
  // Browserless PDF CSS mirrors the canonical palette because app variables are unavailable.
  "lib/backend/pdf-styles.ts",
  // Email clients require inline literal colors. The auth-email contract pins
  // these literals to the canonical warm-neutral/ink/aqua palette.
  "lib/auth/otpEmail.ts",
  // The forwarded support notice must remain legible and visually distinct in
  // email clients that cannot consume the runtime CSS token sheet.
  "lib/support/inboundEmail.ts",
]);

// These four modules reconstruct the approved photograph's lacquer, brass,
// shadows and engraved markings. Material samples are image data, not a new UI
// palette. Keep this exact-file exception out of React UI and CSS modules;
// validate the live paper text and keyboard focus separately below.
const CALIBRATED_ARTWORK_FILES = new Set([
  "components/landing/instrument/runtime/instrument-dial.ts",
  "components/landing/instrument/runtime/instrument-keys.ts",
  "components/landing/instrument/runtime/instrument-power.ts",
  "components/landing/instrument/runtime/reference-instrument.ts",
]);

const INLINE_STYLE_EXCLUSIONS = new Set([
  // Satori renders metadata images from inline style objects by contract.
  "app/opengraph-image.tsx",
  "app/icon.tsx",
  "app/apple-icon.tsx",
]);

const ARBITRARY_CLASS_EXCLUDED_PREFIXES = [
  "app/internal/",
  "app/playground/",
  "app/sentry-example-page/",
  "app/preview/",
  "components/internal/",
  "components/landing-showcase/",
];

const NON_PRODUCT_PREFIXES = [
  "app/internal/",
  "app/playground/",
  "app/sentry-example-page/",
  "app/preview/",
  "components/internal/",
  "components/landing-showcase/",
];

// Model instructions and evaluation language are product logic, not public UI
// copy. Keep brand cleanup from silently rewriting Matt's tuned prompts.
const COPY_GUARDRAIL_EXCLUDED_PREFIXES = [
  "app/api/",
  "lib/backend/prompts.ts",
  "lib/evals/",
  "lib/matching/",
];

const BANNED_COPY_PATTERNS = [
  { label: "operator-style", regex: /\boperator-style\b/i },
  { label: "first-pass filter", regex: /\bfirst-pass filter\b/i },
  { label: "unlock velocity", regex: /\bunlock velocity\b/i },
  { label: "ai-powered excellence", regex: /\bai-powered excellence\b/i },
  { label: "recruiter read", regex: /\brecruiter read\b/i },
  { label: "get the recruiter read", regex: /\bget the recruiter read\b/i },
  { label: "tighten the read", regex: /\btighten the read\b/i },
  { label: "dragging the read down", regex: /\bdragging the read down\b/i },
  // Plain "AI-powered" disclosure is allowed when it explains how the
  // product works. Promotional hype such as "AI-powered excellence" remains
  // explicitly banned above.
  { label: "smart insights", regex: /\bsmart insights\b/i },
  { label: "stand out from the crowd", regex: /\bstand out from the crowd\b/i },
  { label: "land your dream job", regex: /\bland your dream job\b/i },
  { label: "transform your resume", regex: /\btransform your resume\b/i },
  { label: "browse by decision", regex: /\bbrowse by decision\b/i },
  { label: "internal RIYP acronym", regex: /\b(?:how|what) RIYP\b/i },
  { label: "recruiter lens label", regex: /\brecruiter lens\b/i },
  { label: "definition heading", regex: /\bDefinition:/i },
  { label: "bounded control", regex: /\bbounded control\b/i },
  { label: "signal density", regex: /\bsignal density\b/i },
];

function normalize(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".well-known") continue;
    const absolutePath = path.join(dir, entry.name);
    const relativePath = normalize(path.relative(ROOT, absolutePath));

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      walk(absolutePath, files);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    files.push(relativePath);
  }
  return files;
}

function inProductionScope(file) {
  return PRODUCTION_SCOPE_DIRS.some((dir) => file.startsWith(`${dir}/`));
}

function isArbitraryClassExcluded(file) {
  return ARBITRARY_CLASS_EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function isNonProductFile(file) {
  return NON_PRODUCT_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function countMatches(source, regex) {
  const matches = source.match(regex);
  return matches ? matches.length : 0;
}

function countRawTextInputs(source) {
  const inputs = source.match(/<input\b[^>]*>/g) ?? [];
  return inputs.filter((input) => !/\btype=["'](?:range|file|checkbox|radio|hidden)["']/.test(input)).length;
}

function findInstrumentUiColorViolations(source) {
  const issues = [];
  // Runtime styles are plain CSS template literals. Restrict the artwork
  // exception to physical rendering: feedback ink and focus remain semantic.
  for (const rule of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim();
    const declarations = rule[2];
    if (/\.ri-[\w-]+:focus-visible\b/.test(selector)) {
      const outline = declarations.match(/(?:^|;)\s*outline(?:-color)?\s*:\s*([^;]+)/)?.[1];
      if (outline && !/var\(--(?:ring|surface-page)\)/.test(outline)) {
        issues.push("keyboard focus must use --ring or contrasting --surface-page");
      }
    }
    if (!/\.ri-(?:paper(?:-[\w-]+)?|source(?:-[\w-]+)?|response(?:-[\w-]+)?|caveat|job)(?=[\s.[#:>,]|$)/.test(selector)) continue;
    for (const declaration of declarations.matchAll(/(?:^|;)\s*(color|text-decoration-color)\s*:\s*([^;]+)/g)) {
      if (!/var\(--(?:text-strong|text-muted|brand(?:-strong)?)\)/.test(declaration[2]) &&
          !/^(?:inherit|currentColor)\s*$/.test(declaration[2])) {
        issues.push(`${selector} -> ${declaration[1]} must use a shared text or brand token`);
      }
    }
  }
  return issues;
}

function findViolations(files) {
  const violations = {
    externalFontImport: [],
    legacyFontBranding: [],
    hardcodedHex: [],
    bannedTerms: [],
    arbitraryClassCount: 0,
    legacyPaletteClassCount: 0,
    inlineStylePropCount: 0,
    rawButtonCount: 0,
    rawInputCount: 0,
  };

  for (const file of files) {
    if (!inProductionScope(file)) continue;
    if (isNonProductFile(file)) continue;

    const absolutePath = path.join(ROOT, file);
    const source = fs.readFileSync(absolutePath, "utf8");
    const lower = source.toLowerCase();

    if (
      lower.includes("fonts.googleapis.com") ||
      lower.includes("api.fontshare.com/v2/css")
    ) {
      violations.externalFontImport.push(file);
    }

    if (!file.startsWith("app/preview/") && /(Fraunces|Geist|Newsreader|Sentient)/.test(source)) {
      violations.legacyFontBranding.push(file);
    }

    if (CALIBRATED_ARTWORK_FILES.has(file)) {
      violations.hardcodedHex.push(...findInstrumentUiColorViolations(source).map(issue => `${file} -> ${issue}`));
    } else if (!HEX_ALLOWLIST.has(file) && /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/.test(source)) {
      violations.hardcodedHex.push(file);
    }

    if (!COPY_GUARDRAIL_EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix))) {
      for (const pattern of BANNED_COPY_PATTERNS) {
        if (pattern.regex.test(source)) {
          violations.bannedTerms.push(`${file} -> "${pattern.label}"`);
        }
      }
    }

    if (file.endsWith(".tsx") && !isArbitraryClassExcluded(file)) {
      violations.arbitraryClassCount += countMatches(
        source,
        /\b(?:text|bg|border|rounded|p|px|py|m|mt|mb|ml|mr|gap|tracking|leading|min-w|max-w|min-h|max-h|w|h|size|grid-cols|grid-rows|shadow|translate-x|translate-y|top|right|bottom|left|z)-\[[^\]]+\]/g
      );

      violations.legacyPaletteClassCount += countMatches(
        source,
        LEGACY_PALETTE_PATTERN
      );
      if (!INLINE_STYLE_EXCLUSIONS.has(file)) {
        violations.inlineStylePropCount += countMatches(source, /style=\{\{/g);
      }
      violations.rawButtonCount += countMatches(source, /<button\b/g);
      violations.rawInputCount += countRawTextInputs(source);
    }
  }

  return violations;
}

function validateResearchSystem() {
  const errors = [];

  for (const file of RESEARCH_SYSTEM_FILES) {
    const source = fs.readFileSync(path.join(ROOT, file), "utf8");
    LEGACY_PALETTE_PATTERN.lastIndex = 0;
    if (LEGACY_PALETTE_PATTERN.test(source)) {
      errors.push(`${file} still uses direct palette classes`);
    }
  }

  for (const file of walk(path.join(ROOT, "components", "research"))) {
    const relative = path.relative(ROOT, file);
    if (!file.endsWith(".tsx")) continue;
    const source = fs.readFileSync(file, "utf8");
    if (source.includes('from "lucide-react"') || source.includes("from 'lucide-react'")) {
      errors.push(`${relative} still imports Lucide`);
    }
  }

  return errors;
}

function validateDocs() {
  const designSystemDoc = path.join(ROOT, "..", "docs", "design-system.md");
  const content = fs.readFileSync(designSystemDoc, "utf8");
  const brandSystemDoc = fs.readFileSync(path.join(ROOT, "..", "docs", "brand-system.md"), "utf8");
  const voiceAndToneDoc = fs.readFileSync(path.join(ROOT, "..", "docs", "voice-and-tone.md"), "utf8");
  const legacyAgentEntry = fs.readFileSync(path.join(ROOT, "..", ".agent", "AGENTS.md"), "utf8");
  const rootAgentPath = path.join(ROOT, "..", "AGENTS.md");
  const designStandardsPath = path.join(ROOT, "..", "docs", "agent-design-standards.md");
  // Instruction relocation is independent of a product release. Validate the
  // original canonical file when that layout is present; a partially relocated
  // layout must still fail its routing checks rather than silently fall back.
  const routedInstructions = fs.existsSync(rootAgentPath) || fs.existsSync(designStandardsPath) || legacyAgentEntry.includes("(../AGENTS.md)");
  const agentInstructions = fs.existsSync(rootAgentPath) ? fs.readFileSync(rootAgentPath, "utf8") : "";
  const agentDesignStandards = routedInstructions
    ? (fs.existsSync(designStandardsPath) ? fs.readFileSync(designStandardsPath, "utf8") : "")
    : legacyAgentEntry;
  const fontOperationsDoc = fs.readFileSync(path.join(ROOT, "..", "docs", "font-operations.md"), "utf8");
  const researchContractDoc = fs.readFileSync(path.join(ROOT, "..", "docs", "research-ui-contract.md"), "utf8");
  const articleStandardDoc = fs.readFileSync(path.join(ROOT, "app", "(editorial)", "research", "article-standard.md"), "utf8");
  const canonicalDocs = [content, brandSystemDoc, agentDesignStandards, fontOperationsDoc, researchContractDoc, articleStandardDoc];
  const missing = [];

  const requiredStrings = [
    SYSTEM_NAME,
    "Instrument Sans",
    "Source Serif 4",
    "--font-brand-sans",
    "--font-editorial",
    "--brand-strong",
    "--citron",
    "--cyan-bright",
    "--surface-sky",
    "--accent-apricot",
    "--accent-butter",
    "--font-display",
    "--font-body",
    "--space-4",
    "--space-72",
    "#f6f3ef",
    "#fbfaf8",
    "#f0efeb",
    "#12191b",
    "#5f6667",
    "#00738f",
    "#e6f3f2",
    "#dcdedb",
    "#7e888a",
    "16px / 25px",
    "18px / 30px",
    "qa:design-system",
  ];

  for (const token of requiredStrings) {
    if (!content.includes(token)) {
      missing.push(token);
    }
  }

  if (!brandSystemDoc.includes("The direction: Alpine")) {
    missing.push("brand-system.md -> The direction: Alpine");
  }
  if (!voiceAndToneDoc.includes("plainspoken expertise")) {
    missing.push("voice-and-tone.md -> plainspoken expertise");
  }
  if (routedInstructions) {
    if (!legacyAgentEntry.includes("(../AGENTS.md)")) {
      missing.push(".agent/AGENTS.md -> repository-root AGENTS.md routing");
    }
    for (const reference of ["agent-design-standards.md", "brand-system.md", "design-system.md"]) {
      if (!agentInstructions.includes(`(docs/${reference})`)) {
        missing.push(`AGENTS.md -> docs/${reference} routing`);
      }
    }
  }
  if (!agentDesignStandards.includes("Alpine is the approved visual direction")) {
    missing.push(`${routedInstructions ? "docs/agent-design-standards.md" : ".agent/AGENTS.md"} -> Alpine approved direction`);
  }
  for (const [index, doc] of canonicalDocs.entries()) {
    for (const family of ["Instrument Sans", "Source Serif 4"]) {
      if (!doc.includes(family)) missing.push(`canonical document ${index + 1} -> ${family}`);
    }
  }

  const staleClaims = [
    "Display, interface, and data: **Instrument Sans Variable**",
    "Teal should feel precise and fresh",
    "Fonts: Sentient",
    "Fonts: Fraunces",
    "Newsreader Variable",
    "Browser fonts: Satoshi Variable",
    "Shared sans: `Satoshi Variable`",
    "controls 550",
    "labels 500",
    "The Lifted Line system is mostly rectilinear",
    "Marketing and product chrome use ink",
    "Citron owns decisive action and progress",
  ];
  for (const claim of staleClaims) {
    if ([...canonicalDocs, voiceAndToneDoc].some((doc) => doc.includes(claim))) {
      missing.push(`stale design-system claim -> ${claim}`);
    }
  }

  return missing;
}

function printList(label, list) {
  if (list.length === 0) return;
  console.error(`\n${label}`);
  for (const item of list.slice(0, 30)) {
    console.error(`- ${item}`);
  }
  if (list.length > 30) {
    console.error(`- ...and ${list.length - 30} more`);
  }
}

function main() {
  const files = walk(ROOT);
  const violations = findViolations(files);
  const missingDocTokens = validateDocs();
  const runtimeSystemErrors = validateRuntimeSystem();
  const fontValidation = validateFontStack();
  const researchSystemErrors = validateResearchSystem();

  const errors = [];

  if (violations.externalFontImport.length > 0) {
    errors.push("External font imports detected. Use self-hosted local fonts only.");
  }

  if (violations.legacyFontBranding.length > 0) {
    errors.push("Legacy font branding found in production code.");
  }

  if (violations.hardcodedHex.length > 0) {
    errors.push("Hardcoded hex colors found outside allowlist.");
  }

  if (violations.bannedTerms.length > 0) {
    errors.push("Banned copy terms found in production surfaces.");
  }

  if (violations.arbitraryClassCount > DESIGN_DEBT_BUDGETS.arbitraryClasses) {
    errors.push(
      `Arbitrary Tailwind class debt increased (${violations.arbitraryClassCount}). Keep <= ${DESIGN_DEBT_BUDGETS.arbitraryClasses} while migrating to semantic recipes.`
    );
  }

  if (violations.legacyPaletteClassCount > DESIGN_DEBT_BUDGETS.legacyPaletteClasses) {
    errors.push(`Direct Tailwind palette debt increased (${violations.legacyPaletteClassCount}). Keep <= ${DESIGN_DEBT_BUDGETS.legacyPaletteClasses}.`);
  }

  if (violations.inlineStylePropCount > DESIGN_DEBT_BUDGETS.inlineStyleProps) {
    errors.push(`Inline style debt increased (${violations.inlineStylePropCount}). Keep <= ${DESIGN_DEBT_BUDGETS.inlineStyleProps}.`);
  }

  if (violations.rawButtonCount > DESIGN_DEBT_BUDGETS.rawButtons) {
    errors.push(`Raw button count increased (${violations.rawButtonCount}). Use the shared Button primitive unless semantics require otherwise.`);
  }

  if (violations.rawInputCount > DESIGN_DEBT_BUDGETS.rawInputs) {
    errors.push(`Raw input count increased (${violations.rawInputCount}). Use the shared Input primitive unless semantics require otherwise.`);
  }

  if (missingDocTokens.length > 0) {
    errors.push("Design-system docs missing required tokens/commands.");
  }

  if (runtimeSystemErrors.length > 0) {
    errors.push("Alpine runtime contract is incomplete or stale.");
  }

  if (fontValidation.dependencyErrors.length > 0) {
    errors.push("Required self-hosted font assets are missing.");
  }

  if (researchSystemErrors.length > 0) {
    errors.push("Research system lock is incomplete.");
  }

  if (fontValidation.layoutErrors.length > 0) {
    errors.push("Font stack wiring in app/layout.tsx is incomplete.");
  }

  if (runtimeSystemErrors.length > 0) {
    console.error("\nRuntime design-system issues:");
    for (const issue of runtimeSystemErrors) console.error(`- ${issue}`);
  }

  printList("External font import violations", violations.externalFontImport);
  printList("Legacy font references", violations.legacyFontBranding);
  printList("Hardcoded color violations", violations.hardcodedHex);
  printList("Banned copy terms", violations.bannedTerms);

  if (missingDocTokens.length > 0) {
    console.error("\nMissing design-system doc tokens:");
    for (const token of missingDocTokens) {
      console.error(`- ${token}`);
    }
  }

  if (fontValidation.dependencyErrors.length > 0) {
    console.error("\nMissing font dependencies:");
    for (const file of fontValidation.dependencyErrors) {
      console.error(`- ${file}`);
    }
  }

  if (fontValidation.layoutErrors.length > 0) {
    console.error("\nFont wiring issues:");
    for (const issue of fontValidation.layoutErrors) {
      console.error(`- ${issue}`);
    }
  }

  console.log(`\nDesign-system guardrail summary`);
  console.log(`- Arbitrary class count: ${violations.arbitraryClassCount}`);
  console.log(`- Legacy palette class count: ${violations.legacyPaletteClassCount}`);
  console.log(`- Inline style prop count: ${violations.inlineStylePropCount}`);
  console.log(`- Raw button count: ${violations.rawButtonCount}`);
  console.log(`- Raw input count: ${violations.rawInputCount}`);
  console.log(`- External font imports: ${violations.externalFontImport.length}`);
  console.log(`- Legacy font references: ${violations.legacyFontBranding.length}`);
  console.log(`- Hardcoded hex violations: ${violations.hardcodedHex.length}`);
  console.log(`- Banned copy terms: ${violations.bannedTerms.length}`);

  if (errors.length > 0) {
    console.error("\nGuardrails failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("\nDesign-system guardrails passed.");
}

main();
