# Chrome Extension Permissions Justification

**Version:** 0.2.1  
**Date:** 2025-12-31  
**Purpose:** Document and justify all extension permissions for Chrome Web Store review

---

## Declared Permissions

### `storage`
**Justification:** Store captured job descriptions and match scores locally so users can access their job history across browser sessions without requiring an account.

**Data stored:**
- Job metadata (title, company, URL)
- Job description text (first 200 chars preview)
- Match scores
- User preferences (onboarding state)

**Privacy:** All data is local to the user's browser. No data is synced or transmitted without explicit user action.

---

### `activeTab`
**Justification:** Read the current tab's URL to detect when the user is on a supported job page (LinkedIn or Indeed) and enable the capture button.

**Usage:**
- Detect LinkedIn/Indeed job pages
- Extract job ID from URL for deduplication
- No data is sent externally without user action

---

## Host Permissions

### `https://www.linkedin.com/*`
**Justification:** Inject content script to enable job description capture on LinkedIn job pages.

**Actions:**
- Display floating "Capture JD" button
- Read job title, company, and description text when user clicks capture
- No background scraping or automatic data collection

---

### `https://www.indeed.com/*` and `https://*.indeed.com/*`
**Justification:** Inject content script to enable job description capture on Indeed job pages.

**Actions:**
- Display floating "Capture JD" button
- Read job title, company, and description text when user clicks capture
- No background scraping or automatic data collection

---

### `https://recruiterinyourpocket.com/*`
**Justification:** Communicate with the RIYP web app for:
- Authentication state sync (check if user is logged in)
- Quick match scoring (send JD, receive score)
- Deep linking to full analysis

**Privacy:** Only the job description text is sent for scoring. Resume data stays on the web app.

---

### `http://localhost:3000/*`
**Justification:** Development only. Allows local testing against development server.

**Note:** This permission is only used in development builds and does not affect production users.

---

## What We Don't Request

| Permission | Why Not |
|------------|---------|
| `tabs` | Not needed; `activeTab` is sufficient |
| `history` | Never access browsing history |
| `bookmarks` | No bookmark functionality |
| `cookies` | Auth handled by host app, not extension |
| `webRequest` | No network interception needed |
| `<all_urls>` | Only specific job sites needed |

---

## Privacy Summary

1. **User-initiated only:** Data capture requires explicit button click
2. **Local storage:** Job data stored in browser, not synced automatically
3. **Minimal transmission:** Only JD text sent for scoring; resume stays on web app
4. **No tracking:** No analytics in content scripts; no browsing behavior recorded
5. **Clear deletion:** Users can delete all data via extension popup

---

*Last updated: 2025-12-31*
