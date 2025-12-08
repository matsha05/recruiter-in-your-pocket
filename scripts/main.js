// NOTE: This frontend is intentionally single-file. If you add new pages or modes,
// consider splitting styles into a shared CSS file and moving JS into a small app.js
// to reduce risk and keep components reusable.
const STORAGE_KEY = "rip-main-input-v1";
const API_AUTH_TOKEN = window.API_AUTH_TOKEN || "c2f8e0d9a4b76c3d9f1a7b20d84c6e1a";
const authHeaders = API_AUTH_TOKEN ? { Authorization: `Bearer ${API_AUTH_TOKEN}` } : {};
// Inline sample report as a guaranteed fallback so the sample preview always renders
window.SAMPLE_REPORT = window.SAMPLE_REPORT || {
  score: 86,
  score_label: "Strong",
  score_comment_short:
    "You read as someone who takes messy workstreams and makes them shippable.",
  score_comment_long:
    "You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls. You operate with structure and avoid drift even when requirements shift. What is harder to see is the exact scope—teams, volume, dollars—and the before/after change you drove. Trajectory points up if you surface scale and measurable outcomes faster.",
  summary:
    "You read as someone who takes messy workstreams and makes them shippable. Your edge is steady ownership: you keep leaders aligned, run the checklist, and make clear calls. You operate with structure and avoid drift even when requirements shift. What is harder to see is the exact scope—teams, volume, dollars—and the before/after change you drove. Trajectory points up if you surface scale and measurable outcomes faster.",
  strengths: [
    "You keep delivery on track when priorities change and still close the loop with stakeholders.",
    "You use structure (checklists, reviews, comms) so launches and projects avoid drift.",
    'You describe decisions you owned instead of hiding behind "the team."',
    "You show pattern recognition in how you prevent issues from recurring."
  ],
  gaps: [
    "Scope (teams, geos, customers, volume, dollars) is often missing.",
    "Before/after impact is implied but not stated; add metrics or clear qualitative change.",
    "Some bullets blend multiple ideas; split them so impact lands.",
    "A few phrases could be more specific to the systems or programs you ran."
  ],
  rewrites: [
    {
      label: "Impact",
      original: "Improved process across teams.",
      better:
        "Ran a cross-team launch with clear owners, decisions, and checkpoints so delivery hit the agreed date.",
      enhancement_note:
        "If you have it, include: number of teams/regions and shipments or users affected, so scope is obvious."
    },
    {
      label: "Scope",
      original: "Supported leadership on projects.",
      better:
        "Supported leadership by running risk reviews and comms so projects stayed aligned across teams.",
      enhancement_note:
        "If you have it, include: number of teams or regions involved, which clarifies scale."
    },
    {
      label: "Clarity",
      original: "Handled stakeholder updates.",
      better:
        "Kept launches on track by running checklists, risk reviews, and stakeholder comms so go-live stayed on schedule.",
      enhancement_note:
        "If you have it, include: number of launches per month/quarter and audience size, to show reach."
    },
    {
      label: "Ownership",
      original: "Handled stakeholder updates.",
      better:
        "Led stakeholder updates with decisions, risks, and next steps so leaders could unblock issues quickly.",
      enhancement_note:
        "If you have it, include: cadence and the groups involved, so the reader sees scale."
    }
  ],
  suggested_bullets: [],
  missing_wins: [
    "Highlight one launch where you personally unblocked delivery (owner, decision, outcome).",
    "Add scope to a top bullet: teams/regions/users so scale is obvious.",
    "Show one before/after metric to make the impact of your decisions clear."
  ],
  next_steps: [
    "Add scope (teams, volume, regions) to two top bullets.",
    "State one before/after metric in a headline bullet.",
    "Split any bullet that mixes decisions and outcomes."
  ],
  layout_score: 86,
  layout_band: "strong",
  layout_notes: "Content is clear; add scope and outcomes faster so impact lands."
};

const SAMPLE_IDEAS_VARIANTS = [
  {
    questions: [
      "At Stripe, how did you pick and ship the KYC changes that cut drop-off and lifted sign-ups?",
      "When coordinating launches across Google’s three regions, how did you keep comms tight and unblock teams?",
      "How did you build the metrics framework at Stripe so leaders could make faster decisions?"
    ]
  },
  {
    questions: [
      "When a Google experiment slipped, what call did you make to realign teams and get it back on track?",
      "Which signals did you use at Stripe to choose the KYC fixes that moved conversion most?",
      "What was the toughest launch escalation you owned, and how did you resolve it?"
    ]
  },
  {
    questions: [
      "When execs wanted weekly clarity, how did you adapt the metrics cadence so decisions sped up?",
      "How did you prevent a launch risk at Google, and what was the impact on teams or users?",
      "At Stripe, how did you decide the highest-leverage scope to tackle first, and what changed after?"
    ]
  },
  {
    questions: [
      "How did you simplify a cross-functional decision you owned, and what changed for the teams involved?",
      "When data was thin, how did you pick which launch to greenlight, and what result followed?",
      "Where did you improve onboarding or activation, and how did you measure the lift?"
    ]
  }
].map((variant) => ({
  questions: variant.questions,
  notes: [
    "Answer 1–3 questions in a separate doc so you don’t overwrite what already works.",
    "From each answer, pull scope, the call you made, and the outcome (ideally with a number).",
    "Turn each into one bullet: verb + what you owned + outcome with a number."
  ],
  how_to_use:
    "Use these to surface wins your resume isn’t telling yet. If it would repeat what’s already on the page, skip it."
}));

const inputEl = document.getElementById("main-input");
const inputLabelEl = document.getElementById("input-label");
const runButton = document.getElementById("run-button");
const statusEl = document.getElementById("status");
const resultsTitleEl = document.getElementById("results-title");
const resultsSubtitleEl = document.getElementById("results-subtitle");
const resultsSummaryEl = document.getElementById("results-summary");
const resultsBodyEl = document.getElementById("results-body");
const resultsSkeletonEl = document.getElementById("results-skeleton");
const reportViewEl = document.getElementById("report-view");
const reportAccentLineEl = document.querySelector(".report-accent-line");
const scoreWrapperEl = document.getElementById("score-wrapper");
const scoreBandsTriggerEl = document.getElementById("score-bands-trigger");
const scoreDialContainerEl = document.getElementById("score-dial-container");
const issueBreakdownEl = document.getElementById("issue-breakdown");
const scoreDialEl = document.getElementById("score-dial");
const scoreDialProgressEl = document.getElementById("score-dial-progress");
const scoreDialNumberEl = document.getElementById("score-dial-number");
const scoreDialLabelEl = document.getElementById("score-dial-label");
const scoreTooltipEl = document.getElementById("score-tooltip");
const copyFullButtonEl = document.getElementById("copy-full-button");
const exportButtonEl = document.getElementById("export-button");
const resultsActionsBottomEl = document.getElementById("results-actions-bottom");
const reportWrapperEl = document.querySelector(".report-wrapper");
const dataHandlingInlineEl = document.getElementById("data-handling-inline");
const dataModalEl = document.getElementById("data-modal");
const dataModalCardEl = document.getElementById("data-modal-card");
const dataModalCloseEl = document.getElementById("data-modal-close");
const reportTagEl = document.getElementById("report-tag");
const textareaEl = document.getElementById("main-input");
const savedIndicatorEl = document.getElementById("saved-indicator");
const loadingBarEl = document.getElementById("loading-bar");
const sampleResumeButtonEl = document.getElementById("sample-resume-button");
const sampleReportButtonEl = document.getElementById("sample-report-button");
const clearButtonEl = document.getElementById("clear-button");
const ideasInlineEl = document.getElementById("ideas-inline");
const ideasOpenEl = document.getElementById("ideas-open");
const ideasModalEl = document.getElementById("ideas-modal");
const ideasBackdropEl = document.getElementById("ideas-backdrop");
const ideasRefreshEl = document.getElementById("ideas-refresh");
const ideasCloseEl = document.getElementById("ideas-close");
const ideasBodyEl = document.getElementById("ideas-body");
const ideasLoadingBarEl = document.getElementById("ideas-loading-bar");
const ideasStatusEl = document.getElementById("ideas-status");
const focusToggleEl = document.getElementById("focus-toggle");
const charCountEl = document.getElementById("char-count");
const validationErrorEl = document.getElementById("validation-error");
const prefersReducedMotionQuery = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;
let focusMode = false;
let hasReportContent = false;
let hasLoggedPaste = false;
let lastReportData = null;
let isSampleReportActive = false;
let cachedSampleReport = null;
let hasPlayedReportReveal = false;
let previousBodyOverflow = "";
let currentReportIsSample = false;
let dataModalReturnEl = null;
let currentUser = null;
let activePass = null;
let selectedTier = "24h";

function setFocusMode(enabled) {
  focusMode = Boolean(enabled);
  document.body.classList.toggle("focus-mode", focusMode);
  if (focusToggleEl) {
    focusToggleEl.classList.toggle("hidden", !hasReportContent);
    focusToggleEl.textContent = focusMode ? "Back to editor" : "Focus on report";
  }
  if (focusMode) {
    triggerFocusEntrance();
  }
}

// Theme management
const themeToggleEl = document.getElementById("theme-toggle");
const themeToggleIconEl = themeToggleEl ? themeToggleEl.querySelector(".theme-toggle-icon") : null;

function getSystemPreference() {
  if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (e) {
    return null;
  }
}

function setTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
    if (themeToggleIconEl) {
      themeToggleIconEl.textContent = "☀️";
    }
    if (themeToggleEl) {
      themeToggleEl.setAttribute("aria-label", "Toggle light mode");
      themeToggleEl.setAttribute("title", "Toggle light mode");
    }
  } else {
    root.removeAttribute("data-theme");
    if (themeToggleIconEl) {
      themeToggleIconEl.textContent = "🌙";
    }
    if (themeToggleEl) {
      themeToggleEl.setAttribute("aria-label", "Toggle dark mode");
      themeToggleEl.setAttribute("title", "Toggle dark mode");
    }
  }
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    // Ignore localStorage errors
  }
}

function initTheme() {
  const stored = getStoredTheme();
  const system = getSystemPreference();
  const theme = stored || system;
  setTheme(theme);
}

// Initialize theme on page load
initTheme();
refreshSessionState();

// Listen for system preference changes
if (window.matchMedia) {
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  colorSchemeQuery.addEventListener("change", (e) => {
    const stored = getStoredTheme();
    if (!stored) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
}

// Toggle theme on button click
if (themeToggleEl) {
  themeToggleEl.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  });
}

const paywallBackdropEl = document.getElementById("paywall-backdrop");
const paywallUpgradeEl = document.getElementById("paywall-upgrade");
const paywallCloseEl = document.getElementById("paywall-close");
const paywallStatusEl = document.getElementById("paywall-status");
const paywallEmailInput = document.getElementById("paywall-email");
const paywallCodeInput = document.getElementById("paywall-code");
const paywallSendCodeBtn = document.getElementById("paywall-send-code");
const paywallVerifyBtn = document.getElementById("paywall-verify");
const paywallTierButtons = Array.from(document.querySelectorAll(".paywall-tier"));

const currentMode = "resume";
let saveTimeout = null;
let originalButtonText = runButton.textContent;
let ideasInFlight = false;
let ideasRefreshCount = 0;
const ideasSeenOrder = [];
const ideasSeenSet = new Set();
const ideasSeenQuestions = new Set();
let currentScoreMeta = null;
let lastScoreValue = null;
let scoreBandsPinned = false;
let scoreBandsHovering = false;
let isSampleRun = false;

const FREE_RUN_LIMIT = 2;
const RUN_COUNT_KEY = "rip-free-runs-v2";
const PAID_KEY = "rip-paid-v1";
const SHORT_RESUME_SKIP_KEY = "rip-short-resume-skip-v1";

// Short-resume detection thresholds (tunable)
const SHORT_RESUME_CHAR_STRICT_THRESHOLD = 1200; // always warn
const SHORT_RESUME_CHAR_SOFT_THRESHOLD = 2000; // warn if also low bullets
const SHORT_RESUME_BULLET_THRESHOLD = 8;

// Mixpanel integration
// DNT check and token-based tracking
function trackEvent(name, props = {}) {
  // Check Do Not Track
  const dnt = navigator.doNotTrack === "1" || navigator.doNotTrack === "yes";
  if (dnt) {
    console.log("[event:dnt]", name, props);
    return;
  }
  // If Mixpanel is loaded and token is set, track
  if (window.mixpanel && window.MIXPANEL_TOKEN) {
    mixpanel.track(name, {
      ...props,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log("[event]", name, props);
  }
}

// Backward-compatible alias
function logEvent(name, data = {}) {
  trackEvent(name, data);
}

// Server-side free run tracking (cookie-based)
// The server manages free runs via HTTP-only cookies
// Client tracks last known state for UI purposes
let clientFreeRunIndex = 0;
let clientFreeUsesRemaining = FREE_RUN_LIMIT;

function updateFreeRunState(serverResponse) {
  if (typeof serverResponse.free_run_index === "number") {
    clientFreeRunIndex = serverResponse.free_run_index;
  }
  if (typeof serverResponse.free_uses_remaining === "number") {
    clientFreeUsesRemaining = serverResponse.free_uses_remaining;
  }
}

function getRunCount() {
  // Deprecated: server tracks free runs
  return clientFreeRunIndex;
}

function incrementRunCount() {
  // Deprecated: server tracks free runs
  return clientFreeRunIndex;
}

function isPaid() {
  return Boolean(activePass);
}

function markPaid() {
  // Deprecated: pass status is maintained server-side
}

// Short-resume detection helpers
function countBullets(text) {
  const bulletRegex = /^[\s]*([-•*▪▸►●○◦⦿⦾·‣▪■□◆▶➤➜➣➥➧➨➢➲➺➻➼➽➾➔➛➝➞➟➠➡️]|[\d]{1,3}[.)])[\s]/gm;
  const matches = text.match(bulletRegex) || [];

  // Pseudo bullets: short indented lines that often come from stripped formatting
  let pseudoMatches = [];
  if (matches.length === 0) {
    pseudoMatches = (text.match(/^[\t ]{2,}.+$/gm) || []).filter((line) => line.trim().length <= 140);
  }

  return matches.length + Math.floor(pseudoMatches.length / 2); // require at least a couple to count
}

function assessResumeLength(text) {
  const trimmed = (text || "").trim();
  const charCount = trimmed.length;
  const bulletCount = countBullets(trimmed);

  const isStrictShort = charCount < SHORT_RESUME_CHAR_STRICT_THRESHOLD;
  const isBorderline = charCount < SHORT_RESUME_CHAR_SOFT_THRESHOLD;
  const bulletsLow = bulletCount < SHORT_RESUME_BULLET_THRESHOLD;

  const shouldWarn = isStrictShort || (isBorderline && bulletsLow);
  const shouldHint = !shouldWarn && bulletsLow && charCount >= SHORT_RESUME_CHAR_SOFT_THRESHOLD;

  let reason = "ok";
  if (isStrictShort) {
    reason = "strict_char_threshold";
  } else if (isBorderline && bulletsLow) {
    reason = "borderline_low_bullets";
  } else if (shouldHint) {
    reason = "hint_low_bullets";
  }

  return { shouldWarn, shouldHint, charCount, bulletCount, reason };
}

function shouldSkipShortResumeDialog() {
  try {
    return sessionStorage.getItem(SHORT_RESUME_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

function setSkipShortResumeDialog() {
  try {
    sessionStorage.setItem(SHORT_RESUME_SKIP_KEY, "1");
  } catch {
    // Ignore storage errors
  }
}

function showReportContainer() {
  if (reportWrapperEl) {
    reportWrapperEl.style.display = "block";
  }
  if (reportViewEl) {
    reportViewEl.classList.add("report-container--visible");
  }
}

function showPaywall(msg = "") {
  logEvent("paywall_impression");
  if (paywallBackdropEl) {
    paywallBackdropEl.style.display = "flex";
  }
  selectTier(selectedTier || "24h");
  if (paywallStatusEl) {
    const reassurance = "Your current report stays here while you upgrade.";
    paywallStatusEl.textContent = msg ? `${msg} ${reassurance}` : reassurance;
  }
  // Auto-focus the primary upgrade path (selected tier), fallback to email input.
  requestAnimationFrame(() => {
    const hasEmail = (paywallEmailInput?.value || "").trim().length > 0;
    const hasCode = (paywallCodeInput?.value || "").trim().length > 0;
    const activeTier =
      document.querySelector(".paywall-tier.selected") || paywallTierButtons?.[0];

    if (hasEmail && hasCode && paywallVerifyBtn?.focus) {
      paywallVerifyBtn.focus({ preventScroll: true });
      return;
    }

    if (activeTier?.focus) {
      activeTier.focus({ preventScroll: true });
      return;
    }

    if (paywallEmailInput?.focus) {
      paywallEmailInput.focus({ preventScroll: true });
    }
  });
}

function hidePaywall() {
  if (paywallBackdropEl) {
    paywallBackdropEl.style.display = "none";
  }
  if (paywallStatusEl) {
    paywallStatusEl.textContent = "";
  }
}

function prefersReducedMotion() {
  return !!(prefersReducedMotionQuery && prefersReducedMotionQuery.matches);
}

const TIER_KEY = "rip-tier-v1";
const TIER_EXPIRY_KEY = "rip-tier-expiry-v1";

function getTierInfo() {
  try {
    const tier = localStorage.getItem(TIER_KEY);
    const expiry = localStorage.getItem(TIER_EXPIRY_KEY);
    if (!tier || !expiry) return null;
    const expiryDate = new Date(expiry);
    if (expiryDate < new Date()) {
      // Tier expired
      localStorage.removeItem(TIER_KEY);
      localStorage.removeItem(TIER_EXPIRY_KEY);
      localStorage.removeItem(PAID_KEY);
      return null;
    }
    return { tier, expiry: expiryDate };
  } catch (e) {
    return null;
  }
}

function setTierInfo(tier) {
  try {
    const now = new Date();
    let expiry;
    if (tier === "30d") {
      expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else {
      expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    }
    localStorage.setItem(TIER_KEY, tier);
    localStorage.setItem(TIER_EXPIRY_KEY, expiry.toISOString());
  } catch (e) {
    console.warn("Could not save tier info", e);
  }
}

(async function handleCheckoutParams() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("checkout");
  const tier = params.get("tier");
  if (status === "success") {
    // Refresh auth state after successful checkout
    await refreshSessionState();
    // Update the auth UI (will show personalized greeting if user has first_name)
    if (typeof updateAuthUI === "function") {
      updateAuthUI();
    }
    logEvent("checkout_completed", { tier: tier || "24h" });
    const clean = window.location.pathname + window.location.hash;
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, clean);
    }
  }
  if (status === "cancelled") {
    logEvent("checkout_cancelled");
    const clean = window.location.pathname + window.location.hash;
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, clean);
    }
  }
})();

async function refreshSessionState() {
  try {
    // Add 3-second timeout to prevent UI hang on slow networks
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const resp = await fetch("/api/me", {
      headers: authHeaders,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await resp.json().catch(() => null);
    if (data?.ok) {
      currentUser = data.user;
      activePass = data.active_pass;
    }
  } catch (err) {
    // Silently fail - user stays in guest state
    console.warn("Could not refresh session", err);
  }
}

function openDataModal() {
  if (!dataModalEl || !dataModalCardEl) return;
  dataModalEl.classList.remove("hidden");
  dataModalEl.setAttribute("aria-hidden", "false");
  previousBodyOverflow = document.body.style.overflow || "";
  document.body.style.overflow = "hidden";
  dataModalReturnEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const focusable = dataModalEl.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

function closeDataModal() {
  if (!dataModalEl) return;
  dataModalEl.classList.add("hidden");
  dataModalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = previousBodyOverflow || "";
  const returnTarget = dataModalReturnEl || dataHandlingInlineEl;
  if (returnTarget && typeof returnTarget.focus === "function") returnTarget.focus();
  dataModalReturnEl = null;
}

function trapDataModalFocus(event) {
  if (!dataModalEl || dataModalEl.classList.contains("hidden")) return;
  const focusable = dataModalEl.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeDataModal();
  }
}

function autoResizeTextarea() {
  const maxHeight = 340;
  inputEl.style.height = "auto";
  const next = Math.min(inputEl.scrollHeight, maxHeight);
  inputEl.style.height = next + "px";
}

function showSavedIndicator() {
  if (!savedIndicatorEl) return;
  savedIndicatorEl.classList.add("visible");
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    savedIndicatorEl.classList.remove("visible");
  }, 1200);
}

function updateClearButtonVisibility() {
  if (clearButtonEl) {
    const hasText = inputEl.value.trim().length > 0;
    clearButtonEl.classList.toggle("hidden", !hasText);
  }
}

function clearInput() {
  inputEl.value = "";
  autoResizeTextarea();
  updateCharCount();
  clearValidationError();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear saved input", e);
  }
  resetIdeasSection();
  closeIdeasModal();
  if (ideasInlineEl) {
    ideasInlineEl.classList.add("hidden");
  }
  updateClearButtonVisibility();
  // Hide report shell and related state
  if (reportWrapperEl) reportWrapperEl.style.display = "none";
  if (reportViewEl) reportViewEl.classList.remove("report-container--visible");
  hasPlayedReportReveal = false;
  if (reportTagEl) reportTagEl.classList.add("hidden");
  if (issueBreakdownEl) issueBreakdownEl.classList.add("hidden");
  clearScoreBadge();
  lastReportData = null;
  currentReportIsSample = false;
  isSampleReportActive = false;
  if (resultsBodyEl) {
    resultsBodyEl.textContent = "Your feedback will appear here.";
    resultsBodyEl.classList.add("empty");
  }
  renderSummary("");
  if (resultsActionsBottomEl) resultsActionsBottomEl.classList.add("hidden");
  clearScoreBadge();
  updateToolLayout();
}

function loadSavedInput() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      inputEl.value = saved;
      autoResizeTextarea();
      updateCharCount();
      showSavedIndicator();
      updateClearButtonVisibility();
      return;
    }
  } catch (e) {
    console.warn("Could not load saved input", e);
  }
  inputEl.value = "";
  autoResizeTextarea();
  updateCharCount();
  updateClearButtonVisibility();
}

const MAX_TEXT_LENGTH = 30000;
const WARNING_THRESHOLD = 0.9; // 90% of limit

function updateCharCount() {
  if (!charCountEl || !inputEl) return;
  const length = inputEl.value.length;
  const trimmedLength = inputEl.value.trim().length;

  if (length === 0) {
    charCountEl.textContent = "";
    charCountEl.classList.remove("warning", "error");
    return;
  }

  const percentage = length / MAX_TEXT_LENGTH;
  charCountEl.textContent = `${length.toLocaleString()} / ${MAX_TEXT_LENGTH.toLocaleString()} characters`;

  if (percentage >= 1.0) {
    charCountEl.classList.add("error");
    charCountEl.classList.remove("warning");
  } else if (percentage >= WARNING_THRESHOLD) {
    charCountEl.classList.add("warning");
    charCountEl.classList.remove("error");
  } else {
    charCountEl.classList.remove("warning", "error");
  }
}

function showValidationError(message) {
  if (!validationErrorEl) return;
  validationErrorEl.textContent = message;
  validationErrorEl.classList.remove("hidden");
}

function clearValidationError() {
  if (!validationErrorEl) return;
  validationErrorEl.textContent = "";
  validationErrorEl.classList.add("hidden");
}

function validateInput() {
  const text = inputEl.value.trim();
  clearValidationError();

  if (!text) {
    return { valid: false, error: "Paste your resume so I can review it." };
  }

  if (inputEl.value.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Your resume text is very long (${inputEl.value.length.toLocaleString()} characters). Try sending a smaller section or trimming extra content.`
    };
  }

  return { valid: true };
}

inputEl.addEventListener("input", (event) => {
  autoResizeTextarea();
  updateCharCount();
  clearValidationError();
  const trimmed = inputEl.value.trim();

  if (!trimmed) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear saved input", e);
    }
    resetIdeasSection();
    if (ideasInlineEl) ideasInlineEl.classList.add("hidden");
    closeIdeasModal();
    updateClearButtonVisibility();
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, inputEl.value);
  } catch (e) {
    console.warn("Could not save input", e);
  }
  showSavedIndicator();
  updateClearButtonVisibility();
});

inputEl.addEventListener("paste", () => {
  if (!hasLoggedPaste) {
    logEvent("resume_pasted");
    hasLoggedPaste = true;
  }
});

function updateToolLayout() {
  const toolLayout = document.querySelector('.tool-layout');
  const resultsBody = document.getElementById('results-body');

  if (toolLayout && resultsBody) {
    if (resultsBody.classList.contains('empty')) {
      toolLayout.classList.add('input-full-width');
    } else {
      toolLayout.classList.remove('input-full-width');
    }
  }
}

// Stub function for legacy renderSummary calls
function renderSummary(message) {
  // Summary is now rendered as part of the report chapters
  // This stub prevents errors from legacy code paths
  if (resultsSummaryEl && message) {
    resultsSummaryEl.textContent = message;
  }
}

function clearScoreBadge() {
  if (scoreDialNumberEl) scoreDialNumberEl.textContent = "0";
  if (scoreDialContainerEl) {
    scoreDialContainerEl.className = "score-dial-container";
    scoreDialContainerEl.removeAttribute("aria-label");
  }
  if (scoreDialProgressEl) {
    scoreDialProgressEl.style.strokeDashoffset = "339.292";
  }
  if (scoreTooltipEl) {
    scoreTooltipEl.textContent = "";
    scoreTooltipEl.classList.remove("open");
    scoreTooltipEl.setAttribute("aria-hidden", "true");
  }
  if (scoreWrapperEl) scoreWrapperEl.classList.add("hidden");
  if (scoreBandsTriggerEl) scoreBandsTriggerEl.style.display = "none";
  if (resultsActionsBottomEl) resultsActionsBottomEl.classList.add("hidden");
  if (issueBreakdownEl) {
    issueBreakdownEl.classList.add("hidden");
    issueBreakdownEl.classList.remove("visible");
    // Reset display for Focus & Craft bar
    const focusBar = issueBreakdownEl.querySelector('[data-section="focus-craft"]');
    if (focusBar) {
      focusBar.style.display = '';
    }
  }
  currentScoreMeta = null;
  lastScoreValue = null;
  scoreBandsPinned = false;
  scoreBandsHovering = false;
  if (scoreBandsTriggerEl) scoreBandsTriggerEl.setAttribute("aria-expanded", "false");
}

const SCORE_BANDS = [
  {
    id: "not_ready",
    min: 60,
    max: 69,
    label: "Not ready",
    description: "Story is hard to follow. Sections blur together and impact is mostly missing."
  },
  {
    id: "thin_signal",
    min: 70,
    max: 77,
    label: "Thin signal",
    description: "Some good pieces, but the signal is faint. Bullets are vague or light on impact."
  },
  {
    id: "strong_foundation",
    min: 78,
    max: 84,
    label: "Strong foundation",
    description: "Core story is clear. Real wins are present, but not every bullet carries weight."
  },
  {
    id: "high_bar",
    min: 85,
    max: 91,
    label: "High bar",
    description: "Ownership, scope, and results are consistently clear with very little noise."
  },
  {
    id: "rare_air",
    min: 92,
    max: 100,
    label: "Rare air",
    description: "Exceptionally clear and dense signal. Every line earns its place."
  }
];

function getBandIdFromScore(score) {
  const n = Number.isFinite(Number(score)) ? Math.round(Number(score)) : 0;
  const clamped = Math.min(100, Math.max(0, n));
  const match = SCORE_BANDS.find((band) => clamped >= band.min && clamped <= band.max);
  if (match) return match.id;
  if (clamped < SCORE_BANDS[0].min) return SCORE_BANDS[0].id;
  return SCORE_BANDS[SCORE_BANDS.length - 1].id;
}

function getScoreMeta(score) {
  const n = Number.isFinite(Number(score)) ? Math.round(Number(score)) : 0;
  const clamped = Math.min(100, Math.max(0, n));
  if (clamped >= 97) {
    return {
      score: clamped,
      label: "Rare air",
      short: "Exceptionally clear and compelling on first read. Very minor refinements only.",
      long:
        "Exceptionally clear and compelling on first read. Very minor refinements only.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  if (clamped >= 92) {
    return {
      score: clamped,
      label: "Top-bar ready",
      short: "Exceptionally clear and compelling on first read. Very minor refinements only.",
      long:
        "Exceptionally clear and compelling on first read. Very minor refinements only.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  if (clamped >= 85) {
    return {
      score: clamped,
      label: "High bar",
      short: "Strong clarity and signal. Only light tightening needed to make your story land even cleaner.",
      long:
        "Strong clarity and signal. Only light tightening needed to make your story land even cleaner.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  if (clamped >= 78) {
    return {
      score: clamped,
      label: "Strong story",
      short: "Clear momentum and ownership with a few areas needing sharper framing or impact cues.",
      long:
        "Clear momentum and ownership with a few areas needing sharper framing or impact cues.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  if (clamped >= 70) {
    return {
      score: clamped,
      label: "Solid foundation",
      short:
        "Solid elements are here, but the core story still feels muted. Tightening scope and impact will lift the clarity.",
      long:
        "Solid elements are here, but the core story still feels muted. Tightening scope and impact will lift the clarity.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  if (clamped >= 60) {
    return {
      score: clamped,
      label: "Needs clarity",
      short:
        "Your story is present but not landing clearly yet. A few structural tweaks can quickly strengthen the signal.",
      long:
        "Your story is present but not landing clearly yet. A few structural tweaks can quickly strengthen the signal.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  if (clamped >= 50) {
    return {
      score: clamped,
      label: "Thin signal",
      short: "Ownership and outcomes are hard to see.",
      long:
        "Rebuild top bullets with clear role, scope, and before/after changes. Add context before applying.",
      bandId: getBandIdFromScore(clamped)
    };
  }
  return {
    score: clamped,
    label: "Not ready",
    short: "Hard to see role, scope, or results.",
    long:
      "Add structure, roles, and outcomes so there is usable signal. Right now it is not review-ready.",
    bandId: getBandIdFromScore(clamped)
  };
}

function applyScoreColor(score) {
  if (Number.isNaN(score) || !scoreDialContainerEl) return;

  // Clear previous color classes
  scoreDialContainerEl.classList.remove("score-low", "score-mid", "score-good", "score-great");

  // Apply color class based on score
  let cls = "";
  if (score < 50) cls = "score-low";
  else if (score < 70) cls = "score-mid";
  else if (score < 90) cls = "score-good";
  else cls = "score-great";

  if (cls) {
    scoreDialContainerEl.classList.add(cls);
  }

  // Update dial progress and number with synchronized animation
  const circumference = 2 * Math.PI * 54; // radius is 54, approximately 339.292
  const targetScore = Math.round(score);
  const targetPercentage = Math.max(0, Math.min(100, targetScore)) / 100;
  const targetOffset = circumference * (1 - targetPercentage);
  const currentScore = parseInt(scoreDialNumberEl?.textContent) || 0;
  const currentPercentage = Math.max(0, Math.min(100, currentScore)) / 100;
  const currentOffset = circumference * (1 - currentPercentage);

  if (scoreDialProgressEl) {
    // Ensure stroke-dasharray is set
    if (!scoreDialProgressEl.style.strokeDasharray) {
      scoreDialProgressEl.style.strokeDasharray = circumference;
    }
    // Set initial position based on current score
    scoreDialProgressEl.style.strokeDashoffset = currentOffset;
  }

  // Animate both dial progress and number together
  if (prefersReducedMotion()) {
    if (scoreDialNumberEl) scoreDialNumberEl.textContent = targetScore;
    if (scoreDialProgressEl) scoreDialProgressEl.style.strokeDashoffset = targetOffset;
  } else {
    const duration = 800;
    const startDelay = 300; // Match hero dial delay
    const startTime = Date.now();

    if (scoreDialNumberEl) scoreDialNumberEl.textContent = currentScore.toString();

    setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime - startDelay;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(currentScore + (targetScore - currentScore) * eased);
        const currentPercentage = Math.max(0, Math.min(100, current)) / 100;
        const currentOffset = circumference * (1 - currentPercentage);

        if (scoreDialNumberEl) {
          scoreDialNumberEl.textContent = current.toString();
        }
        if (scoreDialProgressEl) {
          scoreDialProgressEl.style.strokeDashoffset = currentOffset;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (scoreDialNumberEl) scoreDialNumberEl.textContent = targetScore.toString();
          if (scoreDialProgressEl) scoreDialProgressEl.style.strokeDashoffset = targetOffset;
        }
      };
      animate();
    }, startDelay);
  }

  // Set aria label
  scoreDialContainerEl.setAttribute("aria-label", `Score ${Math.round(score)} out of 100`);
}

function renderScoreBandsPanel(scoreMeta = {}) {
  if (!scoreTooltipEl) return;
  const bandId = scoreMeta.bandId || getBandIdFromScore(scoreMeta.score);
  const bandsMarkup = SCORE_BANDS.map((band) => {
    const isActive = band.id === bandId;
    return `
    <div class="score-band-item ${isActive ? "active" : ""}">
      <div class="score-band-header">
        <span class="score-band-range">${band.min} to ${band.max}</span>
        <span class="score-band-label">· ${escapeHtml(band.label)}</span>
        ${isActive ? '<span class="score-band-chip">Your band</span>' : ""}
      </div>
      <div class="score-band-description">${escapeHtml(band.description)}</div>
    </div>
  `;
  }).join("");

  scoreTooltipEl.innerHTML = `
  <div class="score-bands-panel">
    <div class="score-bands-panel-title">How to read this score</div>
    <div class="score-bands-intro">This clarity score is powered by a calibrated model shaped by thousands of real interview cycles. Each band reflects how clearly your story lands on a first read.</div>
    <div class="score-bands-list">${bandsMarkup}</div>
  </div>
`;
}

function updateScoreBandsVisibility() {
  if (!scoreTooltipEl) return;
  const isOpen = (scoreBandsPinned || scoreBandsHovering) && !!currentScoreMeta;
  scoreTooltipEl.classList.toggle("open", isOpen);
  scoreTooltipEl.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (scoreBandsTriggerEl) scoreBandsTriggerEl.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function triggerScoreGlow() {
  if (!scoreDialContainerEl || prefersReducedMotion()) return;
  scoreDialContainerEl.classList.remove("score-dial--reveal");
  void scoreDialContainerEl.offsetWidth;
  scoreDialContainerEl.classList.add("score-dial--reveal");
}

function toggleScoreBandsPinned() {
  if (!currentScoreMeta) return;
  scoreBandsPinned = !scoreBandsPinned;
  if (scoreBandsPinned) {
    renderScoreBandsPanel(currentScoreMeta);
  }
  updateScoreBandsVisibility();
}

function closeScoreBandsPanel() {
  scoreBandsPinned = false;
  scoreBandsHovering = false;
  updateScoreBandsVisibility();
}

function renderScoreMeta(score, modelMeta = {}) {
  const meta = getScoreMeta(score);
  const prevScoreValue = lastScoreValue;

  // Show the dial container
  if (scoreDialContainerEl) {
    scoreDialContainerEl.classList.add("visible");
    scoreDialContainerEl.classList.remove("score-dial--reveal");
    void scoreDialContainerEl.offsetWidth;
    scoreDialContainerEl.classList.add("score-dial--reveal");
  }

  applyScoreColor(meta.score);

  if (prevScoreValue !== meta.score) {
    triggerScoreGlow();
  }
  lastScoreValue = meta.score;

  const labelText = (modelMeta.score_label || "").trim() || meta.label;
  const shortText = (modelMeta.score_comment_short || "").trim() || meta.short;
  const longText = (modelMeta.score_comment_long || "").trim() || meta.long;
  currentScoreMeta = {
    ...meta,
    label: labelText,
    short: shortText,
    long: longText
  };
  renderScoreBandsPanel(currentScoreMeta);
  updateScoreBandsVisibility();
  if (scoreBandsTriggerEl) scoreBandsTriggerEl.style.display = "inline";
  if (scoreWrapperEl) scoreWrapperEl.classList.remove("hidden");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extractVerdict(summary) {
  if (!summary || !summary.trim()) return "";
  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.slice(0, 2).join(" ");
}

function extractTopFixes(data) {
  const { gaps = [], rewrites = [], next_steps: nextSteps = [] } = data || {};
  const fixes = [];
  const seen = new Set();

  const pushUnique = (value) => {
    const text = String(value || "").trim();
    if (!text) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    fixes.push(text);
  };

  // Prioritize actionable next steps, then the clearest gaps.
  nextSteps.slice(0, 3).forEach(pushUnique);
  if (fixes.length < 3) {
    gaps.slice(0, 3 - fixes.length).forEach(pushUnique);
  }
  // Fall back only to rewrite enhancement notes (avoid original/better text).
  if (fixes.length < 3) {
    for (const r of rewrites) {
      pushUnique(r?.enhancement_note);
      if (fixes.length >= 3) break;
    }
  }

  return fixes.slice(0, 3);
}

function renderHeaderVerdictAndFixes(data) {
  const verdictEl = document.getElementById("report-verdict");
  const topFixesEl = document.getElementById("top-fixes");
  const topFixesListEl = topFixesEl ? topFixesEl.querySelector(".top-fixes-list") : null;

  const verdict = extractVerdict(data.summary);
  const topFixes = extractTopFixes(data);

  if (verdictEl) {
    if (verdict) {
      verdictEl.textContent = verdict;
      verdictEl.classList.remove("hidden");
    } else {
      verdictEl.classList.add("hidden");
    }
  }

  if (topFixesListEl) {
    if (topFixes.length > 0) {
      topFixesListEl.innerHTML = topFixes.map(fix =>
        `<li>${escapeHtml(String(fix))}</li>`
      ).join("");
      if (topFixesEl) topFixesEl.classList.remove("hidden");
    } else {
      if (topFixesEl) topFixesEl.classList.add("hidden");
    }
  }
}

function createCardPreview(content, type) {
  if (type === "summary") {
    const text = String(content || "").trim();
    if (!text) return "";
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const preview = sentences.slice(0, 1).join(" ") || text;
    // Truncate to ~120 chars if longer
    return preview.length > 120 ? preview.substring(0, 120) + "…" : preview;
  }
  if (type === "list") {
    const items = Array.isArray(content) ? content : [];
    if (items.length > 0) {
      const first = String(items[0] || "").trim();
      // Truncate to ~100 chars if longer
      return first.length > 100 ? first.substring(0, 100) + "…" : first;
    }
  }
  if (type === "rewrites") {
    const rewrites = Array.isArray(content) ? content : [];
    if (rewrites.length > 0) {
      const first = rewrites[0];
      const preview = String(first?.better || first?.original || "").trim();
      // Truncate to ~100 chars if longer
      return preview.length > 100 ? preview.substring(0, 100) + "…" : preview;
    }
  }
  return "";
}

function toggleCard(cardEl) {
  if (!cardEl) return;
  const isExpanded = cardEl.classList.contains("expanded");
  const toggleBtn = cardEl.querySelector('.report-card-toggle');
  const contentEl = cardEl.querySelector('.report-card-content');

  if (isExpanded) {
    cardEl.classList.remove("expanded");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.querySelector('span:first-child').textContent = "Expand";
    }
  } else {
    cardEl.classList.add("expanded");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.querySelector('span:first-child').textContent = "Collapse";
    }
  }
}

// Static chapter renderer (replaces collapsible cards)
function renderChapter(sectionId, title, subtitle, contentHtml) {
  return `
  <div class="report-chapter" data-section="${sectionId}">
    <h3 class="report-chapter-title">${escapeHtml(title)}</h3>
    <p class="report-chapter-subtitle">${escapeHtml(subtitle)}</p>
    <div class="report-chapter-content">
      ${contentHtml}
    </div>
  </div>
`;
}

// Legacy card renderer (kept for backwards compatibility)
function renderCard(sectionId, title, subtitle, preview, contentHtml, isExpanded = false) {
  // Now uses static chapter layout
  return renderChapter(sectionId, title, subtitle, contentHtml);
}

function applySectionReveal() {
  const elements = [];
  if (resultsSummaryEl) {
    const summaryHeading = resultsSummaryEl.querySelector(".result-heading");
    if (summaryHeading) elements.push(summaryHeading);
  }
  if (resultsBodyEl) {
    const bodyHeadings = resultsBodyEl.querySelectorAll(".result-heading");
    bodyHeadings.forEach((el) => elements.push(el));
  }
  if (!elements.length) return;
  if (prefersReducedMotion()) {
    elements.forEach((el) => {
      el.style.removeProperty("animation-delay");
      el.classList.add("report-section");
    });
    return;
  }
  let delay = 260;
  elements.forEach((el) => {
    el.classList.add("report-section");
    el.style.animationDelay = `${delay}ms`;
    delay += 80;
  });
}

function triggerReportReveal() {
  if (!reportViewEl) return;
  applySectionReveal();
  if (!hasPlayedReportReveal) {
    reportViewEl.classList.add("report-container--visible");
    hasPlayedReportReveal = true;
  }
}

function triggerFocusEntrance() {
  if (!reportViewEl || prefersReducedMotion()) return;
  reportViewEl.classList.add("report-view--focus-start");
  void reportViewEl.offsetWidth;
  reportViewEl.classList.remove("report-view--focus-start");
}

function calculateIssueCounts(data) {
  const { gaps = [], rewrites = [] } = data || {};

  let impactResultsCount = 0;
  let clarityStructureCount = 0;
  let focusCraftCount = 0;

  // Group rewrites the same way renderStructuredResults does
  const clarityGroup = [];
  const impactGroup = [];
  const focusCraftGroup = [];

  for (const r of rewrites) {
    if (!r) continue;
    const label = (r.label || "").toLowerCase();
    if (label.includes("clarity") || label.includes("concise") || label.includes("conciseness") || label.includes("brevity") || label.includes("phrasing")) {
      clarityGroup.push(r);
    } else if (label.includes("impact") || label.includes("scope") || label.includes("ownership")) {
      impactGroup.push(r);
    } else if (label.includes("focus") || label.includes("relevance") || label.includes("craft") || label.includes("polish")) {
      focusCraftGroup.push(r);
    }
  }

  // Impact & Results: Count only rewrites in the Impact cluster (what's actually shown)
  impactResultsCount = impactGroup.length;

  // Clarity & Conciseness: Count only rewrites in the Clarity cluster (what's actually shown)
  clarityStructureCount = clarityGroup.length;

  // Focus & Craft: Count only Focus/Craft rewrites (no fallback - only show if rewrites exist)
  focusCraftCount = focusCraftGroup.length;

  return {
    impactResults: impactResultsCount,
    clarityStructure: clarityStructureCount,
    focusCraft: focusCraftCount
  };
}

function updateIssueBreakdown(counts) {
  if (!issueBreakdownEl) return;

  const impactBar = issueBreakdownEl.querySelector('[data-section="impact-results"]');
  const clarityBar = issueBreakdownEl.querySelector('[data-section="clarity-structure"]');
  const focusBar = issueBreakdownEl.querySelector('[data-section="focus-craft"]');

  if (impactBar) {
    const countEl = impactBar.querySelector('.issue-bar-count');
    if (countEl) {
      countEl.textContent = counts.impactResults === 1 ? '1 top suggestion' : `${counts.impactResults} top suggestions`;
    }
    impactBar.setAttribute('data-count', String(counts.impactResults));
  }

  if (clarityBar) {
    const countEl = clarityBar.querySelector('.issue-bar-count');
    if (countEl) {
      countEl.textContent = counts.clarityStructure === 1 ? '1 top suggestion' : `${counts.clarityStructure} top suggestions`;
    }
    clarityBar.setAttribute('data-count', String(counts.clarityStructure));
  }

  if (focusBar) {
    // Only show Focus & Craft bar if there are actual rewrites
    if (counts.focusCraft > 0) {
      const countEl = focusBar.querySelector('.issue-bar-count');
      if (countEl) {
        countEl.textContent = counts.focusCraft === 1 ? '1 top suggestion' : `${counts.focusCraft} top suggestions`;
      }
      focusBar.setAttribute('data-count', String(counts.focusCraft));
      focusBar.style.display = '';
    } else {
      // Hide the bar if no Focus/Craft rewrites exist
      focusBar.style.display = 'none';
    }
  }

  // Show the breakdown panel
  issueBreakdownEl.classList.remove('hidden');
  setTimeout(() => {
    issueBreakdownEl.classList.add('visible');
  }, 100);
}

function handleIssueBarClick(section) {
  const resultsBodyEl = document.getElementById("results-body");
  if (!resultsBodyEl) return;

  let targetChapter = null;

  if (section === "impact-results" || section === "clarity-structure") {
    // Scroll to "Stronger phrasing" chapter
    targetChapter = resultsBodyEl.querySelector('[data-section="stronger-phrasing"]');
  } else if (section === "focus-craft") {
    // Scroll to "What's harder to see" chapter
    targetChapter = resultsBodyEl.querySelector('[data-section="harder-to-see"]');
  }

  if (targetChapter) {
    targetChapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Add a subtle highlight effect
    targetChapter.style.transition = 'background-color var(--motion-duration-short) var(--motion-ease-premium)';
    targetChapter.style.backgroundColor = 'var(--accent-wash)';
    setTimeout(() => {
      targetChapter.style.backgroundColor = '';
      setTimeout(() => {
        targetChapter.style.transition = '';
      }, 180);
    }, 1000);
  }
}

function renderStructuredResults(data, options = {}) {
  const { isSample = false, accessTier = "pass_full" } = options;
  const {
    summary,
    strengths,
    gaps,
    rewrites,
    next_steps: nextSteps,
    score,
    score_label: scoreLabelText,
    score_comment_short: scoreCommentShort,
    score_comment_long: scoreCommentLong,
    suggested_bullets: suggestedBullets,
    missing_wins: missingWins
  } = data || {};
  hasReportContent = true;

  // Determine if this is a full access report or thin/free report
  const isFullAccess = accessTier === "pass_full" || isSample;
  const isFreeRun = accessTier === "free_full";

  // Free tier limits (spec: thin report = 2-3 issues, 1-2 rewrites)
  const FREE_ISSUES_LIMIT = 3;
  const FREE_REWRITES_LIMIT = 2;

  // Show/hide sample tag
  if (isSample) {
    showSampleTag();
  } else {
    hideSampleTag();
  }

  // Update export/copy button visibility based on access tier
  if (exportButtonEl) {
    if (isFullAccess) {
      exportButtonEl.style.display = "";
      exportButtonEl.disabled = false;
    } else {
      exportButtonEl.style.display = "none";
    }
  }
  if (copyFullButtonEl) {
    if (isFullAccess) {
      copyFullButtonEl.style.display = "";
      copyFullButtonEl.disabled = false;
    } else {
      copyFullButtonEl.style.display = "none";
    }
  }

  // Render header with verdict and top-3 fixes
  renderHeaderVerdictAndFixes(data);

  // Score dial and commentary
  if (typeof score === "number") {
    renderScoreMeta(score, {
      score_label: scoreLabelText,
      score_comment_short: scoreCommentShort,
      score_comment_long: scoreCommentLong
    });
  } else {
    clearScoreBadge();
  }

  // Calculate and update issue breakdown counts
  const counts = calculateIssueCounts({ gaps, rewrites });
  updateIssueBreakdown(counts);

  let html = "";

  // Card 1: How your story reads (summary)
  if (summary && summary.trim()) {
    const preview = createCardPreview(summary, "summary");
    const contentHtml = `<p class="result-paragraph">${escapeHtml(summary)}</p>`;
    html += renderCard("story-reads", "How your story reads", "A quick read on how your resume actually lands.", preview, contentHtml, true);
  }

  // Card 2: What's working (strengths)
  if (Array.isArray(strengths) && strengths.length > 0) {
    const preview = createCardPreview(strengths, "list");
    let contentHtml = `<ul class="result-list">`;
    for (const item of strengths) {
      if (!item) continue;
      contentHtml += `<li>${escapeHtml(String(item))}</li>`;
    }
    contentHtml += `</ul>`;
    html += renderCard("whats-working", "What is working", "Strengths that are already clear on first read and help your story land as intended.", preview, contentHtml);
  }

  // Card 3: What's harder to see (gaps)
  if (Array.isArray(gaps) && gaps.length > 0) {
    const preview = createCardPreview(gaps, "list");
    const gapsToShow = isFreeRun ? gaps.slice(0, FREE_ISSUES_LIMIT) : gaps;
    const hiddenGaps = isFreeRun ? Math.max(0, gaps.length - FREE_ISSUES_LIMIT) : 0;

    let contentHtml = `<ul class="result-list">`;
    for (const item of gapsToShow) {
      if (!item) continue;
      contentHtml += `<li>${escapeHtml(String(item))}</li>`;
    }
    contentHtml += `</ul>`;

    // Add locked section teaser if there are more gaps
    if (hiddenGaps > 0) {
      contentHtml += `<div class="locked-section-teaser">`;
      contentHtml += `<div class="locked-section-icon">🔒</div>`;
      contentHtml += `<div class="locked-section-text">Unlock ${hiddenGaps} more issue${hiddenGaps > 1 ? 's' : ''} identified</div>`;
      contentHtml += `<a href="#pricing" class="locked-section-cta" onclick="trackEvent('paywall_opened', { source: 'locked_issues' })">Get every fix with a pass →</a>`;
      contentHtml += `</div>`;
    }

    html += renderCard("harder-to-see", "What is harder to see", "Surfaces buried impact, unclear outcomes, and work that isn't landing clearly yet.", preview, contentHtml);
  }

  // Card 4: Stronger phrasing you can use (rewrites)
  if (Array.isArray(rewrites) && rewrites.length > 0) {
    const clarityGroup = [];
    const impactGroup = [];
    const fallbackGroup = [];

    for (const r of rewrites) {
      if (!r) continue;
      const label = (r.label || "").toLowerCase();
      if (label.includes("clarity") || label.includes("concise") || label.includes("conciseness") || label.includes("brevity") || label.includes("phrasing")) {
        clarityGroup.push(r);
      } else if (label.includes("impact") || label.includes("scope") || label.includes("ownership")) {
        impactGroup.push(r);
      } else {
        fallbackGroup.push(r);
      }
    }

    while (fallbackGroup.length) {
      const target = clarityGroup.length <= impactGroup.length ? clarityGroup : impactGroup;
      target.push(fallbackGroup.shift());
    }

    // For free runs, limit rewrites shown
    const totalRewrites = clarityGroup.length + impactGroup.length;
    const hiddenRewrites = isFreeRun ? Math.max(0, totalRewrites - FREE_REWRITES_LIMIT) : 0;
    let rewritesShown = 0;

    const renderRewriteGroup = (groupItems, maxToShow = Infinity) => {
      let groupHtml = "";
      let shown = 0;
      for (const r of groupItems) {
        if (!r) continue;
        if (shown >= maxToShow) break;

        const original = r.original || "";
        const better = r.better || "";
        const enhancementNote = r.enhancement_note || r.enhancementNote || "";

        groupHtml += `<div class="rewrite-block">`;
        groupHtml += `<div class="rewrite-columns">`;

        groupHtml += `<div class="rewrite-column">`;
        if (original) {
          groupHtml += `<div class="rewrite-label">Original</div>`;
          groupHtml += `<div class="rewrite-text">${escapeHtml(String(original))}</div>`;
        }
        groupHtml += `</div>`;

        groupHtml += `<div class="rewrite-column right">`;
        if (better) {
          groupHtml += `<div class="rewrite-label">Better</div>`;
          groupHtml += `<div class="rewrite-text">${escapeHtml(String(better))}</div>`;
        }
        if (enhancementNote) {
          groupHtml += `<div class="rewrite-enhancement-note">${escapeHtml(String(enhancementNote))}</div>`;
        }
        groupHtml += `</div>`;

        groupHtml += `</div>`;
        groupHtml += `</div>`;
        shown++;
      }
      rewritesShown += shown;
      return groupHtml;
    };

    const preview = createCardPreview(rewrites, "rewrites");
    let contentHtml = "";

    if (isFreeRun) {
      // For free runs, show limited rewrites across both groups
      const remainingLimit = FREE_REWRITES_LIMIT;
      if (clarityGroup.length > 0) {
        const clarityLimit = Math.min(clarityGroup.length, Math.ceil(remainingLimit / 2));
        contentHtml += `<div class="rewrite-cluster-heading" data-cluster="clarity">Clarity & Conciseness</div>`;
        contentHtml += renderRewriteGroup(clarityGroup, clarityLimit);
      }
      if (impactGroup.length > 0 && rewritesShown < FREE_REWRITES_LIMIT) {
        const impactLimit = FREE_REWRITES_LIMIT - rewritesShown;
        contentHtml += `<div class="rewrite-cluster-heading" data-cluster="impact">Impact, Scope & Ownership</div>`;
        contentHtml += renderRewriteGroup(impactGroup, impactLimit);
      }

      // Add locked section teaser if there are more rewrites
      if (hiddenRewrites > 0) {
        contentHtml += `<div class="locked-section-teaser">`;
        contentHtml += `<div class="locked-section-icon">🔒</div>`;
        contentHtml += `<div class="locked-section-text">Unlock ${hiddenRewrites} more rewrite${hiddenRewrites > 1 ? 's' : ''} in this section</div>`;
        contentHtml += `<a href="#pricing" class="locked-section-cta" onclick="trackEvent('paywall_opened', { source: 'locked_rewrites' })">Get every fix with a pass →</a>`;
        contentHtml += `</div>`;
      }
    } else {
      // Full access - show all rewrites
      if (clarityGroup.length > 0) {
        contentHtml += `<div class="rewrite-cluster-heading" data-cluster="clarity">Clarity & Conciseness</div>`;
        contentHtml += renderRewriteGroup(clarityGroup);
      }
      if (impactGroup.length > 0) {
        contentHtml += `<div class="rewrite-cluster-heading" data-cluster="impact">Impact, Scope & Ownership</div>`;
        contentHtml += renderRewriteGroup(impactGroup);
      }
    }

    html += renderCard("stronger-phrasing", "Stronger phrasing you can use", "Crisp, realistic upgrades that make your accomplishments clearer without changing your voice.", preview, contentHtml);
  } else if (Array.isArray(suggestedBullets) && suggestedBullets.length > 0) {
    const preview = createCardPreview(suggestedBullets, "list");
    let contentHtml = `<ul class="result-list">`;
    for (const bullet of suggestedBullets) {
      if (!bullet) continue;
      contentHtml += `<li>${escapeHtml(String(bullet))}</li>`;
    }
    contentHtml += `</ul>`;
    html += renderCard("stronger-phrasing", "Stronger phrasing you can use", "Crisp, realistic upgrades that make your accomplishments clearer without changing your voice.", preview, contentHtml);
  }

  // Card 5: Next steps
  const fixedNextSteps = [
    "Split multi idea bullets so your role and impact are clearer.",
    "Add numbers or specific outcomes where they strengthen the story.",
    "Highlight your ownership in key achievements so your contribution stands out.",
    "Remember to make your strongest work easy to spot. Most recruiters will make a yes, no, or maybe decision within a few seconds."
  ];
  const preview = createCardPreview(fixedNextSteps, "list");
  let contentHtml = `<ul class="result-list">`;
  for (const step of fixedNextSteps) {
    contentHtml += `<li>${escapeHtml(String(step))}</li>`;
  }
  contentHtml += `</ul>`;
  html += renderCard("next-steps", "Next steps", "Clear, doable actions that build momentum and make your story easier to read.", preview, contentHtml);

  if (!html) {
    html = '<div class="report-chapter"><p class="report-chapter-content">No feedback returned.</p></div>';
  }

  // Add free tier upsell banner for free runs
  if (isFreeRun) {
    html += `<div class="free-tier-upsell">`;
    html += `<div class="free-tier-upsell-icon">✨</div>`;
    html += `<div class="free-tier-upsell-title">Want the complete picture?</div>`;
    html += `<div class="free-tier-upsell-text">Unlock every rewrite, Missing Wins prompts, and PDF export with a pass.</div>`;
    html += `<button type="button" class="free-tier-upsell-cta" onclick="document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); trackEvent('paywall_opened', { source: 'free_tier_banner' })">See pass options →</button>`;
    html += `</div>`;
  }

  // Wrap chapters in a container
  resultsBodyEl.innerHTML = `<div class="report-chapters">${html}</div>`;

  // Show/hide Missing Wins section based on access tier
  if (ideasInlineEl) {
    if (isFullAccess) {
      ideasInlineEl.classList.remove("hidden");
    } else {
      // Hide Missing Wins for free tier, show locked teaser instead
      ideasInlineEl.classList.add("hidden");
    }
  }

  resultsBodyEl.classList.remove("refreshed");
  void resultsBodyEl.offsetWidth;
  resultsBodyEl.classList.add("refreshed");
  resultsBodyEl.classList.remove("empty");
  resultsBodyEl.classList.add("results-body-better-flash");
  setTimeout(() => resultsBodyEl.classList.remove("results-body-better-flash"), 220);
  updateToolLayout();
}

if (scoreWrapperEl) {
  scoreWrapperEl.addEventListener("mouseenter", () => {
    if (!currentScoreMeta) return;
    scoreBandsHovering = true;
    renderScoreBandsPanel(currentScoreMeta);
    updateScoreBandsVisibility();
  });
  scoreWrapperEl.addEventListener("mouseleave", () => {
    scoreBandsHovering = false;
    updateScoreBandsVisibility();
  });
}

if (scoreDialContainerEl) {
  // Issue breakdown bar click handlers
  if (issueBreakdownEl) {
    const issueBars = issueBreakdownEl.querySelectorAll('.issue-bar');
    issueBars.forEach(bar => {
      bar.addEventListener('click', () => {
        const section = bar.getAttribute('data-section');
        if (section) {
          handleIssueBarClick(section);
        }
      });
    });
  }

  scoreDialContainerEl.addEventListener("click", () => {
    toggleScoreBandsPinned();
  });
}

if (scoreBandsTriggerEl) {
  scoreBandsTriggerEl.addEventListener("click", (event) => {
    event.preventDefault();
    toggleScoreBandsPinned();
  });
}

document.addEventListener("click", (event) => {
  if (
    (scoreTooltipEl && scoreTooltipEl.contains(event.target)) ||
    (scoreWrapperEl && scoreWrapperEl.contains(event.target)) ||
    (scoreBandsTriggerEl && scoreBandsTriggerEl.contains(event.target))
  ) {
    return;
  }
  closeScoreBandsPanel();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeScoreBandsPanel();
  }
});

function selectTier(tier = "24h") {
  selectedTier = tier || "24h";
  paywallTierButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-tier") === selectedTier;
    btn.classList.toggle("selected", isActive);
  });
  if (paywallStatusEl) paywallStatusEl.textContent = "";
}

async function startCheckout(tier = selectedTier) {
  if (paywallStatusEl) paywallStatusEl.textContent = "Opening checkout...";
  logEvent("checkout_started", { tier });
  try {
    const resp = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ tier })
    });
    const data = await resp.json().catch(() => null);
    if (resp.status === 401) {
      if (paywallStatusEl) paywallStatusEl.textContent = "Enter your email and code to continue.";
      return;
    }
    if (!resp.ok || !data?.ok || !data?.url) {
      const msg =
        data?.message || "Could not start checkout right now. Try again in a moment.";
      if (paywallStatusEl) paywallStatusEl.textContent = msg;
      return;
    }
    window.location.href = data.url;
  } catch (err) {
    if (paywallStatusEl) {
      paywallStatusEl.textContent =
        "Could not start checkout right now. Try again in a moment.";
    }
  }
}

// Paywall tier buttons
document.querySelectorAll(".paywall-tier").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tier = btn.getAttribute("data-tier");
    selectTier(tier);
  });
});

// Pricing section CTA buttons
document.querySelectorAll(".pricing-card-cta[data-tier]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const tier = btn.getAttribute("data-tier");
    selectTier(tier);

    // If user is already logged in, go directly to Stripe checkout
    if (currentUser) {
      await startCheckout(tier);
    } else {
      // Not logged in - show paywall for authentication first
      showPaywall();
    }
  });
});

async function requestLoginCode() {
  const email = (paywallEmailInput?.value || "").trim();
  if (!email) {
    paywallStatusEl.textContent = "Enter your email to continue.";
    return;
  }
  paywallStatusEl.textContent = "Sending code...";
  try {
    const resp = await fetch("/api/login/request-code", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data?.ok) {
      paywallStatusEl.textContent = data?.message || "Could not send code right now.";
      return;
    }
    paywallStatusEl.textContent = "Code sent. Check your email.";
  } catch (err) {
    paywallStatusEl.textContent = "Could not send code right now.";
  }
}

async function verifyLoginCodeAndCheckout() {
  const email = (paywallEmailInput?.value || "").trim();
  const code = (paywallCodeInput?.value || "").trim();
  if (!email || !code) {
    paywallStatusEl.textContent = "Enter your email and code.";
    return;
  }
  paywallStatusEl.textContent = "Verifying code...";
  try {
    const resp = await fetch("/api/login/verify", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok || !data?.ok) {
      paywallStatusEl.textContent = data?.message || "Invalid code. Try again.";
      return;
    }
    currentUser = data.user;
    activePass = data.active_pass;
    paywallStatusEl.textContent = "Verified. Redirecting to checkout...";
    await startCheckout(selectedTier);
  } catch (err) {
    paywallStatusEl.textContent = "Could not verify code right now.";
  }
}

if (paywallSendCodeBtn) {
  paywallSendCodeBtn.addEventListener("click", requestLoginCode);
}

if (paywallVerifyBtn) {
  paywallVerifyBtn.addEventListener("click", verifyLoginCodeAndCheckout);
}

if (paywallCloseEl) {
  paywallCloseEl.addEventListener("click", () => {
    hidePaywall();
    statusEl.textContent = "";
    setStatus("");
  });
}

// Short-resume dialog handlers
const shortResumeDialogEl = document.getElementById("short-resume-dialog");
const shortResumePasteFullBtn = document.getElementById("short-resume-paste-full");
const shortResumeReviewAnywayBtn = document.getElementById("short-resume-review-anyway");
const shortResumeSkipCheckbox = document.getElementById("short-resume-skip-checkbox");

function showShortResumeDialog(meta) {
  if (shortResumeDialogEl) {
    shortResumeDialogEl.classList.add("open");
    trackEvent("short_resume_dialog_shown", {
      text_length: meta?.charCount ?? inputEl.value.length,
      bullet_count: meta?.bulletCount ?? countBullets(inputEl.value),
      reason: meta?.reason ?? "unknown"
    });
  }
}

function hideShortResumeDialog() {
  if (shortResumeDialogEl) {
    shortResumeDialogEl.classList.remove("open");
  }
}

// Toast management
const runToastEl = document.getElementById("run-toast");
let toastTimeout = null;

function showRunToast(message, duration = 6000) {
  if (!runToastEl) return;

  // Clear any existing toast
  if (toastTimeout) clearTimeout(toastTimeout);
  runToastEl.classList.remove("visible");

  // Small delay before showing new toast (for animation reset)
  requestAnimationFrame(() => {
    runToastEl.textContent = message;
    runToastEl.classList.add("visible");

    toastTimeout = setTimeout(() => {
      runToastEl.classList.remove("visible");
    }, duration);
  });
}

function hideRunToast() {
  if (!runToastEl) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  runToastEl.classList.remove("visible");
}

// Auto-dismiss toast on scroll
window.addEventListener("scroll", () => {
  if (runToastEl?.classList.contains("visible")) {
    hideRunToast();
  }
}, { passive: true });

// Dismiss toast on click
if (runToastEl) {
  runToastEl.addEventListener("click", hideRunToast);
  runToastEl.style.cursor = "pointer";
}

// Pending short-resume confirmation state
let pendingShortResumeOptions = null;

async function runAnalysis(options = {}) {
  const sampleRun = options.sample ?? isSampleRun;
  const shortConfirmed = options.shortConfirmed ?? false;
  currentReportIsSample = sampleRun;
  isSampleRun = false;
  const text = (options.textOverride ?? inputEl.value ?? "").trim();
  const wasSampleView = isSampleReportActive;
  const resumeAssessment = assessResumeLength(text);

  // Short-resume check (only for non-sample, non-confirmed runs)
  if (!sampleRun && !shortConfirmed && resumeAssessment.shouldWarn && !shouldSkipShortResumeDialog()) {
    // Store the options and show dialog
    pendingShortResumeOptions = { ...options, textOverride: text, resumeAssessment };
    showShortResumeDialog(resumeAssessment);
    return;
  }

  // If it's long enough but bullets look stripped, show a soft hint instead of blocking
  if (resumeAssessment.shouldHint) {
    showRunToast("Looks like formatting stripped bullets. You can paste the full resume or run anyway.");
    trackEvent("short_resume_hint_shown", {
      text_length: resumeAssessment.charCount,
      bullet_count: resumeAssessment.bulletCount,
      reason: resumeAssessment.reason
    });
  }

  // If the sample report was open, reset to the default input-focused view
  if (wasSampleView) {
    hideSampleTag();
    isSampleReportActive = false;
    currentReportIsSample = false;
    lastReportData = null;
    if (reportWrapperEl) {
      reportWrapperEl.style.display = "none";
    }
    if (resultsBodyEl) {
      resultsBodyEl.innerHTML = "";
      resultsBodyEl.classList.add("empty");
      resultsBodyEl.classList.remove("results-error", "muted");
      resultsBodyEl.style.display = "";
    }
    if (resultsActionsBottomEl) {
      resultsActionsBottomEl.classList.add("hidden");
    }
    if (resultsSkeletonEl) {
      resultsSkeletonEl.classList.add("hidden");
    }
    hasPlayedReportReveal = false;
    updateToolLayout();
  }

  trackEvent("review_started", {
    sample: sampleRun,
    text_length: text.length,
    bullet_count: countBullets(text),
    short_confirmed: shortConfirmed
  });

  // Client-side validation before API call
  const validation = validateInput();
  if (!validation.valid) {
    const msg = validation.error;
    statusEl.textContent = msg;
    setStatus(msg, "error");
    showValidationError(msg);
    resultsBodyEl.textContent = "Your feedback will appear here.";
    resultsBodyEl.classList.add("empty");
    resultsBodyEl.classList.remove("results-error");
    renderSummary("");
    if (resultsActionsBottomEl) resultsActionsBottomEl.classList.add("hidden");
    return;
  }

  clearValidationError();

  if (!focusMode) {
    setFocusMode(false);
  }
  statusEl.textContent = "Reading your resume like a recruiter…";
  statusEl.classList.add("status-loading");
  setStatus("Reading your resume like a recruiter…", "");
  const shouldShowSkeleton = !wasSampleView;

  // Clear previous render so old content doesn't persist under loading
  if (resultsBodyEl) {
    resultsBodyEl.innerHTML = "";
    resultsBodyEl.classList.add("empty");
    resultsBodyEl.classList.remove("results-error", "muted");
    resultsBodyEl.style.display = "";
  }
  if (resultsSummaryEl) {
    resultsSummaryEl.textContent = "";
  }

  if (shouldShowSkeleton) {
    // Ensure the report container is visible while skeleton is showing
    if (reportViewEl) {
      reportViewEl.classList.add("report-container--visible");
    }
    runButton.disabled = true;
    originalButtonText = runButton.textContent;
    runButton.textContent = "Processing...";
    runButton.classList.add("processing");
    loadingBarEl.classList.add("active");
    // Clear previous render so old content doesn't show under the skeleton
    if (resultsBodyEl) {
      resultsBodyEl.innerHTML = "";
      resultsBodyEl.classList.add("empty");
      resultsBodyEl.classList.remove("results-error", "muted");
      resultsBodyEl.style.display = "";
    }
    renderSummary("");
    // Show skeleton and hide results-body content during loading
    if (resultsSkeletonEl) {
      resultsSkeletonEl.classList.remove("hidden");
    }
    // Ensure results area is visible
    if (reportWrapperEl) {
      reportWrapperEl.style.display = "block";
    }
    // Hide results-body content and show skeleton
    resultsBodyEl.classList.remove("results-error");
    resultsBodyEl.classList.add("empty");
    resultsBodyEl.classList.add("muted");
    resultsBodyEl.style.display = "none"; // Hide results-body when skeleton is showing

    // Auto-scroll to results area to show skeleton
    setTimeout(() => {
      const reportCard = document.querySelector(".card-output");
      if (reportCard && typeof reportCard.scrollIntoView === "function") {
        reportCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  } else {
    // Keep the input full-width until the new report is ready
    runButton.disabled = true;
    originalButtonText = runButton.textContent;
    runButton.textContent = "Processing...";
    runButton.classList.add("processing");
    loadingBarEl.classList.add("active");
    if (resultsSkeletonEl) {
      resultsSkeletonEl.classList.add("hidden");
    }
  }
  clearScoreBadge();
  resetIdeasSection();

  try {
    const response = await fetch("/api/resume-feedback", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: currentMode,
        text,
        short_confirmed: shortConfirmed
      })
    });

    // New: read the unified payload from the backend
    const payload = await response.json().catch(() => null);

    const fieldMessages =
      payload?.details?.fieldErrors &&
      Object.values(payload.details.fieldErrors)
        .filter(Boolean)
        .join(" ");

    const isValidationError = payload?.errorCode === "VALIDATION_ERROR";

    // If HTTP is not ok or payload is missing, show a calm error
    if (!response.ok || !payload) {
      const msg =
        fieldMessages ||
        mapErrorToUserMessage(
          payload?.errorCode,
          payload?.message || "Unexpected server response."
        );
      statusEl.textContent = msg;
      statusEl.classList.remove("status-loading");
      setStatus(msg, "error");
      // Hide skeleton on error
      if (resultsSkeletonEl) {
        resultsSkeletonEl.classList.add("hidden");
      }
      showReportContainer();
      if (isValidationError) {
        renderSummary(msg);
        resultsBodyEl.textContent = "";
        resultsBodyEl.style.display = "";
        resultsBodyEl.classList.add("empty");
        resultsBodyEl.classList.remove("results-error");
        updateToolLayout();
      } else {
        resultsBodyEl.textContent =
          fieldMessages ||
          "Something went wrong. Try again in a moment.";
        resultsBodyEl.style.display = "";
        resultsBodyEl.classList.add("results-error");
        resultsBodyEl.classList.remove("empty");
        renderSummary("");
        updateToolLayout();
      }
      return;
    }

    // Backend explicitly signaled an error (ok === false)
    if (payload.ok === false) {
      const msg =
        fieldMessages ||
        mapErrorToUserMessage(payload.errorCode, payload.message);
      statusEl.textContent = msg;
      statusEl.classList.remove("status-loading");
      setStatus(msg, payload.errorCode === "PAYWALL_REQUIRED" ? "info" : "error");
      if (payload.errorCode === "PAYWALL_REQUIRED") {
        // Keep existing report visible; just prompt upgrade and surface paywall.
        showReportContainer();
        if (resultsBodyEl) {
          resultsBodyEl.classList.remove("results-error");
          resultsBodyEl.classList.remove("empty");
        }
        showPaywall();
        // Focus the paywall for accessibility
        if (paywallCloseEl) {
          paywallCloseEl.focus({ preventScroll: false });
        }
        // Soft-scroll to paywall/pricing area
        const pricingSection = document.querySelector(".pricing-section") || paywallBackdropEl;
        if (pricingSection && typeof pricingSection.scrollIntoView === "function") {
          pricingSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // Do not clear last report; keep it visible.
        // Also avoid overwriting body with error content.
        return;
      }
      // Hide skeleton on error
      if (resultsSkeletonEl) {
        resultsSkeletonEl.classList.add("hidden");
      }
      showReportContainer();
      if (isValidationError) {
        renderSummary(msg);
        resultsBodyEl.textContent = "";
        resultsBodyEl.style.display = "";
        resultsBodyEl.classList.add("empty");
        resultsBodyEl.classList.remove("results-error");
        updateToolLayout();
      } else {
        resultsBodyEl.textContent =
          fieldMessages ||
          "Something went wrong. Try again in a moment.";
        resultsBodyEl.style.display = "";
        resultsBodyEl.classList.add("results-error");
        resultsBodyEl.classList.remove("empty");
        renderSummary("");
        updateToolLayout();
      }
      return;
    }

    // Happy path: payload.data is the validated object from the server
    let structured = null;

    if (payload.data && typeof payload.data === "object") {
      structured = payload.data;
    }

    if (payload.active_pass) {
      activePass = payload.active_pass;
    }
    if (payload.user) {
      currentUser = payload.user;
    }

    // Update free run state from server response
    updateFreeRunState(payload);

    // Track free report viewed event
    if (payload.access_tier === "free_full" && !sampleRun) {
      trackEvent("free_report_viewed", {
        free_run_index: payload.free_run_index,
        free_uses_remaining: payload.free_uses_remaining
      });

      // Show after-run toast based on which free run this was
      if (payload.free_run_index === 1) {
        showRunToast("Free report used. We'll give you one extra run in case you need it.");
      } else if (payload.free_run_index === 2) {
        showRunToast("You've used your free full reports. You can still get your Clarity Score for free anytime.");
      }
    }

    if (!structured) {
      const msg = "Unexpected server response.";
      statusEl.textContent = msg;
      statusEl.classList.remove("status-loading");
      setStatus(msg, "error");
      // Hide skeleton on error
      if (resultsSkeletonEl) {
        resultsSkeletonEl.classList.add("hidden");
      }
      showReportContainer();
      resultsBodyEl.textContent = msg;
      resultsBodyEl.style.display = "";
      resultsBodyEl.classList.add("results-error");
      resultsBodyEl.classList.remove("empty");
      renderSummary("");
      updateToolLayout();
      return;
    }

    showReportContainer();
    renderStructuredResults(structured, {
      isSample: false,
      accessTier: payload.access_tier || "free_full"
    });
    isSampleReportActive = false;
    if (resultsSkeletonEl) {
      resultsSkeletonEl.classList.add("hidden");
    }
    lastReportData = structured;
    triggerReportReveal();
    // Hide skeleton and show results-body
    resultsBodyEl.style.display = ""; // Show results-body
    resultsBodyEl.classList.remove("empty");
    updateToolLayout();
    resultsBodyEl.classList.remove("results-error");
    if (resultsActionsBottomEl) {
      resultsActionsBottomEl.classList.remove("hidden");
    }

    // Export/copy only enabled for paid users
    const currentAccessTier = payload.access_tier || "free_full";
    const hasFullAccess = currentAccessTier === "pass_full";

    if (exportButtonEl) {
      if (hasFullAccess) {
        exportButtonEl.disabled = false;
        exportButtonEl.title = "";
        exportButtonEl.style.display = "";
      } else {
        exportButtonEl.style.display = "none";
      }
    }
    if (copyFullButtonEl) {
      if (hasFullAccess) {
        copyFullButtonEl.disabled = false;
        copyFullButtonEl.title = "";
        copyFullButtonEl.style.display = "";
      } else {
        copyFullButtonEl.style.display = "none";
      }
    }

    // Only preload Missing Wins for paid users
    if (hasFullAccess) {
      runIdeas({ auto: true, sourceText: text });
    }

    setFocusMode(true);

    // Auto-scroll to results area for all runs (not just sample)
    setTimeout(() => {
      const reportCard = document.querySelector(".card-output");
      if (reportCard && typeof reportCard.scrollIntoView === "function") {
        reportCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    if (typeof resultsBodyEl.scrollTo === "function") {
      resultsBodyEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      resultsBodyEl.scrollTop = 0;
    }

    statusEl.textContent = "";
    statusEl.classList.remove("status-loading");
    setStatus("");
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Something went wrong. Try again in a moment.";
    statusEl.classList.remove("status-loading");
    setStatus("Something went wrong. Try again in a moment.", "error");
    // Hide skeleton on error
    if (resultsSkeletonEl) {
      resultsSkeletonEl.classList.add("hidden");
    }
    showReportContainer();
    resultsBodyEl.textContent =
      "Something went wrong. Try again in a moment.";
    resultsBodyEl.style.display = "";
    resultsBodyEl.classList.add("results-error");
    resultsBodyEl.classList.remove("empty");
    renderSummary("");
    updateToolLayout();
  } finally {
    runButton.disabled = false;
    runButton.textContent = originalButtonText;
    runButton.classList.remove("processing");
    loadingBarEl.classList.remove("active");
    // Only hide skeleton if it's still showing (in case of errors)
    if (resultsSkeletonEl && !resultsSkeletonEl.classList.contains("hidden")) {
      resultsSkeletonEl.classList.add("hidden");
      resultsBodyEl.style.display = ""; // Ensure results-body is visible
    }
    resultsBodyEl.classList.remove("muted");
  }
}

// Initialize layout on page load
updateToolLayout();

// Short-resume dialog button handlers
if (shortResumePasteFullBtn) {
  shortResumePasteFullBtn.addEventListener("click", () => {
    trackEvent("short_resume_paste_full");
    hideShortResumeDialog();
    // Focus the input so user can paste full resume
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
    pendingShortResumeOptions = null;
  });
}

if (shortResumeReviewAnywayBtn) {
  shortResumeReviewAnywayBtn.addEventListener("click", () => {
    trackEvent("short_resume_review_anyway", {
      text_length: inputEl.value.length,
      bullet_count: countBullets(inputEl.value)
    });

    // Check if user wants to skip dialog in future
    if (shortResumeSkipCheckbox?.checked) {
      setSkipShortResumeDialog();
    }

    hideShortResumeDialog();

    // Continue with the analysis, marking as confirmed
    if (pendingShortResumeOptions) {
      const opts = { ...pendingShortResumeOptions, shortConfirmed: true };
      pendingShortResumeOptions = null;
      runAnalysis(opts);
    }
  });
}

runButton.addEventListener("click", runAnalysis);
if (focusToggleEl) {
  focusToggleEl.addEventListener("click", () => {
    setFocusMode(!focusMode);
  });
}

function buildFullReportText(data) {
  if (!data || typeof data !== "object") return "";
  const lines = [];
  lines.push("Resume Review — Recruiter in Your Pocket");
  if (typeof data.score === "number") {
    const band = data.score_label ? ` — ${data.score_label}` : "";
    lines.push(`Score: ${Math.round(data.score)}/100${band}`);
  }
  lines.push("");

  if (data.summary) {
    lines.push("How your resume reads:");
    lines.push("");
    lines.push(data.summary);
    lines.push("");
  }

  if (Array.isArray(data.strengths) && data.strengths.length) {
    lines.push("What’s working:");
    lines.push("");
    data.strengths.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (Array.isArray(data.gaps) && data.gaps.length) {
    lines.push("What’s harder to see:");
    lines.push("");
    data.gaps.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (Array.isArray(data.rewrites) && data.rewrites.length) {
    lines.push("Stronger phrasing you can use:");
    lines.push("");
    data.rewrites.forEach((r) => {
      if (!r) return;
      lines.push("Original:");
      lines.push("");
      if (r.original) lines.push(r.original);
      lines.push("");
      lines.push("Better:");
      lines.push("");
      if (r.better) lines.push(r.better);
      if (r.enhancement_note) lines.push(`  ${r.enhancement_note}`);
      lines.push("");
    });
  }

  if (Array.isArray(data.next_steps) && data.next_steps.length) {
    lines.push("Next steps:");
    lines.push("");
    data.next_steps.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  lines.push("Generated with Recruiter in Your Pocket — recruiterinyourpocket.com");
  return lines.join("\n");
}

if (copyFullButtonEl) {
  copyFullButtonEl.addEventListener("click", async () => {
    if (!lastReportData) {
      statusEl.textContent = "Nothing to copy yet. Run a review first.";
      return;
    }
    if (isSampleReportActive) {
      statusEl.textContent = "Copy is available after you run your own resume.";
      return;
    }
    const text = buildFullReportText(lastReportData);
    if (!text.trim()) {
      statusEl.textContent = "Nothing to copy yet. Run a review first.";
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      statusEl.textContent = "Report copied.";

      // Visual feedback on button
      const originalText = copyFullButtonEl.innerHTML;
      copyFullButtonEl.textContent = "Copied!";
      copyFullButtonEl.classList.add("btn-success-state");

      setTimeout(() => {
        copyFullButtonEl.innerHTML = originalText;
        copyFullButtonEl.classList.remove("btn-success-state");
      }, 2000);

      logEvent("copy_clicked");
    } catch (err) {
      statusEl.textContent = "Couldn't copy. Try again.";
    }
  });
}

exportButtonEl.addEventListener("click", async () => {
  const originalExportText = exportButtonEl.textContent;
  exportButtonEl.disabled = true;
  exportButtonEl.textContent = "Preparing PDF...";
  const summaryText = resultsSummaryEl ? resultsSummaryEl.innerText.trim() : "";
  const bodyText = resultsBodyEl ? resultsBodyEl.innerText.trim() : "";
  const text = [summaryText, bodyText].filter(Boolean).join("\n\n");
  if (!text || !lastReportData) {
    statusEl.textContent = "Nothing to export yet. Run a review first.";
    exportButtonEl.disabled = false;
    exportButtonEl.textContent = originalExportText;
    return;
  }
  logEvent("export_clicked");

  try {
    const generatedOnLocal = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    const resp = await fetch("/api/export-pdf", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        report: {
          ...lastReportData,
          generated_on: generatedOnLocal
        }
      })
    });
    if (!resp.ok) {
      statusEl.textContent = "Export isn't ready. Try again.";
      exportButtonEl.disabled = false;
      exportButtonEl.textContent = originalExportText;
      if (downloadWindow && !downloadWindow.closed) downloadWindow.close();
      return;
    }
    const blob = await resp.blob();
    if (!blob || blob.size === 0) {
      statusEl.textContent = "Export isn't ready. Try again.";
      exportButtonEl.disabled = false;
      exportButtonEl.textContent = originalExportText;
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-review.pdf";
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    statusEl.textContent = "Exported PDF.";

    // Visual feedback
    exportButtonEl.textContent = "Downloaded!";
    exportButtonEl.classList.add("btn-success-state");

    setTimeout(() => {
      exportButtonEl.disabled = false;
      exportButtonEl.textContent = originalExportText;
      exportButtonEl.classList.remove("btn-success-state");
    }, 2000);
  } catch (err) {
    statusEl.textContent = "Could not export right now. Try again.";
    exportButtonEl.disabled = false;
    exportButtonEl.textContent = originalExportText;
  }
});

inputEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    runAnalysis({ sample: false });
  }
});

async function runIdeas(options = {}) {
  const { auto = false, sourceText, retryCount = 0 } = options;
  let text = (sourceText || inputEl.value || "").trim();
  if (!text && isSampleReportActive && typeof SAMPLE_RESUME_TEXT === "string") {
    text = SAMPLE_RESUME_TEXT.trim();
  }
  if (!text) {
    if (!auto) {
      setIdeasStatus("Add your resume first.", "error");
    }
    return;
  }

  // For the sample experience, cycle through hardwired variants and skip the API.
  if (isSampleReportActive && SAMPLE_IDEAS_VARIANTS.length > 0) {
    const variant = SAMPLE_IDEAS_VARIANTS[ideasRefreshCount % SAMPLE_IDEAS_VARIANTS.length];
    ideasRefreshCount += 1;
    renderIdeas(variant);
    setIdeasStatus("Questions ready.");
    setTimeout(() => setIdeasStatus(""), 1400);
    ideasInFlight = false;
    return;
  }

  const refreshHint =
    ideasSeenOrder.length < 4
      ? `\n\n[refresh-${ideasSeenOrder.length + 1}: vary the questions, avoid repeating earlier ideas, and choose different archetypes or companies/tools to explore.]`
      : "";
  const seenQuestionsList = Array.from(ideasSeenQuestions).slice(-6);
  const diversityHint =
    seenQuestionsList.length > 0
      ? `\n\nDo NOT repeat any of these questions or close paraphrases: ${seenQuestionsList
        .map((q) => `"${q}"`)
        .join(
          ", "
        )}. Keep each question one sentence, under ~22 words, in plain, natural phrasing. Avoid “one moment” phrasing. Vary openings and endings—don’t repeat “what changed?” on every question. Vary companies/teams/tools; avoid superlatives like “toughest” or stacked “At <company>” intros. Choose different archetypes and outcomes; avoid awkward or repetitive wording.`
      : `\n\nKeep each question one sentence, under ~22 words, in plain, natural phrasing. Avoid “one moment” phrasing. Vary openings and endings—don’t repeat “what changed?” on every question. Vary companies/teams/tools; avoid superlatives like “toughest” or stacked “At <company>” intros. Choose different archetypes and outcomes; avoid awkward or repetitive wording.`;
  const textWithHint = `${text}${refreshHint}${diversityHint}`.trim();

  if (ideasInFlight) return;
  ideasInFlight = true;

  const originalIdeasButtonText = ideasRefreshEl ? ideasRefreshEl.textContent : "";

  if (ideasRefreshEl) {
    ideasRefreshEl.disabled = true;
    ideasRefreshEl.textContent = auto ? "Refreshing..." : "Pulling questions...";
  }
  setIdeasStatus("Pulling new questions...");
  setIdeasLoading(true);
  if (ideasBodyEl) {
    ideasBodyEl.classList.remove("results-error");
  }

  try {
    const response = await fetch("/api/resume-ideas", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: textWithHint })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.ok === false) {
      const message =
        payload?.message || "There was an error generating ideas. Please try again.";
      if (ideasBodyEl) {
        ideasBodyEl.textContent = message;
        ideasBodyEl.classList.add("results-error");
        ideasBodyEl.classList.remove("empty");
      }
      setIdeasStatus(message, "error");
      return;
    }

    const structured = payload.data || payload;
    const questions = Array.isArray(structured?.questions) ? structured.questions : [];
    const signature = questions
      .map((q) => String(q || "").trim().toLowerCase())
      .filter(Boolean)
      .join(" | ");

    const seenBefore = signature && ideasSeenSet.has(signature);
    if (!seenBefore && signature) {
      ideasSeenSet.add(signature);
      ideasSeenOrder.push(signature);
      if (ideasSeenOrder.length > 4) {
        const removed = ideasSeenOrder.shift();
        if (removed) ideasSeenSet.delete(removed);
      }
    }

    const needDiversity = seenBefore && ideasSeenOrder.length < 4;
    if (needDiversity && retryCount < 2) {
      ideasInFlight = false;
      return runIdeas({ auto, sourceText, retryCount: retryCount + 1 });
    }

    // Track individual questions to discourage repeats in future refreshes.
    for (const q of questions) {
      const cleaned = String(q || "").trim();
      if (cleaned) ideasSeenQuestions.add(cleaned);
    }

    ideasRefreshCount += 1;
    renderIdeas(structured);
    setIdeasStatus("Questions ready.");
    setTimeout(() => setIdeasStatus(""), 1600);
  } catch (err) {
    console.error(err);
    if (ideasBodyEl) {
      ideasBodyEl.textContent =
        "Something unexpected glitched. Try again in a moment.";
      ideasBodyEl.classList.add("results-error");
      ideasBodyEl.classList.remove("empty");
    }
    setIdeasStatus("Couldn’t load questions. Try again.", "error");
  } finally {
    ideasInFlight = false;
    if (ideasRefreshEl) {
      ideasRefreshEl.disabled = false;
      ideasRefreshEl.textContent = originalIdeasButtonText || "Refresh";
    }
    setIdeasLoading(false);
  }
}

if (ideasOpenEl) {
  ideasOpenEl.addEventListener("click", () => {
    logEvent("missing_wins_opened");
    openIdeasModal();
    if (!ideasBodyEl || ideasBodyEl.classList.contains("empty")) {
      runIdeas({ auto: false });
    }
  });
}

if (ideasRefreshEl) {
  ideasRefreshEl.addEventListener("click", () => {
    runIdeas({ auto: false });
  });
}

if (ideasCloseEl) {
  ideasCloseEl.addEventListener("click", closeIdeasModal);
}

if (ideasBackdropEl) {
  ideasBackdropEl.addEventListener("click", closeIdeasModal);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeIdeasModal();
  }
});

const SAMPLE_RESUME_TEXT = `Jane Doe
Senior Product Manager

Summary
Senior product manager with 7+ years of experience shipping consumer and B2B features in fast moving environments. Known for turning vague problems into clear roadmaps and coordinated launches.

Experience
Stripe — Senior Product Manager (2021–Present)
- Led cross functional team of engineers, designers, and data scientists to launch a new onboarding flow for small businesses.
- Simplified KYC steps and reduced drop off, increasing completed sign ups by 18% across key markets.
- Built a simple metrics framework so leadership could see impact weekly.

Google — Product Manager (2017–2021)
- Owned a set of growth experiments for a core collaboration product with tens of millions of users.
- Partnered with UX research and engineering to test new sharing flows that improved active usage by 9%.
- Drove roadmap, specs, and cross team communication for launches across three regions.

Education
BA, Economics
University of Washington

Skills
Product discovery, experimentation, roadmapping, stakeholder communication, SQL, basic Python, Figma`;

if (dataHandlingInlineEl) {
  dataHandlingInlineEl.addEventListener("click", (event) => {
    event.preventDefault();
    openDataModal();
  });
}

if (dataModalCloseEl) {
  dataModalCloseEl.addEventListener("click", closeDataModal);
}

if (dataModalEl) {
  dataModalEl.addEventListener("click", (event) => {
    if (event.target === dataModalEl) {
      closeDataModal();
    }
  });
}

document.addEventListener("keydown", trapDataModalFocus);

function openDataModal() {
  if (!dataModalEl) return;
  dataModalEl.classList.remove("hidden");
  // Small timeout to allow display:flex to apply before opacity transition
  requestAnimationFrame(() => {
    // Force reflow
    void dataModalEl.offsetWidth;
    dataModalEl.classList.remove("hidden"); // Ensure class logic for transition works if using :not(.hidden)
    // Add a visible class if needed, but relying on removing 'hidden' and CSS :not(.hidden) logic
  });

  previousBodyOverflow = document.body.style.overflow || "";
  document.body.style.overflow = "hidden";

  // Trap focus
  const focusable = dataModalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
}

function closeDataModal() {
  if (!dataModalEl) return;
  dataModalEl.classList.add("hidden");
  document.body.style.overflow = previousBodyOverflow;
}

if (sampleResumeButtonEl) {
  sampleResumeButtonEl.addEventListener("click", () => {
    if (!inputEl) return;
    isSampleRun = true;
    inputEl.value = SAMPLE_RESUME_TEXT;
    try {
      localStorage.setItem(STORAGE_KEY, SAMPLE_RESUME_TEXT);
    } catch (e) {
      console.warn("Could not save sample input", e);
    }
    autoResizeTextarea();
    showSavedIndicator();
    updateClearButtonVisibility();
    runAnalysis({ sample: true, textOverride: SAMPLE_RESUME_TEXT });

    // Auto-scroll to results area after a brief delay to show skeleton
    setTimeout(() => {
      const reportCard = document.querySelector(".card-output");
      if (reportCard && typeof reportCard.scrollIntoView === "function") {
        reportCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  });
}

// Sample report loading and rendering
async function loadSampleReport() {
  if (cachedSampleReport) {
    return cachedSampleReport;
  }

  // Check if window.SAMPLE_REPORT exists (from inline script)
  if (typeof window !== "undefined" && window.SAMPLE_REPORT) {
    cachedSampleReport = window.SAMPLE_REPORT;
    return cachedSampleReport;
  }

  // Otherwise fetch from JSON file
  try {
    const response = await fetch("/sample-report.json");
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    cachedSampleReport = data;
    return cachedSampleReport;
  } catch (err) {
    console.warn("Could not load sample report", err);
    return null;
  }
}

function showSampleTag() {
  if (reportTagEl) {
    reportTagEl.classList.remove("hidden");
  }
}

function hideSampleTag() {
  if (reportTagEl) {
    reportTagEl.classList.add("hidden");
  }
}

async function handleSampleReportClick() {
  if (!inputEl || !resultsBodyEl) return;

  // Ensure the report container is visible
  if (reportWrapperEl) {
    reportWrapperEl.style.display = "block";
  }
  // Clear status and errors
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.classList.remove("status-loading", "status-error", "status-success");
  }
  clearValidationError();

  // Set sample report active state
  isSampleReportActive = true;
  showSampleTag();

  // Hide skeleton if visible
  if (resultsSkeletonEl) {
    resultsSkeletonEl.classList.add("hidden");
  }

  // Hide any error states
  resultsBodyEl.classList.remove("results-error", "empty", "muted");
  resultsBodyEl.style.display = "";

  // Log event
  logEvent("sample_report_viewed");

  // Load and render sample report
  const report = await loadSampleReport();
  if (!report) {
    const errorMsg = "Sample report is temporarily unavailable. Try running the sample resume instead.";
    if (statusEl) {
      statusEl.textContent = errorMsg;
      setStatus(errorMsg, "error");
    }
    resultsBodyEl.textContent = errorMsg;
    resultsBodyEl.classList.add("results-error");
    resultsBodyEl.classList.remove("empty");
    updateToolLayout();
    return;
  }

  // Render the sample report
  renderStructuredResults(report, { isSample: true });
  lastReportData = report;

  // Reset ideas diversity for the sample flow
  resetIdeasHistory();

  // Show export/copy buttons so users can see the full experience
  if (resultsActionsBottomEl) {
    resultsActionsBottomEl.classList.remove("hidden");
  }
  if (exportButtonEl) {
    exportButtonEl.disabled = false;
    exportButtonEl.title = "";
  }
  if (copyFullButtonEl) {
    copyFullButtonEl.disabled = false;
    copyFullButtonEl.title = "";
  }

  // Trigger reveal animation
  triggerReportReveal();
  updateToolLayout();

  // Preload missing wins so the modal shows real questions for the sample
  if (ideasBodyEl) {
    runIdeas({ auto: true, sourceText: SAMPLE_RESUME_TEXT });
  }

  // Auto-scroll to results (respect reduced motion)
  setTimeout(() => {
    const reportCard = document.querySelector(".card-output");
    if (reportCard && typeof reportCard.scrollIntoView === "function") {
      if (prefersReducedMotion()) {
        reportCard.scrollIntoView({ block: "start" });
      } else {
        reportCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, 100);
}

if (sampleReportButtonEl) {
  sampleReportButtonEl.addEventListener("click", handleSampleReportClick);
}

// Hero CTA buttons
const heroCtaScrollEl = document.getElementById("hero-cta-scroll");
const heroSampleReportEl = document.getElementById("hero-sample-report");

if (heroCtaScrollEl) {
  heroCtaScrollEl.addEventListener("click", (e) => {
    e.preventDefault();
    const inputEl = document.getElementById("main-input");
    if (inputEl) {
      if (prefersReducedMotion()) {
        inputEl.scrollIntoView({ block: "center" });
      } else {
        inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => inputEl.focus(), 400);
    }
  });
}

if (heroSampleReportEl) {
  heroSampleReportEl.addEventListener("click", handleSampleReportClick);
}

if (clearButtonEl) {
  clearButtonEl.addEventListener("click", () => {
    clearInput();
  });
}

// Backdrop click should not scroll page when modal hidden
if (ideasModalEl) {
  ideasModalEl.addEventListener("click", (e) => {
    if (e.target === ideasModalEl) {
      closeIdeasModal();
    }
  });
}
function mapErrorToUserMessage(errorCode, fallbackMessage) {
  switch (errorCode) {
    case "VALIDATION_ERROR":
      return "I need a bit more from you before I can give real feedback. Check what you pasted and try again.";
    case "OPENAI_TIMEOUT":
      return "The model took too long to finish this pass. Try again in a moment.";
    case "OPENAI_NETWORK_ERROR":
      return "There was a small network hiccup. Try again and it should go through.";
    case "OPENAI_HTTP_ERROR":
      return "The model had trouble finishing your review. Try once more.";
    case "OPENAI_RESPONSE_PARSE_ERROR":
    case "OPENAI_RESPONSE_SHAPE_INVALID":
    case "OPENAI_RESPONSE_NOT_JSON":
      return "The model replied in a format I could not read cleanly. Run it again and it should come back sharper.";
    default:
      return (
        fallbackMessage ||
        "Something on my side glitched while reading your resume. Try once more."
      );
  }
}

function setStatus(message, variant = "info") {
  const el = document.getElementById("status-bar");
  if (!el) return;
  el.textContent = message || "";
  el.classList.remove("status-info", "status-error");
  if (message) {
    el.classList.add(variant === "error" ? "status-error" : "status-info");
  }
}

function resetIdeasHistory() {
  ideasRefreshCount = 0;
  ideasSeenOrder.length = 0;
  ideasSeenSet.clear();
  ideasSeenQuestions.clear();
}

function resetIdeasSection() {
  setIdeasStatus("");
  resetIdeasHistory();
  if (!ideasBodyEl) return;
  ideasBodyEl.innerHTML =
    "I’ll look for wins you have not written yet or forgot about.";
  ideasBodyEl.classList.add("empty");
  ideasBodyEl.classList.remove("results-error");
  if (ideasModalEl) {
    ideasModalEl.classList.remove("visible");
    ideasModalEl.setAttribute("aria-hidden", "true");
  }
}

function setIdeasStatus(message, variant = "info") {
  if (!ideasStatusEl) return;
  ideasStatusEl.textContent = message || "";
  ideasStatusEl.classList.toggle("error", variant === "error" && !!message);
}

function openIdeasModal() {
  if (!ideasModalEl) return;
  ideasModalEl.classList.remove("hidden");
  ideasModalEl.classList.add("visible");
  ideasModalEl.setAttribute("aria-hidden", "false");

  previousBodyOverflow = document.body.style.overflow || "";
  document.body.style.overflow = "hidden";

  // Force reflow to trigger transition
  requestAnimationFrame(() => {
    // ensure transition happens
    void ideasModalEl.offsetWidth;
  });

  const ideasSheetEl = document.getElementById("ideas-sheet");
  if (ideasSheetEl && typeof ideasSheetEl.scrollIntoView === "function") {
    ideasSheetEl.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center"
    });
  }
}

function closeIdeasModal() {
  if (!ideasModalEl) return;
  ideasModalEl.classList.remove("visible");
  ideasModalEl.classList.add("hidden");
  ideasModalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = previousBodyOverflow;
}

function setIdeasLoading(isLoading) {
  if (!ideasLoadingBarEl) return;
  if (isLoading) {
    ideasLoadingBarEl.style.opacity = "1";
    ideasLoadingBarEl.style.animation = "loadingSlide 1.2s linear infinite";
    ideasLoadingBarEl.classList.add("active");
  } else {
    ideasLoadingBarEl.style.opacity = "0";
    ideasLoadingBarEl.style.animation = "none";
    ideasLoadingBarEl.classList.remove("active");
  }
}

function renderIdeas(data) {
  if (!ideasBodyEl) return;
  const { questions, notes, how_to_use: howToUse } = data || {};
  let html = "";

  if (Array.isArray(questions) && questions.length > 0) {
    // Deduplicate and shuffle to avoid the first question sticking.
    const uniq = Array.from(new Set(questions.map((q) => String(q || "").trim()))).filter(Boolean);
    const shuffled = uniq
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
    const limited = shuffled.slice(0, 3);
    html += `<div class="ideas-section-card"><div class="ideas-section-title">Questions worth answering</div><div class="ideas-section-subline">Use these to surface wins your resume isn’t showing yet.</div><ul class="ideas-list">`;
    for (const q of limited) {
      html += `<li>${escapeHtml(String(q))}</li>`;
    }
    html += `</ul></div>`;
  }

  html += `<div class="ideas-section-card"><div class="ideas-section-title">How to use this</div><p>Pick one question and jot down what actually happened: the situation, the decision you made, what you owned, and what changed.</p></div>`;

  html += `<div class="ideas-section-card"><div class="ideas-section-title">Turn it into a bullet</div><p>Use: verb + what you owned + the outcome (ideally with a number). Skip it if it’s already covered in your resume.</p></div>`;

  ideasBodyEl.innerHTML = html || "";
  ideasBodyEl.classList.remove("empty");
  if (focusToggleEl) focusToggleEl.classList.remove("hidden");
}


// Hero dial number animation (0 → 86) with progressive circle fill
function animateHeroDialNumber() {
  const dialNumber = document.querySelector('.hero-preview-dial-number');
  const dialElement = document.querySelector('.hero-preview-dial');
  if (!dialNumber || !dialElement) return;

  const targetValue = 86;
  const targetAngle = 309; // 86/100 * 360 = 309.6deg, rounded to 309deg

  if (prefersReducedMotion()) {
    dialNumber.textContent = targetValue.toString();
    dialElement.style.background = `conic-gradient(var(--accent) 0deg ${targetAngle}deg, var(--border-subtle) ${targetAngle}deg 360deg)`;
    return;
  }

  const duration = 800;
  const startTime = Date.now();
  const startDelay = 300;

  dialNumber.textContent = '0';
  dialElement.style.background = 'conic-gradient(var(--accent) 0deg 0deg, var(--border-subtle) 0deg 360deg)';

  setTimeout(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime - startDelay;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(targetValue * eased);
      const currentAngle = Math.round((current / targetValue) * targetAngle);

      dialNumber.textContent = current.toString();
      dialElement.style.background = `conic-gradient(var(--accent) 0deg ${currentAngle}deg, var(--border-subtle) ${currentAngle}deg 360deg)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        dialNumber.textContent = targetValue.toString();
        dialElement.style.background = `conic-gradient(var(--accent) 0deg ${targetAngle}deg, var(--border-subtle) ${targetAngle}deg 360deg)`;
      }
    };
    animate();
  }, startDelay);
}

// Chapter entry fade animation using IntersectionObserver
function initChapterObserver() {
  if (prefersReducedMotion()) {
    // Show all chapters immediately if user prefers reduced motion
    document.querySelectorAll('.report-chapter').forEach(chapter => {
      chapter.classList.add('chapter-visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animation slightly for multiple chapters
        const delay = index * 60;
        setTimeout(() => {
          entry.target.classList.add('chapter-visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  });

  // Observe current chapters
  document.querySelectorAll('.report-chapter').forEach(chapter => {
    observer.observe(chapter);
  });

  // Re-observe when new chapters are added (MutationObserver)
  const resultsBody = document.getElementById('results-body');
  if (resultsBody) {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const chapters = node.querySelectorAll ?
              node.querySelectorAll('.report-chapter') : [];
            chapters.forEach(chapter => {
              observer.observe(chapter);
            });
            if (node.classList && node.classList.contains('report-chapter')) {
              observer.observe(node);
            }
          }
        });
      });
    });
    mutationObserver.observe(resultsBody, { childList: true, subtree: true });
  }
}

// ============================================================
// Header Auth System
// ============================================================

const GREETING_VARIANTS = [
  "How can I help, {name}?",
  "Hey, {name}. Ready to dive in?",
  "What are you working on, {name}?"
];

// Toast notification system
const toastContainer = document.getElementById("toast-container");

function showToast(message, type = "success", duration = 4000) {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? "🎉" : type === "error" ? "❌" : "ℹ️";
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Update pricing section based on active pass
function updatePricingSection() {
  const pricingButtons = document.querySelectorAll(".pricing-card-cta[data-tier]");

  if (!activePass) {
    // Remove active state from all buttons
    pricingButtons.forEach(btn => {
      btn.classList.remove("pass-active");
      const tier = btn.getAttribute("data-tier");
      if (tier === "24h") {
        btn.textContent = "Get 24-Hour Fix Pass";
      } else if (tier === "30d") {
        btn.textContent = "Get 30-Day Campaign Pass";
      }
    });
    return;
  }

  // Show "Active" state on pricing buttons
  const passType = activePass.type || "24h";
  const expiresAt = new Date(activePass.expires_at);
  const now = new Date();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) return;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeText = hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;

  pricingButtons.forEach(btn => {
    const tier = btn.getAttribute("data-tier");
    if (tier === passType) {
      btn.classList.add("pass-active");
      btn.textContent = `Active — ${timeText}`;
    } else {
      btn.classList.remove("pass-active");
    }
  });
}

// Auth DOM elements
const authSkeleton = document.getElementById("auth-skeleton");
const signInBtn = document.getElementById("sign-in-btn");
const passBadge = document.getElementById("pass-badge");
const passBadgeTime = document.getElementById("pass-badge-time");
const userDropdown = document.getElementById("user-dropdown");
const userDropdownBtn = document.getElementById("user-dropdown-btn");
const userDropdownMenu = document.getElementById("user-dropdown-menu");
const userAvatar = document.getElementById("user-avatar");
const userEmailDisplay = document.getElementById("user-email-display");
const dropdownEmail = document.getElementById("dropdown-email");
const dropdownPassInfo = document.getElementById("dropdown-pass-info");
const signOutBtn = document.getElementById("sign-out-btn");

// Auth modal elements
const authModalBackdrop = document.getElementById("auth-modal-backdrop");
const authModalClose = document.getElementById("auth-modal-close");
const authEmailStep = document.getElementById("auth-email-step");
const authCodeStep = document.getElementById("auth-code-step");
const authNameStep = document.getElementById("auth-name-step");
const authEmailInput = document.getElementById("auth-email-input");
const authCodeInput = document.getElementById("auth-code-input");
const authNameInput = document.getElementById("auth-name-input");
const authSendCodeBtn = document.getElementById("auth-send-code-btn");
const authVerifyBtn = document.getElementById("auth-verify-btn");
const authBackBtn = document.getElementById("auth-back-btn");
const authSaveNameBtn = document.getElementById("auth-save-name-btn");
const authSkipNameBtn = document.getElementById("auth-skip-name-btn");
const authModalStatus = document.getElementById("auth-modal-status");

// Hero greeting element
const heroTitle = document.querySelector(".hero-title");
const DEFAULT_HERO_TEXT = "See how recruiters actually read your resume.";

let authEmail = "";

function updateAuthUI() {
  // Hide skeleton
  if (authSkeleton) authSkeleton.style.display = "none";

  if (currentUser) {
    // Logged in state
    if (signInBtn) signInBtn.style.display = "none";
    if (userDropdown) userDropdown.style.display = "block";

    // Set avatar (first letter of name or email)
    const displayName = currentUser.first_name || currentUser.email;
    const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
    if (userAvatar) userAvatar.textContent = initial;

    // Set button text: first name or "Account"
    const buttonLabel = currentUser.first_name || "Account";
    if (userEmailDisplay) userEmailDisplay.textContent = buttonLabel;
    if (dropdownEmail) dropdownEmail.textContent = currentUser.email;

    // Update hero greeting if user has first_name
    updateHeroGreeting();

    // Update pass badge
    updatePassBadge();
  } else {
    // Guest state
    if (signInBtn) signInBtn.style.display = "block";
    if (userDropdown) userDropdown.style.display = "none";
    if (passBadge) passBadge.style.display = "none";

    // Reset hero to default
    if (heroTitle) heroTitle.textContent = DEFAULT_HERO_TEXT;
  }

  // Always update pricing section
  updatePricingSection();
}

function updateHeroGreeting() {
  if (!heroTitle || !currentUser) return;

  const firstName = currentUser.first_name;
  if (firstName) {
    // Pick a random greeting variant
    const variant = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
    heroTitle.textContent = variant.replace("{name}", firstName);
  } else {
    heroTitle.textContent = DEFAULT_HERO_TEXT;
  }
}

function updatePassBadge() {
  if (!activePass || !passBadge) {
    if (passBadge) passBadge.style.display = "none";
    if (dropdownPassInfo) dropdownPassInfo.style.display = "none";
    return;
  }

  const expiresAt = new Date(activePass.expires_at);
  const now = new Date();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    if (passBadge) passBadge.style.display = "none";
    if (dropdownPassInfo) dropdownPassInfo.style.display = "none";
    return;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  if (passBadgeTime) passBadgeTime.textContent = timeText;
  if (passBadge) passBadge.style.display = "inline-flex";

  // Update dropdown pass info
  if (dropdownPassInfo) {
    const passType = activePass.type === "24h" ? "24-Hour Pass" : "30-Day Pass";
    dropdownPassInfo.textContent = `${passType} — ${timeText} left`;
    dropdownPassInfo.style.display = "block";
  }
}

// User dropdown toggle
if (userDropdownBtn) {
  userDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("open");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (userDropdown && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("open");
    }
  });
}

// Sign out handler
if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
      currentUser = null;
      activePass = null;
      updateAuthUI();
      userDropdown.classList.remove("open");
      trackEvent("logged_out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

// Sign in button opens modal
if (signInBtn) {
  signInBtn.addEventListener("click", () => openAuthModal());
}

function openAuthModal() {
  if (!authModalBackdrop) return;
  authModalBackdrop.classList.add("open");
  // Reset to email step
  showAuthStep("email");
  if (authEmailInput) authEmailInput.focus();
}

function closeAuthModal() {
  if (!authModalBackdrop) return;
  authModalBackdrop.classList.remove("open");
  // Reset inputs
  if (authEmailInput) authEmailInput.value = "";
  if (authCodeInput) authCodeInput.value = "";
  if (authNameInput) authNameInput.value = "";
  if (authModalStatus) authModalStatus.textContent = "";
  authEmail = "";
}

function showAuthStep(step) {
  if (authEmailStep) authEmailStep.style.display = step === "email" ? "block" : "none";
  if (authCodeStep) authCodeStep.style.display = step === "code" ? "block" : "none";
  if (authNameStep) authNameStep.style.display = step === "name" ? "block" : "none";
  if (authModalStatus) authModalStatus.textContent = "";
}

// Close modal handlers
if (authModalClose) {
  authModalClose.addEventListener("click", closeAuthModal);
}
if (authModalBackdrop) {
  authModalBackdrop.addEventListener("click", (e) => {
    if (e.target === authModalBackdrop) closeAuthModal();
  });
}

// Send code handler
if (authSendCodeBtn) {
  authSendCodeBtn.addEventListener("click", async () => {
    const email = (authEmailInput?.value || "").trim();
    if (!email) {
      if (authModalStatus) authModalStatus.textContent = "Enter your email.";
      return;
    }

    authEmail = email;
    authSendCodeBtn.disabled = true;
    if (authModalStatus) authModalStatus.textContent = "Sending code...";

    try {
      const resp = await fetch("/api/login/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });
      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        if (authModalStatus) authModalStatus.textContent = data.message || "Could not send code.";
        authSendCodeBtn.disabled = false;
        return;
      }

      showAuthStep("code");
      if (authCodeInput) authCodeInput.focus();
    } catch (err) {
      if (authModalStatus) authModalStatus.textContent = "Could not send code.";
    }
    authSendCodeBtn.disabled = false;
  });
}

// Back button handler
if (authBackBtn) {
  authBackBtn.addEventListener("click", () => {
    showAuthStep("email");
  });
}

// Verify code handler
if (authVerifyBtn) {
  authVerifyBtn.addEventListener("click", async () => {
    const code = (authCodeInput?.value || "").trim();
    if (!code || !authEmail) {
      if (authModalStatus) authModalStatus.textContent = "Enter the code from your email.";
      return;
    }

    authVerifyBtn.disabled = true;
    if (authModalStatus) authModalStatus.textContent = "Verifying...";

    try {
      const resp = await fetch("/api/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: authEmail, code })
      });
      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        if (authModalStatus) {
          authModalStatus.textContent = data.message || "Invalid code.";
          authModalStatus.classList.add("error");
        }
        authVerifyBtn.disabled = false;
        return;
      }

      // Success!
      currentUser = data.user;
      activePass = data.active_pass || null;

      // Check if we need to collect first name
      if (!currentUser.first_name) {
        showAuthStep("name");
        if (authNameInput) {
          // Pre-fill with email prefix as suggestion
          const emailPrefix = authEmail.split("@")[0];
          const capitalized = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[^a-zA-Z]/g, "");
          authNameInput.placeholder = capitalized || "Matt";
          authNameInput.focus();
        }
      } else {
        // Already has name, just close
        closeAuthModal();
        updateAuthUI();
        trackEvent("logged_in", { has_name: true });
        const name = currentUser.first_name || "";
        showToast(name ? `Welcome back, ${name}!` : "Welcome back!");
      }
    } catch (err) {
      if (authModalStatus) authModalStatus.textContent = "Could not verify code.";
    }
    authVerifyBtn.disabled = false;
  });
}

// Save name handler
if (authSaveNameBtn) {
  authSaveNameBtn.addEventListener("click", async () => {
    const firstName = (authNameInput?.value || "").trim();
    if (!firstName) {
      if (authModalStatus) authModalStatus.textContent = "Please enter your name.";
      return;
    }

    authSaveNameBtn.disabled = true;
    if (authModalStatus) authModalStatus.textContent = "Saving...";

    try {
      const resp = await fetch("/api/update-first-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ first_name: firstName })
      });
      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        if (authModalStatus) authModalStatus.textContent = data.message || "Could not save name.";
        authSaveNameBtn.disabled = false;
        return;
      }

      currentUser = data.user;
      closeAuthModal();
      updateAuthUI();
      trackEvent("logged_in", { has_name: true, name_collected: true });
      showToast(`Welcome, ${currentUser.first_name}!`);
    } catch (err) {
      if (authModalStatus) authModalStatus.textContent = "Could not save name.";
    }
    authSaveNameBtn.disabled = false;
  });
}

// Skip name handler
if (authSkipNameBtn) {
  authSkipNameBtn.addEventListener("click", () => {
    closeAuthModal();
    updateAuthUI();
    trackEvent("logged_in", { has_name: false, name_skipped: true });
    showToast("You're signed in!");
  });
}

// Initialize auth UI on page load
async function initAuthUI() {
  // Show skeleton while loading
  if (authSkeleton) authSkeleton.style.display = "block";
  if (signInBtn) signInBtn.style.display = "none";
  if (userDropdown) userDropdown.style.display = "none";

  try {
    // Check if returning from checkout
    const params = new URLSearchParams(window.location.search);
    const isPostCheckout = params.get("checkout") === "success";

    if (isPostCheckout) {
      // Wait a bit longer for webhook to process and session to update
      await new Promise(r => setTimeout(r, 500));
      await refreshSessionState();
      trackEvent("checkout_completed", { tier: params.get("tier") || "24h" });

      // Show success toast
      const tierLabel = params.get("tier") === "30d" ? "30-Day" : "24-Hour";
      const name = currentUser?.first_name;
      showToast(name
        ? `${name}, your ${tierLabel} Pass is active!`
        : `Your ${tierLabel} Pass is active!`
      );
    } else {
      // Normal page load - wait for session check
      await new Promise(r => setTimeout(r, 100));
    }
  } catch (err) {
    console.warn("Auth initialization error:", err);
  } finally {
    // ALWAYS update UI - guarantees skeleton hides and proper state shows
    updateAuthUI();
  }
}

// Run auth UI initialization
initAuthUI();

(function init() {
  loadSavedInput();
  autoResizeTextarea();
  renderSummary("");
  animateHeroDialNumber();
  initChapterObserver();
})();
