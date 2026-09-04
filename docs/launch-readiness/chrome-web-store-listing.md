# Chrome Web Store Listing Source of Truth

This file is the canonical copy and screenshot brief for the Chrome Web Store listing. Keep it aligned with the popup, install page, and extension permissions doc.

**Status checked September 4, 2026:** Draft listing copy. Store publication, listing ID, and published version are unverified; this checkout has no configured store URL. The local manifest is version 0.2.1. Public extension access remains held back. Do not present installation as available until the listing and the exact extension origin have been verified through the separate extension release rehearsal.

## Short description

Save supported LinkedIn and Indeed roles, keep saved jobs close, and open the full report in RIYP when you need it.

## Long description

Recruiter in Your Pocket helps you save supported job postings while you're browsing and carry that context back into the studio.

Save a role using the capture button on a supported LinkedIn or Indeed job page. Use the popup to browse saved roles, remove them, and open the studio when you're ready for a report.

Sign-in is only required if you want new captures synced across devices. Existing browser-only captures stay local until you capture the role again while signed in.

## Privacy-field summary

The extension reads supported LinkedIn and Indeed job pages for user-initiated capture. Browser-only saves retain captured job description text and metadata locally. Capturing while signed in can save the role to your RIYP account; signing in alone does not upload older browser-only captures.

## Screenshot brief

1. Popup with saved jobs
   Show the popup after capture with one dominant next step and visible synced/local state.
2. Popup sign-in state
   Show what sign-in unlocks, why it matters, and that capture remains explicit.
3. Studio handoff
   Show the saved job flowing into the studio for the full report and follow-up work.
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
