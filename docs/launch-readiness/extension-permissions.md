# Chrome Extension Permissions Justification

**Version:** 0.2.1  
**Date:** 2026-03-09
**Purpose:** Document and justify all extension permissions for Chrome Web Store review

---

## Declared Permissions

### `storage`
**Justification:** Store captured jobs, match scores, and popup state locally so users can use the extension immediately and keep local history even before signing in.

**Data stored:**
- Job metadata (title, company, URL)
- Job description text (first 200 chars preview)
- Match scores
- User preferences (onboarding state)

**Privacy:** Local storage powers immediate popup use. If the user signs in, saved-job workflows can also sync with the RIYP web app so history is attached to the right account.

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
- Saved-job sync for signed-in users
- Deep linking to full analysis

**Privacy:** Job description text and saved-job metadata are only sent for extension workflows the user triggers or enables. Resume data stays on the web app.

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
2. **Local-first behavior:** The popup works with local capture first; sign-in is only needed for synced saved-job history
3. **Minimal transmission:** JD text and saved-job metadata are used for extension workflows; resume data stays on the web app
4. **No tracking:** No analytics in content scripts; no browsing behavior recorded
5. **Clear deletion:** Users can delete local or synced saved jobs from the popup and web app

---

*Last updated: 2026-03-09*
