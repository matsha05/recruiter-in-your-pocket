import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".md", ".mdx"]);

const EXCLUDED_DIRS = new Set([
  ".next",
  "node_modules",
  "dist",
  "coverage",
]);

const PRODUCTION_SCOPE_DIRS = [
  "app",
  "components",
  "lib",
];

const HEX_ALLOWLIST = new Set([
  "app/globals.css",
  "app/manifest.ts",
  "app/icon.tsx",
  "app/apple-icon.tsx",
  "app/(editorial)/guides/tools/comp-calculator/page.tsx",
  "components/research/diagrams/LinkedInResumeFlow.tsx",
  "lib/backend/pdf.ts",
]);

const ARBITRARY_CLASS_EXCLUDED_PREFIXES = [
  "app/internal/",
  "app/playground/",
  "app/sentry-example-page/",
  "app/preview/",
  "components/landing-showcase/",
  "components/research/diagrams/",
];

const NON_PRODUCT_PREFIXES = [
  "app/internal/",
  "app/playground/",
  "app/sentry-example-page/",
  "app/preview/",
  "components/landing-showcase/",
];

const REQUIRED_LOCAL_FONT_FILES = [
  "public/fonts/sentient/sentient-400.woff2",
  "public/fonts/sentient/sentient-500.woff2",
  "public/fonts/sentient/sentient-700.woff2",
  "public/fonts/satoshi/satoshi-400.woff2",
  "public/fonts/satoshi/satoshi-500.woff2",
  "public/fonts/satoshi/satoshi-700.woff2",
];

const BANNED_TERMS = [
  "operator-style",
  "first-pass filter",
  "unlock velocity",
  "ai-powered excellence",
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

function findViolations(files) {
  const violations = {
    externalFontImport: [],
    legacyFontBranding: [],
    hardcodedHex: [],
    bannedTerms: [],
    arbitraryClassCount: 0,
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

    if (!file.startsWith("app/preview/") && /(Fraunces|Geist)/.test(source)) {
      violations.legacyFontBranding.push(file);
    }

    if (!HEX_ALLOWLIST.has(file) && /#[0-9a-fA-F]{3,8}\b/.test(source)) {
      violations.hardcodedHex.push(file);
    }

    for (const term of BANNED_TERMS) {
      if (lower.includes(term)) {
        violations.bannedTerms.push(`${file} -> "${term}"`);
      }
    }

    if (file.endsWith(".tsx") && !isArbitraryClassExcluded(file)) {
      violations.arbitraryClassCount += countMatches(
        source,
        /\b(text|bg|border|rounded|p|px|py|m|mt|mb|ml|mr|gap|tracking|leading)-\[[^\]]+\]/g
      );
    }
  }

  return violations;
}

function validateDocs() {
  const designSystemDoc = path.join(ROOT, "..", "docs", "design-system.md");
  const content = fs.readFileSync(designSystemDoc, "utf8");
  const missing = [];

  const requiredStrings = [
    "Sentient",
    "Satoshi",
    "--font-display",
    "--font-body",
    "--space-4",
    "--space-72",
    "qa:design-system",
  ];

  for (const token of requiredStrings) {
    if (!content.includes(token)) {
      missing.push(token);
    }
  }

  return missing;
}

function validateFontStack() {
  const missingFiles = [];
  for (const file of REQUIRED_LOCAL_FONT_FILES) {
    const absolute = path.join(ROOT, file);
    if (!fs.existsSync(absolute)) {
      missingFiles.push(file);
    }
  }

  const layoutPath = path.join(ROOT, "app", "layout.tsx");
  const layoutSource = fs.readFileSync(layoutPath, "utf8");
  const layoutErrors = [];

  if (!layoutSource.includes("next/font/local")) {
    layoutErrors.push('`app/layout.tsx` must use `next/font/local`.');
  }

  if (!layoutSource.includes("--font-sentient") || !layoutSource.includes("--font-satoshi")) {
    layoutErrors.push("Missing font variable wiring for Sentient/Satoshi in `app/layout.tsx`.");
  }

  const expectedFontPaths = [
    "/fonts/sentient/sentient-400.woff2",
    "/fonts/sentient/sentient-500.woff2",
    "/fonts/sentient/sentient-700.woff2",
    "/fonts/satoshi/satoshi-400.woff2",
    "/fonts/satoshi/satoshi-500.woff2",
    "/fonts/satoshi/satoshi-700.woff2",
  ];

  for (const fontPath of expectedFontPaths) {
    if (!layoutSource.includes(fontPath)) {
      layoutErrors.push(`Missing local font source in layout: ${fontPath}`);
    }
  }

  return { missingFiles, layoutErrors };
}

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function validateFontManifest() {
  const manifestPath = path.join(ROOT, "public", "fonts", "manifest.json");
  const errors = [];

  if (!fs.existsSync(manifestPath)) {
    errors.push("Missing font manifest: public/fonts/manifest.json");
    return errors;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`Invalid font manifest JSON: ${error instanceof Error ? error.message : String(error)}`);
    return errors;
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    errors.push("Font manifest must contain a non-empty `files` array.");
    return errors;
  }

  for (const entry of manifest.files) {
    const filePath = path.join(ROOT, entry.path ?? "");
    if (!entry.path || !entry.sha256) {
      errors.push(`Font manifest entry missing path or sha256: ${JSON.stringify(entry)}`);
      continue;
    }
    if (!fs.existsSync(filePath)) {
      errors.push(`Font manifest file missing on disk: ${entry.path}`);
      continue;
    }
    const actualSha = sha256File(filePath);
    if (actualSha !== entry.sha256) {
      errors.push(`Font checksum mismatch for ${entry.path}`);
    }
  }

  return errors;
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
  const fontValidation = validateFontStack();
  const fontManifestErrors = validateFontManifest();

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

  if (violations.arbitraryClassCount > 280) {
    errors.push(
      `Arbitrary Tailwind class usage too high (${violations.arbitraryClassCount}). Keep <= 280 in production scope.`
    );
  }

  if (missingDocTokens.length > 0) {
    errors.push("Design-system docs missing required tokens/commands.");
  }

  if (fontValidation.missingFiles.length > 0) {
    errors.push("Required local Sentient/Satoshi font files are missing.");
  }

  if (fontValidation.layoutErrors.length > 0) {
    errors.push("Font stack wiring in app/layout.tsx is incomplete.");
  }

  if (fontManifestErrors.length > 0) {
    errors.push("Font manifest validation failed.");
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

  if (fontValidation.missingFiles.length > 0) {
    console.error("\nMissing local font files:");
    for (const file of fontValidation.missingFiles) {
      console.error(`- ${file}`);
    }
  }

  if (fontValidation.layoutErrors.length > 0) {
    console.error("\nFont wiring issues:");
    for (const issue of fontValidation.layoutErrors) {
      console.error(`- ${issue}`);
    }
  }

  if (fontManifestErrors.length > 0) {
    console.error("\nFont manifest issues:");
    for (const issue of fontManifestErrors) {
      console.error(`- ${issue}`);
    }
  }

  console.log(`\nDesign-system guardrail summary`);
  console.log(`- Arbitrary class count: ${violations.arbitraryClassCount}`);
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
