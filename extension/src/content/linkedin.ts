/**
 * LinkedIn Content Script
 * 
 * Injected on LinkedIn job pages to:
 * 1. Detect job descriptions
 * 2. Show a floating "Capture JD" button
 * 3. Extract and send JD data to service worker
 */

import {
  JD_SELECTORS,
  JOB_TITLE_SELECTORS,
  COMPANY_SELECTORS,
  LOCATION_SELECTORS,
  queryWithFallback,
  extractText,
  extractJobId,
} from './selectors';
import type { JobMeta, ExtensionMessage } from '../background/messages';

// Safe wrapper for messaging that handles extension context invalidation
async function safeMessage(message: ExtensionMessage): Promise<any> {
  try {
    if (!chrome.runtime?.id) {
      console.warn('[RIYP] Extension context invalidated, please reload the page');
      return { success: false, error: 'Extension reloaded - please refresh the page' };
    }
    return await chrome.runtime.sendMessage(message);
  } catch (error: any) {
    if (error?.message?.includes('Extension context invalidated')) {
      console.warn('[RIYP] Extension context invalidated, please reload the page');
      return { success: false, error: 'Extension reloaded - please refresh the page' };
    }
    throw error;
  }
}

// State
let captureButton: HTMLElement | null = null;
let isCapturing = false;

/**
 * Initialize content script
 */
function init() {
  console.log('[RIYP] Content script initialized on:', window.location.href);

  // Wait for page to stabilize, then inject button
  setTimeout(injectCaptureButton, 1500);

  // Re-inject on dynamic navigation (LinkedIn is a SPA)
  observeNavigationChanges();
}

/**
 * Inject the floating capture button
 */
async function injectCaptureButton() {
  // Remove existing button if present
  if (captureButton) {
    captureButton.remove();
    captureButton = null;
  }

  // Check if we're on a job page
  const jobId = extractJobId();
  if (!jobId) {
    console.log('[RIYP] Not on a job detail page, skipping button injection');
    return;
  }

  // Check if JD is present
  const jdElement = queryWithFallback(JD_SELECTORS);
  if (!jdElement) {
    console.log('[RIYP] No JD element found, skipping button injection');
    return;
  }

  // Check if this job was already captured
  let alreadyCaptured = false;
  let capturedScore: number | null = null;

  try {
    const response = await safeMessage({
      type: 'CHECK_JOB_STATUS',
      payload: { url: window.location.href }
    });
    if (response?.success && response.data?.captured) {
      alreadyCaptured = true;
      capturedScore = response.data.score;
      console.log('[RIYP] Job already captured with score:', capturedScore);
    }
  } catch (error) {
    console.warn('[RIYP] Failed to check job status:', error);
  }

  // Create button using Shadow DOM for style isolation
  const container = document.createElement('div');
  container.id = 'riyp-capture-container';
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
  `;

  const shadow = container.attachShadow({ mode: 'open' });
  shadow.innerHTML = getCaptureButtonHTML(alreadyCaptured, capturedScore);

  // Attach event listener (only if not already captured, or for "View Match" action)
  const button = shadow.querySelector('.riyp-capture-btn');
  if (button) {
    if (alreadyCaptured) {
      // Already captured - click opens the workspace
      button.addEventListener('click', () => {
        safeMessage({
          type: 'OPEN_WEBAPP',
          payload: { path: '/jobs' }
        });
      });
    } else {
      button.addEventListener('click', handleCapture);
    }
  }

  document.body.appendChild(container);
  captureButton = container;

  console.log('[RIYP] Capture button injected', alreadyCaptured ? '(already captured)' : '');
}

/**
 * Get the capture button HTML (rendered in Shadow DOM)
 */
function getCaptureButtonHTML(alreadyCaptured: boolean = false, score: number | null = null): string {
  // Determine button state and content
  const isCaptured = alreadyCaptured;
  const hasScore = score !== null && score > 0;

  // Button text based on state
  const buttonText = isCaptured
    ? (hasScore ? `${score}% Match` : 'Saved ✓')
    : 'Capture JD';

  // Button class based on state
  const buttonClass = isCaptured ? 'riyp-capture-btn captured' : 'riyp-capture-btn';

  // Title for accessibility
  const buttonTitle = isCaptured
    ? 'View saved jobs'
    : 'Capture JD for RIYP';

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

/**
 * Handle capture button click
 */
async function handleCapture() {
  if (isCapturing) return;

  const button = captureButton?.shadowRoot?.querySelector('.riyp-capture-btn');
  const textSpan = captureButton?.shadowRoot?.querySelector('.riyp-text');
  const iconSvg = captureButton?.shadowRoot?.querySelector('.riyp-icon');

  if (!button || !textSpan) return;

  try {
    isCapturing = true;
    button.classList.add('loading');

    // Show loading state
    if (iconSvg) iconSvg.outerHTML = '<div class="riyp-spinner"></div>';
    textSpan.textContent = 'Capturing...';

    // Extract job data
    const jd = extractJobDescription();
    const meta = extractJobMeta();

    if (!jd || !meta.id) {
      throw new Error('Could not extract job data');
    }

    // Send to service worker
    const message: ExtensionMessage = {
      type: 'CAPTURE_JD',
      payload: { jd, meta },
    };

    const response = await safeMessage(message);

    if (!response.success) {
      throw new Error(response.error || 'Failed to save job');
    }

    // Show success state
    button.classList.remove('loading');
    button.classList.add('success');
    const score = response.data?.score;
    textSpan.textContent = score ? `Match: ${score}%` : '✓ Saved';

    // Reset after delay
    setTimeout(() => {
      button.classList.remove('success');
      textSpan.textContent = 'Capture JD';
      button.querySelector('.riyp-spinner')?.remove();
      const newIcon = document.createElement('div');
      newIcon.innerHTML = `
        <svg class="riyp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      `;
      button.prepend(newIcon.firstElementChild!);
      isCapturing = false;
    }, 3000);

  } catch (error) {
    console.error('[RIYP] Capture error:', error);

    button.classList.remove('loading');
    button.classList.add('error');
    textSpan.textContent = 'Error';

    setTimeout(() => {
      button.classList.remove('error');
      textSpan.textContent = 'Capture JD';
      isCapturing = false;
    }, 2000);
  }
}

/**
 * Extract the full job description text
 */
function extractJobDescription(): string {
  const element = queryWithFallback(JD_SELECTORS);
  return extractText(element);
}

/**
 * Extract job metadata (title, company, etc.)
 */
function extractJobMeta(): JobMeta {
  return {
    id: extractJobId() || `job-${Date.now()}`,
    title: extractText(queryWithFallback(JOB_TITLE_SELECTORS)),
    company: extractText(queryWithFallback(COMPANY_SELECTORS)),
    location: extractText(queryWithFallback(LOCATION_SELECTORS)),
    url: window.location.href,
    capturedAt: Date.now(),
  };
}

/**
 * Watch for SPA navigation and re-inject button
 */
function observeNavigationChanges() {
  // LinkedIn uses history API for navigation
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log('[RIYP] URL changed, re-checking for job page');
      setTimeout(injectCaptureButton, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also listen for popstate
  window.addEventListener('popstate', () => {
    setTimeout(injectCaptureButton, 1000);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
