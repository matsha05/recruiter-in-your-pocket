const JD_SELECTORS = [
  "#jobDescriptionText",
  ".jobsearch-jobDescriptionText",
  '[data-testid="jobDescriptionText"]',
  ".job-description"
];
const JOB_TITLE_SELECTORS = [
  ".jobsearch-JobInfoHeader-title",
  '[data-testid="jobTitle"]',
  "h1.jobTitle",
  ".icl-u-xs-mb--xs"
];
const COMPANY_SELECTORS = [
  '[data-testid="inlineHeader-companyName"]',
  ".jobsearch-InlineCompanyRating-companyHeader",
  ".icl-u-lg-mr--sm",
  'a[data-tn-element="companyName"]'
];
const LOCATION_SELECTORS = [
  '[data-testid="inlineHeader-companyLocation"]',
  ".jobsearch-JobInfoHeader-subtitle > div:nth-child(2)",
  ".icl-u-xs-mt--xs .icl-Icon"
];
let captureButton = null;
let isCapturing = false;
function init() {
  console.log("[RIYP Indeed] Content script initialized on:", window.location.href);
  setTimeout(injectCaptureButton, 1500);
  observeNavigationChanges();
}
function injectCaptureButton() {
  if (captureButton) {
    captureButton.remove();
    captureButton = null;
  }
  const jdElement = queryWithFallback(JD_SELECTORS);
  if (!jdElement) {
    console.log("[RIYP Indeed] No JD element found, skipping button injection");
    return;
  }
  const container = document.createElement("div");
  container.id = "riyp-capture-container";
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
  `;
  const shadow = container.attachShadow({ mode: "open" });
  shadow.innerHTML = getCaptureButtonHTML();
  const button = shadow.querySelector(".riyp-capture-btn");
  if (button) {
    button.addEventListener("click", handleCapture);
  }
  document.body.appendChild(container);
  captureButton = container;
  console.log("[RIYP Indeed] Capture button injected");
}
function getCaptureButtonHTML() {
  return `
    <style>
      .riyp-capture-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #0D9488;
        color: white;
        border: none;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .riyp-capture-btn:hover {
        background: #0F766E;
        transform: translateY(-2px);
      }
      .riyp-capture-btn.loading { opacity: 0.8; pointer-events: none; }
      .riyp-capture-btn.success { background: #166534; }
      .riyp-capture-btn.error { background: #DC2626; }
      .riyp-icon { width: 18px; height: 18px; }
      .riyp-spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
    <button class="riyp-capture-btn" title="Capture JD for RIYP">
      <svg class="riyp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <span class="riyp-text">Capture JD</span>
    </button>
  `;
}
async function handleCapture() {
  if (isCapturing) return;
  const button = captureButton?.shadowRoot?.querySelector(".riyp-capture-btn");
  const textSpan = captureButton?.shadowRoot?.querySelector(".riyp-text");
  const iconSvg = captureButton?.shadowRoot?.querySelector(".riyp-icon");
  if (!button || !textSpan) return;
  try {
    isCapturing = true;
    button.classList.add("loading");
    if (iconSvg) iconSvg.outerHTML = '<div class="riyp-spinner"></div>';
    textSpan.textContent = "Capturing...";
    const jd = extractJobDescription();
    const meta = extractJobMeta();
    if (!jd) {
      throw new Error("Could not extract job data");
    }
    const message = {
      type: "CAPTURE_JD",
      payload: { jd, meta }
    };
    const response = await chrome.runtime.sendMessage(message);
    if (!response.success) {
      throw new Error(response.error || "Failed to save job");
    }
    button.classList.remove("loading");
    button.classList.add("success");
    textSpan.textContent = response.data.score ? `Matched: ${response.data.score}%` : "Saved!";
    setTimeout(() => {
      button.classList.remove("success");
      textSpan.textContent = "Capture JD";
      resetButtonIcon(button);
      isCapturing = false;
    }, 3e3);
  } catch (error) {
    console.error("[RIYP Indeed] Capture error:", error);
    button.classList.remove("loading");
    button.classList.add("error");
    textSpan.textContent = "Error";
    setTimeout(() => {
      button.classList.remove("error");
      textSpan.textContent = "Capture JD";
      isCapturing = false;
    }, 2e3);
  }
}
function resetButtonIcon(button) {
  const spinner = button.querySelector(".riyp-spinner");
  if (spinner) {
    spinner.outerHTML = `
      <svg class="riyp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    `;
  }
}
function queryWithFallback(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}
function extractText(element) {
  if (!element) return "";
  return element.textContent?.trim().replace(/\s+/g, " ") ?? "";
}
function extractJobDescription() {
  const element = queryWithFallback(JD_SELECTORS);
  return extractText(element);
}
function extractJobMeta() {
  const urlMatch = window.location.search.match(/jk=([a-f0-9]+)/);
  const jobId = urlMatch ? urlMatch[1] : `indeed-${Date.now()}`;
  return {
    id: jobId,
    title: extractText(queryWithFallback(JOB_TITLE_SELECTORS)),
    company: extractText(queryWithFallback(COMPANY_SELECTORS)),
    location: extractText(queryWithFallback(LOCATION_SELECTORS)),
    url: window.location.href,
    capturedAt: Date.now()
  };
}
function observeNavigationChanges() {
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log("[RIYP Indeed] URL changed, re-checking for job page");
      setTimeout(injectCaptureButton, 1e3);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", () => setTimeout(injectCaptureButton, 1e3));
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
//# sourceMappingURL=content-script-indeed.js.map
