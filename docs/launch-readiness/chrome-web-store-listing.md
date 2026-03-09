# Chrome Web Store Listing Source of Truth

This file is the canonical copy and screenshot brief for the Chrome Web Store listing. Keep it aligned with the popup, install page, and extension permissions doc.

## Short description

Capture LinkedIn and Indeed roles, keep saved jobs in sync, and open recruiter-grade match context in RIYP.

## Long description

Recruiter in Your Pocket helps you save supported job postings while you're browsing and carry that context back into the studio.

Use the popup to capture a role, check fit, and jump into a deeper recruiter-grade review when you're ready.

Sign-in is only required if you want synced saved jobs across devices. Local capture and browsing support stay explicit and purpose-bound.

## Privacy-field summary

The extension reads supported LinkedIn and Indeed job pages only when needed for user-initiated job capture. Saved-job history can sync to your RIYP account when you sign in.

## Screenshot brief

1. Popup with saved jobs
   Show the popup after capture with one dominant next step and visible synced/local state.
2. Popup sign-in state
   Show what sign-in unlocks, why it matters, and that capture remains explicit.
3. Studio handoff
   Show the saved job flowing into the studio for deeper recruiter-grade review.
4. Install disclosure
   Show the website install surface with supported sites, purpose-bound access, and policy links.
5. Supported job page capture
   Show the supported-page capture workflow in context rather than a decorative hero mockup.

## Generated asset pack

Regenerate the asset pack with:

```bash
npm run assets:chrome-web-store
```

Generated files:

- `/web/public/assets/chrome-web-store/popup-jobs.png`
- `/web/public/assets/chrome-web-store/popup-auth.png`
- `/web/public/assets/chrome-web-store/workspace-return.png`
- `/web/public/assets/chrome-web-store/install-disclosure.png`
- `/web/public/assets/chrome-web-store/capture-context.png`
- `/web/public/assets/chrome-web-store/promo-tile.png`
- `/web/public/assets/chrome-web-store/manifest.json`
