(function(){const JD_SELECTORS = [
  // Primary: Modern job view page
  ".jobs-description__content .jobs-box__html-content",
  ".jobs-description-content__text",
  ".jobs-box__html-content",
  // Secondary: Search results sidebar
  ".jobs-search__job-details .jobs-box__html-content",
  ".jobs-details__main-content .jobs-box__html-content",
  // Tertiary: Collections and recommendation pages
  ".jobs-details .jobs-box__html-content",
  ".jobs-details-top-card ~ div .jobs-box__html-content",
  ".scaffold-layout__detail .jobs-box__html-content",
  // Quaternary: Older layouts
  ".job-view-layout .jobs-description",
  ".jobs-unified-top-card + section .jobs-box__html-content",
  // Fallback: Any job description container
  "[data-job-id] .jobs-description",
  ".description__text--rich",
  // Last resort: find "About the job" section content
  "article .jobs-box__html-content"
];
const JOB_TITLE_SELECTORS = [
  ".job-details-jobs-unified-top-card__job-title",
  ".jobs-unified-top-card__job-title",
  ".t-24.t-bold.inline",
  ".topcard__title",
  "h1.top-card-layout__title"
];
const COMPANY_SELECTORS = [
  ".job-details-jobs-unified-top-card__company-name",
  ".jobs-unified-top-card__company-name",
  ".topcard__org-name-link",
  ".topcard__flavor--black-link",
  "a.topcard__org-name-link"
];
const LOCATION_SELECTORS = [
  ".job-details-jobs-unified-top-card__bullet",
  ".jobs-unified-top-card__bullet",
  ".topcard__flavor--bullet",
  "span.topcard__flavor--bullet"
];
function queryWithFallback(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
}
function extractText(element) {
  if (!element) return "";
  return element.textContent?.trim().replace(/\s+/g, " ") ?? "";
}
function extractJobId() {
  const urlMatch = window.location.pathname.match(/\/jobs\/view\/(\d+)/);
  if (urlMatch) return urlMatch[1];
  const params = new URLSearchParams(window.location.search);
  return params.get("currentJobId") || null;
}

async function safeMessage(message) {
  try {
    if (!chrome.runtime?.id) {
      console.warn("[RIYP] Extension context invalidated, please reload the page");
      return { success: false, error: "Extension reloaded - please refresh the page" };
    }
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    if (error?.message?.includes("Extension context invalidated")) {
      console.warn("[RIYP] Extension context invalidated, please reload the page");
      return { success: false, error: "Extension reloaded - please refresh the page" };
    }
    throw error;
  }
}
let captureButton = null;
let isCapturing = false;
let injectionAttempts = 0;
const MAX_INJECTION_ATTEMPTS = 5;
function init() {
  console.log("[RIYP] Content script initialized on:", window.location.href);
  const isCollectionsPage = window.location.pathname.includes("/collections/");
  const initialDelay = isCollectionsPage ? 2500 : 1500;
  injectionAttempts = 0;
  setTimeout(injectCaptureButtonWithRetry, initialDelay);
  observeNavigationChanges();
}
async function injectCaptureButtonWithRetry() {
  await injectCaptureButton();
  if (!captureButton && extractJobId() && injectionAttempts < MAX_INJECTION_ATTEMPTS) {
    injectionAttempts++;
    console.log("[RIYP] JD not found yet, retrying in 1s (attempt", injectionAttempts, ")");
    setTimeout(injectCaptureButtonWithRetry, 1e3);
  }
}
async function injectCaptureButton() {
  if (captureButton) {
    captureButton.remove();
    captureButton = null;
  }
  const jobId = extractJobId();
  if (!jobId) {
    console.log("[RIYP] Not on a job detail page, skipping button injection");
    return;
  }
  const jdElement = queryWithFallback(JD_SELECTORS);
  if (!jdElement) {
    console.log("[RIYP] No JD element found, skipping button injection");
    return;
  }
  let alreadyCaptured = false;
  let capturedScore = null;
  try {
    const response = await safeMessage({
      type: "CHECK_JOB_STATUS",
      payload: { url: window.location.href }
    });
    if (response?.success && response.data?.captured) {
      alreadyCaptured = true;
      capturedScore = response.data.score;
      console.log("[RIYP] Job already captured with score:", capturedScore);
    }
  } catch (error) {
    console.warn("[RIYP] Failed to check job status:", error);
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
  shadow.innerHTML = getCaptureButtonHTML(alreadyCaptured, capturedScore);
  const button = shadow.querySelector(".riyp-capture-btn");
  if (button) {
    if (alreadyCaptured) {
      button.addEventListener("click", () => {
        safeMessage({
          type: "OPEN_WEBAPP",
          payload: { path: "/jobs" }
        });
      });
    } else {
      button.addEventListener("click", handleCapture);
    }
  }
  document.body.appendChild(container);
  captureButton = container;
  console.log("[RIYP] Capture button injected", alreadyCaptured ? "(already captured)" : "");
}
function getCaptureButtonHTML(alreadyCaptured = false, score = null) {
  const isCaptured = alreadyCaptured;
  const hasScore = score !== null && score > 0;
  const buttonText = isCaptured ? hasScore ? `${score}% Match` : "Saved ✓" : "Capture JD";
  const buttonClass = isCaptured ? "riyp-capture-btn captured" : "riyp-capture-btn";
  const buttonTitle = isCaptured ? "View saved jobs" : "Capture JD for RIYP";
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .riyp-capture-btn:hover {
        background: #0F766E;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }
      
      .riyp-capture-btn:active {
        transform: translateY(0);
      }
      
      .riyp-capture-btn.loading {
        opacity: 0.8;
        pointer-events: none;
      }
      
      .riyp-capture-btn.success {
        background: #166534;
      }
      
      .riyp-capture-btn.captured {
        background: #166534;
      }
      
      .riyp-capture-btn.error {
        background: #DC2626;
      }
      
      .riyp-icon {
        width: 18px;
        height: 18px;
      }
      
      .riyp-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
    
    <button class="${buttonClass}" title="${buttonTitle}">
      ${isCaptured ? `
        <svg class="riyp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ` : `
        <svg class="riyp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      `}
      <span class="riyp-text">${buttonText}</span>
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
    if (!jd || !meta.id) {
      throw new Error("Could not extract job data");
    }
    const message = {
      type: "CAPTURE_JD",
      payload: { jd, meta }
    };
    const response = await safeMessage(message);
    if (!response.success) {
      throw new Error(response.error || "Failed to save job");
    }
    button.classList.remove("loading");
    button.classList.add("success");
    const score = response.data?.score;
    textSpan.textContent = score ? `Match: ${score}%` : "✓ Saved";
    setTimeout(() => {
      button.classList.remove("success");
      textSpan.textContent = "Capture JD";
      button.querySelector(".riyp-spinner")?.remove();
      const newIcon = document.createElement("div");
      newIcon.innerHTML = `
        <svg class="riyp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      `;
      button.prepend(newIcon.firstElementChild);
      isCapturing = false;
    }, 3e3);
  } catch (error) {
    console.error("[RIYP] Capture error:", error);
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
function extractJobDescription() {
  const element = queryWithFallback(JD_SELECTORS);
  return extractText(element);
}
function extractJobMeta() {
  return {
    id: extractJobId() || `job-${Date.now()}`,
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
      console.log("[RIYP] URL changed, re-checking for job page");
      setTimeout(injectCaptureButton, 1e3);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  window.addEventListener("popstate", () => {
    setTimeout(injectCaptureButton, 1e3);
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
//# sourceMappingURL=linkedin.ts-HmmqcRtO.js.map
})()
