# RIYP Final Launch Rehearsal

**Last Updated:** March 7, 2026  
**Status:** Required before launch

Run this on a clean browser profile and capture evidence for every step.

## Checklist

1. Anonymous review
   Evidence: Run a review without signing in and confirm no account is silently created.
2. Account creation
   Evidence: Create a new account and confirm the auth callback returns to the product.
3. Report save
   Evidence: Save a report while signed in and confirm it appears in `/reports`.
4. Extension auth
   Evidence: Install the extension and confirm the popup leads to the real web auth path.
5. Extension capture
   Evidence: Save a job from LinkedIn and confirm it remains after popup reopen.
6. Cross-device sync
   Evidence: Open the same account in a second browser profile and confirm saved jobs appear.
7. Purchase flow
   Evidence: Complete a test checkout and confirm unlock, receipts, restore, and portal access.
8. Export flow
   Evidence: Export account data and verify the bundle contains expected user data.
9. Delete account
   Evidence: Delete the same account and confirm reports and saved jobs disappear from product surfaces.

## Required Outputs

- `npm run launch:gate:strict` result
- `/api/ready` snapshot
- `/launch` page screenshot or screen recording
- Notes on any manual intervention required
