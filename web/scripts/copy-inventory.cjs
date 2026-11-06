#!/usr/bin/env node
/**
 * Copy inventory: every user-facing string in the web app and the extension, by route and moment.
 *
 * Usage (from web/):
 *   node scripts/copy-inventory.cjs            # writes docs/copy/inventory/*.md and inventory.json
 *   node scripts/copy-inventory.cjs --check    # exits 1 when the committed inventory is stale
 *   node scripts/copy-inventory.cjs --stdout   # prints the counts only
 *
 * What counts as a string: JSX text, JSX attributes a reader sees (aria-label, title, placeholder,
 * alt, …), object properties with copy keys (title, description, label, body, q, a, cta, message, …),
 * sentence-like string constants, and the messages handed to toasts, ClientActionError and setError.
 * Each string is tied to the routes that import its file (walking app/**\/page.tsx, layout.tsx and
 * route.ts through the import graph) and to a moment (marketing, upload, analysis, report, rewrite,
 * research, pricing, auth, account, legal, error, email, pdf, extension, shared).
 *
 * Out of scope on purpose: the model's words (prompts, the sample report's content, fixtures),
 * tests, internal labs, and code the reader never sees (lib/llm, lib/evals, infrastructure).
 */

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");
const args = process.argv.slice(2);
const outDir = path.resolve(repoRoot, readFlag("--out") || "docs/copy/inventory");
const checkMode = args.includes("--check");
const stdoutOnly = args.includes("--stdout");

function readFlag(name) {
    const index = args.indexOf(name);
    return index === -1 ? null : args[index + 1];
}

// ============================================
// FILES
// ============================================

const SCAN_ROOTS = [
    { dir: path.join(webRoot, "app"), label: "web/app" },
    { dir: path.join(webRoot, "components"), label: "web/components" },
    { dir: path.join(webRoot, "lib"), label: "web/lib" },
    { dir: path.join(repoRoot, "extension/src"), label: "extension/src" },
];

/** Paths (relative to the repo root) the inventory never reads. */
const EXCLUDED_PATHS = [
    /node_modules\//,
    /\/tests?\//,
    /\.(test|spec)\.tsx?$/,
    /\.d\.ts$/,
    /web\/app\/internal\//,
    /web\/app\/playground\//,
    /web\/app\/\(app\)\/launch\//,
    /web\/lib\/evals\//,
    /web\/lib\/gauntlet\//,
    /web\/lib\/launch\//,
    /web\/lib\/llm\//,
    /web\/lib\/matching\//,
    /web\/lib\/observability\//,
    /web\/lib\/redis\//,
    /web\/lib\/supabase\//,
    /web\/lib\/security\//,
    /web\/lib\/runtime\//,
    /web\/lib\/inngest\//,
    /web\/lib\/validation\//,
    /web\/lib\/backend\//,
    /web\/lib\/operations\//,
    /web\/lib\/analytics/,
    /web\/lib\/pageStatistics/,
    // The model's words and the fixtures that hold them are content, not product copy.
    /web\/lib\/reports\/sample-report\.ts$/,
    /web\/lib\/marketing\/jordan-example\.ts$/,
    /web\/lib\/compensation-model\.ts$/,
    /web\/components\/research\/ResearchHubData\.ts$/,
    /web\/components\/internal\//,
    /web\/components\/shared\/diagrams\//,
    /web\/components\/research\/(diagrams|figures)\//,
    // Operator-only surfaces and the mail that goes to the operator, not to a reader.
    /web\/app\/\(app\)\/settings\/support-reply\//,
    /web\/lib\/support\/inboundEmail\.ts$/,
    /web\/lib\/extension\/storeContent\.ts$/,
];

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
            walk(full, out);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

const rel = (file) => path.relative(repoRoot, file).split(path.sep).join("/");

const allFiles = SCAN_ROOTS.flatMap((root) => walk(root.dir));
const scanFiles = allFiles.filter((file) => !EXCLUDED_PATHS.some((pattern) => pattern.test(rel(file))));

// ============================================
// IMPORT GRAPH AND ROUTES
// ============================================

const EXTENSIONS = [".tsx", ".ts", "/index.tsx", "/index.ts"];

function resolveImport(fromFile, specifier) {
    let base;
    if (specifier.startsWith("@/")) base = path.join(webRoot, specifier.slice(2));
    else if (specifier.startsWith(".")) base = path.resolve(path.dirname(fromFile), specifier);
    else return null;
    for (const ext of ["", ...EXTENSIONS]) {
        const candidate = base + ext;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
}

const sources = new Map();
function sourceFor(file) {
    if (!sources.has(file)) {
        const text = fs.readFileSync(file, "utf8");
        sources.set(file, ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS));
    }
    return sources.get(file);
}

function importsOf(file) {
    const source = sourceFor(file);
    const out = [];
    const visit = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            const resolved = resolveImport(file, node.moduleSpecifier.text);
            if (resolved) out.push(resolved);
        } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
            const resolved = resolveImport(file, node.arguments[0].text);
            if (resolved) out.push(resolved);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return out;
}

const PAGE_FILES = /\/(page|layout|route|not-found|error|loading|template|default|opengraph-image|twitter-image|icon|sitemap|robots|manifest)\.tsx?$/;

function routeOf(file) {
    const relative = rel(file);
    if (!relative.startsWith("web/app/")) return null;
    if (!PAGE_FILES.test(relative)) return null;
    const segments = relative.slice("web/app/".length).split("/");
    segments.pop();
    const route = "/" + segments.filter((segment) => !/^\(.*\)$/.test(segment)).join("/");
    const normalized = route.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
    // Internal labs render product components, but they are not a route a reader reaches.
    return normalized.startsWith("/internal") || normalized.startsWith("/playground") ? null : normalized;
}

const graph = new Map(allFiles.map((file) => [file, importsOf(file)]));
const pageRoutes = allFiles.map((file) => [file, routeOf(file)]).filter(([, route]) => route);
/** A layout or template wraps every page beneath its folder, so it carries all of their routes. */
function routesOfEntry(file, route) {
    if (!/\/(layout|template)\.tsx?$/.test(file)) return [route];
    const dir = path.dirname(file) + path.sep;
    const beneath = pageRoutes.filter(([page]) => page.startsWith(dir) && /\/page\.tsx?$/.test(page)).map(([, pageRoute]) => pageRoute);
    return beneath.length ? [...new Set(beneath)] : [route];
}
const routesByFile = new Map();
for (const [page, route] of pageRoutes) {
    const routes = routesOfEntry(page, route);
    const seen = new Set([page]);
    const queue = [page];
    while (queue.length) {
        const current = queue.shift();
        if (!routesByFile.has(current)) routesByFile.set(current, new Set());
        for (const each of routes) routesByFile.get(current).add(each);
        for (const next of graph.get(current) || []) {
            if (!seen.has(next)) {
                seen.add(next);
                queue.push(next);
            }
        }
    }
}

// ============================================
// MOMENTS
// ============================================

const MOMENT_RULES = [
    ["email", /otpEmail|replyEmail|inboundEmail|resendReply|Email\.tsx?$|\/email/i],
    ["pdf", /pdf-export|export-pdf|\/pdf\//i],
    ["error", /generationFailure|generation-stream-failure|generation-cancellation|client-action-error|\/error\.tsx$|not-found\.tsx$|StatusClient|\/status\//],
    ["upload", /components\/upload|InputPanel|ResumeModeSection|LinkedInModeSection|WorkspaceResumePicker|resume-input|parse-resume|ResumeLabel|ModeSwitcher|DefaultResumeSection|default-resume/],
    ["analysis", /AnalysisScanning|generation-stage|generation-status|analysis-completion|analysis-run/],
    ["rewrite", /revised-line|revise-line|AskFirst|line-answers|ask-first|LineLift|rewrite-enhancement|guardCopy/],
    ["report", /components\/workspace\/report|lib\/reports|ReportPanel|ReportDetailClient|ReportLayout|report-feedback|score-utils|ReadComparison|VersionComparison|resume-feedback|linkedin-feedback|lib\/linkedin/],
    ["pricing", /pricing|Pricing|billing|Billing|purchase|Paywall|Unlock|unlock|checkout|stripe|passes|entitlements|free-status|freeStatus|generationAccess|anonymous(Ledger|Identity|Generation|Access)|passLifecycle|subscriptionPeriod/],
    ["auth", /\/auth\/|signin|AuthModal|AuthFlow|AuthClient|useAuthField|public\)\/signin/],
    ["account", /settings|Settings|account|dashboard|\(app\)\/reports|ReportHistoryList|HistorySidebar|\/jobs|saved-jobs|UserNav|SaveReportPrompt|SavedRevision|components\/jobs|lib\/extension|api\/me|api\/user/],
    ["legal", /legal|privacy|Privacy|terms|Terms|\/help|HelpPage|trust|security\.txt|dataHandling|support/],
    ["research", /components\/research|\/research|guides|resources|components\/guides/],
    ["marketing", /landing|marketing|lib\/seo|compare|methodology|sample-report|extension\/page|ExtensionPageClient|llms|opengraph|FictionalTag/],
    ["shared", /components\/layout|SiteHeader|AppHeader|Footer|MobileNav|NavDrawer|CommandPalette|Toaster|components\/ui\/|components\/providers|components\/shared|lib\/navigation|lib\/utils|lib\/api\.ts|lib\/env/],
];

const ROUTE_MOMENTS = [
    ["pricing", /^\/(pricing|purchase|api\/(checkout|billing|passes|free-status|stripe))/],
    ["auth", /^\/(signin|auth|api\/auth)/],
    ["account", /^\/(settings|reports|dashboard|jobs|api\/(me|reports|user|account|extension))/],
    ["legal", /^\/(help|privacy|terms|status|api\/status|\.well-known)/],
    ["research", /^\/(research|resources|guides)/],
    ["report", /^\/workspace|^\/api\/(resume-feedback|linkedin-feedback|revise-line|report-feedback|generation-status|resume-ideas)/],
    ["upload", /^\/api\/parse-resume/],
    ["pdf", /^\/api\/export-pdf/],
    ["marketing", /^\/($|sample-report|extension|compare|methodology|llms)/],
];

function momentFor(file, routes) {
    const relative = rel(file);
    if (relative.startsWith("extension/")) return "extension";
    for (const [moment, pattern] of MOMENT_RULES) if (pattern.test(relative)) return moment;
    const firstRoute = [...routes][0];
    if (firstRoute) for (const [moment, pattern] of ROUTE_MOMENTS) if (pattern.test(firstRoute)) return moment;
    if (relative.startsWith("web/app/api/")) return "error";
    return "other";
}

// ============================================
// STRINGS
// ============================================

const COPY_ATTRIBUTES = new Set([
    "aria-label", "aria-description", "aria-placeholder", "aria-valuetext", "aria-roledescription", "title", "placeholder", "alt", "label", "description",
    "caption", "content", "summary", "heading", "subheading", "lead", "cta", "buttonText", "emptyText", "errorText", "helperText",
    "fallback", "tooltip", "hint", "eyebrow", "kicker", "note", "question", "answer", "text", "message", "body", "headline", "subtitle", "deck", "intro",
    "primaryLabel", "secondaryLabel", "confirmLabel", "cancelLabel", "actionLabel", "emptyLabel", "loadingLabel", "successMessage", "errorMessage",
]);

const COPY_KEYS = new Set([
    "title", "description", "text", "label", "heading", "subheading", "headline", "body", "q", "a", "question", "answer", "promise", "boundary",
    "anonymousBoundary", "freeBoundary", "whenToBuy", "terms", "cta", "primaryCta", "secondaryCta", "buttonText", "message", "hint", "subject",
    "subtitle", "lead", "deck", "intro", "note", "now", "summary", "caption", "claim", "value", "detail", "why", "action", "placeholder", "tooltip",
    "alt", "error", "success", "empty", "eyebrow", "kicker", "anchor", "sentence", "copy", "fallback", "fallbackText", "successText", "errorMessage",
    "supportLine", "footer", "preheader", "helper", "aside", "verdict", "line", "quote", "primary", "secondary", "confirm", "cancel", "emptyState",
    "ariaLabel", "ogTitle", "ogDescription", "twitterTitle", "metaDescription", "status", "reason", "warning", "disclaimer", "consent", "loading",
    "retry", "ok", "nothing", "noResults", "limit", "received", "pending", "done", "failed", "restored", "used", "notUsed", "unknown",
]);

const COPY_CALLS = new Set(["toast", "toast.error", "toast.success", "toast.message", "toast.info", "toast.warning", "setError", "setMessage", "setStatus", "setNotice", "setFeedback", "setHint", "setToast", "notify", "announce", "ClientActionError", "NextResponse.json"]);

const ENTITIES = { "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&amp;": "&", "&nbsp;": " ", "&hellip;": "…", "&mdash;": "—", "&ndash;": "–", "&middot;": "·", "&times;": "×", "&quot;": "\"", "&#39;": "'" };

function clean(text) {
    return text.replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity).replace(/\s+/g, " ").trim();
}

const NOISE = [
    /^https?:\/\//, /^(\/|\.\.?\/)[^\s]*$/, /^[a-z0-9_.-]+@[a-z0-9.-]+$/i, /^#[0-9a-f]{3,8}$/i, /^[A-Za-z0-9_$]+$/, /^[a-z0-9-]+(\s[a-z0-9-]+)*$/,
    /^[^A-Za-z]*$/, /^\d+(\.\d+)?(px|rem|em|%|ms|s|vw|vh)?$/, /^[A-Z][A-Z0-9_]+$/, /^[a-z]+:[a-z0-9-]+$/, /^(application|text|image|font)\//,
    /^[a-z]+(-[a-z]+)+$/, /^\$\{/, /\{\{/, /^(GET|POST|PUT|DELETE|PATCH|OPTIONS)$/, /^\w+\(.*\)$/, /^[a-z]+:\/\//, /^data-/, /^var\(--/,
    /^(en|en-US|UTC|ISO|UUID|JSON|HTML|CSS|URL|API|PDF|DOCX|TXT|OTP)$/, /^Content-Type|^Authorization|^Bearer /, /^\d{4}-\d{2}-\d{2}/,
    /^(?:[A-Za-z-]+\s*:\s*[^;]+;\s*)+$/, /^(src|href|rel|target|sizes|viewport|charset|name|property)$/, /^riyp[-_]/, /^[A-Za-z]+\.(ts|tsx|js|cjs|json|md)$/,
    /^__/, /^\w+\/\w+/, /^[A-Za-z]{1,2}$/, /^(true|false|null|undefined)$/, /^[A-Za-z][\w$]*(\.[\w$]+)+$/, /^(sm|md|lg|xl|xs|2xl)$/,
];

function isCopyText(text, { strict = false } = {}) {
    if (!text) return false;
    if (!/[A-Za-z]/.test(text)) return false;
    // A template that is only placeholders and punctuation ("{score}/100") carries no words of ours.
    if (!/[A-Za-z]/.test(text.replace(/\{[^}]*\}/g, ""))) return false;
    if (NOISE.some((pattern) => pattern.test(text))) return false;
    if (text.length > 1600) return false;
    if (strict) {
        // Free-standing constants need to read like a sentence or a label: a space or terminal punctuation,
        // and a capital or an apostrophe somewhere, so keys, class names and ids fall out.
        if (!(/\s/.test(text) || /[.!?…]$/.test(text))) return false;
        if (!/[A-Z’'“]/.test(text) && !/\s/.test(text)) return false;
        if (/^[a-z][\w-]*(\s[a-z][\w-]*)*$/.test(text)) return false;
    }
    return true;
}

function templateText(node) {
    if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    let out = node.head.text;
    for (const span of node.templateSpans) {
        const expr = span.expression.getText().replace(/\s+/g, " ");
        out += `{${expr.length > 28 ? expr.slice(0, 25) + "…" : expr}}`;
        out += span.literal.text;
    }
    return out;
}

function literalText(node) {
    if (!node) return null;
    if (ts.isStringLiteral(node)) return node.text;
    if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) return templateText(node);
    if (ts.isParenthesizedExpression(node)) return literalText(node.expression);
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression?.(node)) return literalText(node.expression);
    return null;
}

function lineOf(source, node) {
    return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

function extract(file) {
    const source = sourceFor(file);
    const found = [];
    const add = (node, text, kind, strict) => {
        const cleaned = clean(text);
        if (!isCopyText(cleaned, { strict })) return;
        found.push({ text: cleaned, kind, line: lineOf(source, node) });
    };

    const visit = (node, context) => {
        if (ts.isJsxText(node)) {
            if (!node.containsOnlyTriviaWhiteSpaces) add(node, node.getText(), "jsx-text", false);
        } else if (ts.isJsxExpression(node) && node.expression && node.parent && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
            const text = literalText(node.expression);
            if (text !== null) add(node, text, "jsx-text", false);
            else if (ts.isConditionalExpression(node.expression)) {
                for (const branch of [node.expression.whenTrue, node.expression.whenFalse]) {
                    const branchText = literalText(branch);
                    if (branchText !== null) add(branch, branchText, "jsx-text", false);
                }
            }
        } else if (ts.isJsxAttribute(node) && node.initializer) {
            const name = node.name.getText();
            if (COPY_ATTRIBUTES.has(name)) {
                const text = ts.isStringLiteral(node.initializer) ? node.initializer.text
                    : ts.isJsxExpression(node.initializer) ? literalText(node.initializer.expression) : null;
                if (text !== null) add(node, text, `attr:${name}`, false);
            }
        } else if (ts.isPropertyAssignment(node)) {
            const key = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : null;
            if (key && COPY_KEYS.has(key)) {
                const text = literalText(node.initializer);
                if (text !== null) add(node, text, `key:${key}`, false);
                else if (ts.isArrayLiteralExpression(node.initializer)) {
                    for (const element of node.initializer.elements) {
                        const elementText = literalText(element);
                        if (elementText !== null) add(element, elementText, `key:${key}[]`, false);
                    }
                } else if (ts.isConditionalExpression(node.initializer)) {
                    for (const branch of [node.initializer.whenTrue, node.initializer.whenFalse]) {
                        const branchText = literalText(branch);
                        if (branchText !== null) add(branch, branchText, `key:${key}`, false);
                    }
                }
                ts.forEachChild(node, (child) => visit(child, "copy-key"));
                return;
            }
        } else if (ts.isVariableDeclaration(node) && node.initializer) {
            const text = literalText(node.initializer);
            if (text !== null) add(node, text, "const", true);
            else if (ts.isArrayLiteralExpression(node.initializer)) {
                for (const element of node.initializer.elements) {
                    const elementText = literalText(element);
                    if (elementText !== null) add(element, elementText, "const[]", true);
                }
            }
        } else if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
            const callee = node.expression.getText().replace(/\s+/g, "");
            if (COPY_CALLS.has(callee)) {
                for (const argument of node.arguments || []) {
                    const text = literalText(argument);
                    if (text !== null) add(argument, text, `call:${callee}`, false);
                }
            }
        } else if (ts.isReturnStatement(node) && node.expression && context !== "copy-key") {
            const text = literalText(node.expression);
            if (text !== null) add(node, text, "return", true);
        } else if (ts.isConditionalExpression(node) && context === "statement") {
            for (const branch of [node.whenTrue, node.whenFalse]) {
                const text = literalText(branch);
                if (text !== null) add(branch, text, "const", true);
            }
        } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const text = literalText(node.right);
            if (text !== null) add(node, text, "assign", true);
        }
        ts.forEachChild(node, (child) => visit(child, ts.isVariableDeclaration(node) ? "statement" : context));
    };
    visit(source, null);
    return found;
}

// ============================================
// RUN
// ============================================

const entries = [];
for (const file of scanFiles) {
    const routes = routesByFile.get(file) || new Set();
    const relative = rel(file);
    const routeList = relative.startsWith("extension/") ? ["extension"] : [...routes].sort();
    const moment = momentFor(file, routes);
    for (const item of extract(file)) {
        entries.push({ ...item, file: relative, routes: routeList, moment });
    }
}

const uniqueTexts = new Set(entries.map((entry) => entry.text));
const filesWithCopy = new Set(entries.map((entry) => entry.file));
const byMoment = count(entries, (entry) => entry.moment);
const SHARED_THRESHOLD = 5;

function count(list, keyOf) {
    const map = new Map();
    for (const item of list) {
        const key = keyOf(item);
        map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

/** The route table an entry belongs in: its one route, a route family for editorial pages, or shared. */
function tableFor(entry) {
    if (entry.routes.length === 0) return "unrouted";
    if (entry.routes[0] === "extension") return "extension";
    if (entry.routes.length >= SHARED_THRESHOLD) return "shared";
    // The report shell is reached from the workspace, the saved report and the sample: it is the workspace's.
    if (entry.routes.includes("/workspace")) return "workspace";
    const route = entry.routes[0];
    const family = route.match(/^\/(research|resources|guides|compare|settings|purchase|api)(\/|$)/);
    if (family) return family[1];
    return route === "/" ? "home" : route.replace(/^\//, "").replace(/[\/\[\]]+/g, "-").replace(/-$/, "");
}

const tables = new Map();
for (const entry of entries) {
    const key = tableFor(entry);
    if (!tables.has(key)) tables.set(key, []);
    tables.get(key).push(entry);
}

const escapeCell = (text) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

function renderTable(name, list) {
    const routes = [...new Set(list.flatMap((entry) => entry.routes))].sort();
    const lines = [
        `# Copy inventory: ${name}`,
        "",
        `Generated by \`node scripts/copy-inventory.cjs\` (run from \`web/\`). Do not edit by hand; change the source and rerun.`,
        "",
        `Routes: ${routes.map((route) => `\`${route}\``).join(", ") || "none"}. Strings: ${list.length} (${new Set(list.map((entry) => entry.text)).size} unique).`,
        "",
    ];
    const grouped = new Map();
    for (const entry of list) {
        const groupKey = name === "shared" ? entry.file : entry.routes.join(", ") || "(unrouted)";
        if (!grouped.has(groupKey)) grouped.set(groupKey, []);
        grouped.get(groupKey).push(entry);
    }
    for (const [group, items] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        lines.push(`## ${group}`, "", "| # | Moment | Where | Kind | String |", "| --- | --- | --- | --- | --- |");
        items.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
        items.forEach((entry, index) => {
            const routeNote = name === "shared" ? ` (${entry.routes.length} routes)` : "";
            lines.push(`| ${index + 1} | ${entry.moment} | \`${entry.file}:${entry.line}\`${routeNote} | ${entry.kind} | ${escapeCell(entry.text)} |`);
        });
        lines.push("");
    }
    return lines.join("\n");
}

function renderIndex() {
    const lines = [
        "# Copy inventory",
        "",
        "Every user-facing string in `web/app`, `web/components`, `web/lib` and `extension/src`, by route and moment, as extracted by `web/scripts/copy-inventory.cjs`. Regenerate with `npm run copy:inventory` from `web/`; `npm run copy:inventory -- --check` fails when the committed tables are behind the source.",
        "",
        "Not in the inventory, on purpose: the model's words (`web/prompts`, the sample report's content, `lib/marketing/jordan-example.ts`), tests and fixtures, the internal labs, and code the reader never sees (`lib/llm`, `lib/evals`, infrastructure).",
        "",
        "## Counts",
        "",
        "| Measure | Count |",
        "| --- | --- |",
        `| Files scanned | ${scanFiles.length} |`,
        `| Files with copy | ${filesWithCopy.size} |`,
        `| Strings | ${entries.length} |`,
        `| Unique strings | ${uniqueTexts.size} |`,
        `| Routes with copy | ${new Set(entries.flatMap((entry) => entry.routes)).size} |`,
        "",
        "## By moment",
        "",
        "| Moment | Strings |",
        "| --- | --- |",
        ...byMoment.map(([moment, total]) => `| ${moment} | ${total} |`),
        "",
        "## Tables",
        "",
        "| Table | Strings | Routes |",
        "| --- | --- | --- |",
        ...[...tables.entries()].sort((a, b) => b[1].length - a[1].length).map(([name, list]) => {
            const routes = [...new Set(list.flatMap((entry) => entry.routes))].sort();
            const shown = routes.length > 6 ? `${routes.slice(0, 6).map((route) => `\`${route}\``).join(", ")} and ${routes.length - 6} more` : routes.map((route) => `\`${route}\``).join(", ");
            return `| [${name}](./${name}.md) | ${list.length} | ${shown} |`;
        }),
        "",
        "## How a string is found",
        "",
        "- JSX text, and string literals placed directly in JSX.",
        `- JSX attributes a reader sees: ${[...COPY_ATTRIBUTES].slice(0, 12).map((name) => `\`${name}\``).join(", ")} and the rest of the list in the script.`,
        "- Object properties with copy keys (`title`, `description`, `label`, `body`, `q`, `a`, `cta`, `message`, `terms`, …) and arrays under them.",
        "- Sentence-like string constants and assignments (a space or terminal punctuation; keys, class names, ids and paths fall out).",
        "- Messages passed to toasts, `ClientActionError`, `setError` and `NextResponse.json`.",
        "- Template literals keep their expressions as `{name}` placeholders.",
        "",
        "A string's routes are the pages (`app/**/page.tsx`, `layout.tsx`, `route.ts`) whose import graph reaches its file. A string reached from five or more routes is in the shared table. The moment comes from the file's path first (an email module is `email` wherever it is imported), then from the route.",
        "",
    ];
    return lines.join("\n");
}

const outputs = new Map();
outputs.set("README.md", renderIndex());
for (const [name, list] of tables) outputs.set(`${name}.md`, renderTable(name, list));
outputs.set("inventory.json", JSON.stringify({
    generated_by: "web/scripts/copy-inventory.cjs",
    counts: { files_scanned: scanFiles.length, files_with_copy: filesWithCopy.size, strings: entries.length, unique_strings: uniqueTexts.size },
    by_moment: Object.fromEntries(byMoment),
    entries: entries.map((entry) => ({ ...entry, table: tableFor(entry) })),
}, null, 2) + "\n");

if (stdoutOnly) {
    console.log(`Scanned ${scanFiles.length} files; ${entries.length} strings (${uniqueTexts.size} unique) in ${filesWithCopy.size} files.`);
    for (const [moment, total] of byMoment) console.log(`  ${moment.padEnd(10)} ${total}`);
    process.exit(0);
}

if (checkMode) {
    const stale = [];
    for (const [name, content] of outputs) {
        const target = path.join(outDir, name);
        if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== content) stale.push(name);
    }
    for (const existing of fs.existsSync(outDir) ? fs.readdirSync(outDir) : []) {
        if (!outputs.has(existing)) stale.push(`${existing} (no longer produced)`);
    }
    if (stale.length) {
        console.error(`Copy inventory is stale: ${stale.join(", ")}. Run \`npm run copy:inventory\` from web/ and commit the result.`);
        process.exit(1);
    }
    console.log(`Copy inventory is current: ${entries.length} strings in ${tables.size} tables.`);
    process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
for (const existing of fs.readdirSync(outDir)) {
    if (!outputs.has(existing) && /\.(md|json)$/.test(existing)) fs.unlinkSync(path.join(outDir, existing));
}
for (const [name, content] of outputs) fs.writeFileSync(path.join(outDir, name), content);
console.log(`Wrote ${outputs.size} files to ${path.relative(repoRoot, outDir)}: ${entries.length} strings (${uniqueTexts.size} unique) from ${filesWithCopy.size} of ${scanFiles.length} files.`);
for (const [moment, total] of byMoment) console.log(`  ${moment.padEnd(10)} ${total}`);
