# Chrome Extension Permissions Justification

**Version:** 0.2.1  
**Date:** 2026-09-04
**Purpose:** Document and justify all extension permissions for Chrome Web Store review

**Release status:** Local manifest version 0.2.1. Store publication, listing ID, and published version are unverified. Public extension sync remains held back; this document does not establish installation availability.

---

## Declared Permissions

### `storage`
**Justification:** Store captured jobs, match scores, and popup state locally so users can use the extension immediately and keep local history even before signing in.

**Data stored:**
- Job metadata (title, company, URL)
- Captured job description text and a separate first-200-character preview
- Match scores
- User preferences (onboarding state)

**Privacy:** Local storage powers immediate popup use. Signed-in captures can also sync with the RIYP web app. Signing in does not upload existing browser-only captures automatically; capture a role again while signed in to sync it. The popup distinguishes browser-only captures from the account's recent synced cache. Failed refreshes retain saved copies; confirmed sign-out hides account-bound cache entries.

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

### `https://www.recruiterinyourpocket.com/*`
**Justification:** Communicate with the RIYP web app for:
- Authentication state sync (check if user is logged in)
- Quick match scoring (send JD, receive score)
- Saved-job sync for signed-in users
- Deep linking to full analysis

The extension requests the canonical `www` host directly so authentication and host permissions do not depend on the apex-domain redirect.

**Privacy:** Job description text and saved-job metadata are only sent for extension workflows the user triggers or enables. Full resume text stays on the web app. The popup can receive the matching-profile summary (filename, short preview, skill count, and embedding availability); it does not persist that summary in extension storage.

---

### Development server origin
**Justification:** Development builds add the origin configured by `VITE_WEBAPP_URL`, defaulting to `http://localhost:3000/*`, for local testing.

**Build rule:** `vite build --mode development` adds that development origin. The normal `npm run build` uses the production API host and emits a manifest without localhost or other development-origin permissions. The source release manifest also omits localhost.

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
3. **Minimal transmission:** JD text, saved-job metadata, and matching-profile summaries are used for extension workflows; full resume text stays on the web app
4. **No tracking:** No analytics in content scripts; no browsing behavior recorded
5. **Clear deletion:** Users can delete local or synced saved jobs from the popup and web app

---

*Last updated: 2026-09-04*
