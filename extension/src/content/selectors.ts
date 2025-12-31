/**
 * LinkedIn DOM Selectors
 * 
 * LinkedIn frequently changes their DOM structure, so we use a fallback chain
 * of selectors. Keep this updated as LinkedIn's markup evolves.
 * 
 * Last updated: December 2024
 */

export const JD_SELECTORS = [
    // Primary: Modern job view page
    '.jobs-description__content .jobs-box__html-content',
    '.jobs-description-content__text',
    '.jobs-box__html-content',

    // Secondary: Search results sidebar
    '.jobs-search__job-details .jobs-box__html-content',
    '.jobs-details__main-content .jobs-box__html-content',

    // Tertiary: Older layouts
    '.job-view-layout .jobs-description',
    '.jobs-unified-top-card + section .jobs-box__html-content',

    // Fallback: Any job description container
    '[data-job-id] .jobs-description',
    '.description__text--rich',
];

export const JOB_TITLE_SELECTORS = [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '.t-24.t-bold.inline',
    '.topcard__title',
    'h1.top-card-layout__title',
];

export const COMPANY_SELECTORS = [
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '.topcard__flavor--black-link',
    'a.topcard__org-name-link',
];

export const LOCATION_SELECTORS = [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
    'span.topcard__flavor--bullet',
];

/**
 * Try multiple selectors and return the first match
 */
export function queryWithFallback(selectors: string[]): Element | null {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }
    return null;
}

/**
 * Extract text content from an element, cleaning up whitespace
 */
export function extractText(element: Element | null): string {
    if (!element) return '';
    return element.textContent?.trim().replace(/\s+/g, ' ') ?? '';
}

/**
 * Extract the job ID from the current URL
 */
export function extractJobId(): string | null {
    const urlMatch = window.location.pathname.match(/\/jobs\/view\/(\d+)/);
    if (urlMatch) return urlMatch[1];

    // Try search page with selected job
    const params = new URLSearchParams(window.location.search);
    return params.get('currentJobId') || null;
}
