# Rewrites: the second pass, November 6, 2026

Matt approved a second pass ("Yes, send it", relayed by the top session): the rest of the voice judge's flagged strings once the first-seen routes and the gate landed. Order: the public pages that still said "The Verdict", the v2 report labels, the LinkedIn report, the workspace, shared and extension strings, then only the server messages a reader can see. The exclusions in `README.md` still hold.

Also left alone in this pass, on purpose:

- **The compare pages' "Is Jobscan worth it?" headings.** They are the questions people search for, and the pages answer them.
- **Messages a reader never sees.** The LinkedIn stream's `HTTP error`, `No response body` and `Stream ended without completion` only reach the console; Stripe-webhook, support-forwarding and analytics messages go to operators; the extension matches `Not authenticated` in code, so it stays.
- **"Our bad." on every message.** The judge proposed it on most of the rewritten errors; it opens the error pages only, as before.
- **Inventory noise.** Redis scripts, CSS selectors, generated ids and column lists were being counted as copy; the inventory now drops them (2,992 strings to 2,962), and the copy lint's known baseline fell from 148 to 123.

## Public pages: research, compare and the report receipts

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/app/(editorial)/research/who-you-are/page.tsx` | t who you are, the resume isn / t make clear what you | t who you are, the resume isn / t make clear what you | retired_name (Verdict), coined_word ("the cards") |
| `web/components/compare/comparisons.tsx` | . The Verdict is that line, read from your resume. If it isn’t who you are, that’s what to fix first. | . Your report opens with that line, written from your resume. If it isn’t who you are, that’s what to fix first. | retired_name (Verdict) |
| `web/components/compare/comparisons.tsx` | reads the whole resume the way a recruiter would and cards every line that needs work | reads the whole resume the way a recruiter would and lists every line that needs work | coined_word ("cards" as a verb) |
| `web/components/compare/comparisons.tsx` | Run the free report on your base resume and work through the cards, then | Run the free report on your base resume and work through the lines it lists, then | coined_word ("the cards") |
| `web/components/compare/comparisons.tsx` | You care more about what the page says than how it looks. The report quotes the lines a recruiter would question and starts with the one most likely to cost you the interview. | You care more about what your resume says than how it looks. The report quotes the lines a recruiter would question, in the order they’d read them. | coined_word ("the page"); the interview-cost claim belonged to the retired unit |
| `web/components/compare/ComparisonPage.tsx` | What would a recruiter question on yours? | See what a recruiter would question on yours. | question_heading (a pitch) |
| `web/components/research/AnswerArticle.tsx` | What would they think of yours? | Now see what they’d make of yours. | question_heading (a pitch) |
| `web/components/workspace/report/ResearchReceipts.tsx` | Why the first read of you sticks | Why a recruiter’s first impression sticks | coined_word ("the first read") |

## Reports saved before November 6 (the v2 shape), on the page and in the PDF

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/lib/reports/report-presentation.ts` | More than three Critical Misses. Here are the three that matter most. | More than three problems. Here are the three that matter most. | retired_name; the count stays honest (Matt, Nov 2) |
| `web/lib/reports/report-presentation.ts` | One Critical Miss. Fix it first. | One problem to fix first. | retired_name |
| `web/lib/reports/report-presentation.ts` | Two Critical Misses. Start with this one. | Two problems. Start with this one. | retired_name |
| `web/lib/reports/report-presentation.ts` | Three Critical Misses. Start with this one. | Three problems. Start with this one. | retired_name |
| `web/lib/reports/report-presentation.ts` | Fix ${index + 1} / Critical Miss ${index + 1} / Critical Miss | Fix ${index + 1} / Problem ${index + 1} / Fix this first | retired_name (the card label: "Critical Miss", "Critical Miss 2") |
| `web/components/workspace/report/ReadComparison.tsx` | Same Critical Miss as last time. / Same Critical Misses as last time. / Your revision didn't change the Critical Miss. Start there again. / Your revision didn't change them. Start with the first one again. | Same problem as last time. / Same problems as last time. / Your revision didn't change it. Let's start there again. / Your revision didn't change them. Let's start with the first one again. | retired_name; coaching |
| `web/components/workspace/report/ReadComparison.tsx` | Your Critical Miss changed. / Your Critical Misses changed. / The report now leads with a new Critical Miss. / The report now leads with new ones. | Your top problem changed. / Your top problems changed. / The report now leads with a new one. / The report now leads with new ones. | retired_name; still "changed", never "fixed" |
| `web/components/workspace/report/ReadComparison.tsx` | One Critical Miss changed. / ${gone.length} Critical Misses changed. / ${remaining.length === 1 ? "One is" : / } still there. Start with ${remaining.length === 1 ? "that one" : "those"} again. | One problem changed. / ${gone.length} problems changed. / ${remaining.length === 1 ? "One is" : / } still there. Let's start with ${remaining.length === 1 ? "that one" : "those"} again. | retired_name; coaching |
| `web/components/workspace/report/ReadComparison.tsx` | ${when} · Critical Miss ${index + 1} | ${when} · Problem ${index + 1} | retired_name |
| `web/components/workspace/report/ReadComparison.tsx` | Up ${delta} since last time. / Down ${Math.abs(delta)} since last time. | Up ${delta} since last time. That's the right direction! / Down ${Math.abs(delta)} since last time. | a real win, the same as the worklist re-check |
| `web/components/workspace/report/ReadComparison.tsx` | The Verdict reads the same. / The Verdict changed too. | The summary line is the same. / The summary line changed too. | retired_name (Verdict) |

## The LinkedIn report

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/components/linkedin/LinkedInReportPanel.tsx` | Fix these first | Start with these | retired name for the fix heading |
| `web/components/linkedin/LinkedInReportPanel.tsx` | The report did not identify specific roles from this profile. | This profile doesn't point to specific roles yet. | stiff |
| `web/components/linkedin/LinkedInReportPanel.tsx` | No fixes were returned for this profile. | There's nothing to fix first on this profile. | internal_term ("returned") |
| `web/components/linkedin/LinkedInReportPanel.tsx` | Use suggested language only when every detail is factually accurate. | Use the suggested wording only if every detail is true. | stiff |
| `web/components/linkedin/LinkedInReportTOC.tsx` | Fix these first | Start with these | the tab is the short form of the heading |
| `web/components/linkedin/LinkedInInputPanel.tsx` | A Job Search Pass is required for another report | Another report needs a Job Search Pass | stiff; now matches the resume workspace |
| `web/components/workspace/LinkedInModeSection.tsx` | Run Another | New report | title_case; the glossary's "New report" |
| `web/components/workspace/LinkedInModeSection.tsx` | Get pass | Get 5 more | vague; the long form is the glossary's "Get 5 more reports · $29" |

## Workspace, account, purchase and sign-in

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/components/workspace/HistorySidebar.tsx` | The report couldn’t be renamed. Try again. | We couldn’t rename the report. Try again. | passive |
| `web/components/workspace/HistorySidebar.tsx` | The label couldn’t be saved. Try again. | We couldn’t save the label. Try again. | passive |
| `web/components/workspace/HistorySidebar.tsx` | Saved reports could not be loaded. Try again. | We couldn’t load My reports. Try again. | two_names, passive |
| `web/components/workspace/HistorySidebar.tsx` | The report couldn’t be deleted. Try again. | We couldn’t delete the report. Try again. | passive |
| `web/components/workspace/HistorySidebar.tsx` | Saved reports | My reports | two_names (the glossary name) |
| `web/components/workspace/HistorySidebar.tsx` | >Saved reports could not load | >We couldn’t load My reports | two_names, passive |
| `web/components/workspace/HistorySidebar.tsx` | Reports could not be compared. Try again. | We couldn’t compare those reports. Try again. | passive |
| `web/components/workspace/ResumeLabel.tsx` | to keep them apart in your history. | to keep them apart in My reports. | two_names |
| `web/components/workspace/report/AskFirst.tsx` | Say what the related work was. It goes on the page as its own line, not into this one. | Say what the related work was. It goes on your resume as its own line, not into this one. | coined_word ("the page") |
| `web/lib/reports/ask-first.ts` | The related work, as you'd put it on the page | The related work, as you'd put it on your resume | coined_word ("the page") |
| `web/components/providers/AuthProvider.tsx` | We couldn't complete sign out. Please try again. | We couldn't sign you out. Try again. | please |
| `web/components/auth/AuthFlow.tsx` | Could not save your name. Try again. | We couldn’t save your name. Try again. | stiff |
| `web/components/purchase/PurchaseConfirmedClient.tsx` | Refreshing access… | Checking for your pass… | internal_term ("access") |
| `web/components/purchase/PurchaseConfirmedClient.tsx` | Verify purchase access | Check for my pass | internal_term; a literal button |
| `web/components/purchase/PurchaseRestoreClient.tsx` | Receipts could not load. | We couldn’t load your receipts. | passive |
| `web/components/workspace/SaveReportPrompt.tsx` | Sign-in could not open. Try again to save this report. | Sign-in didn’t open. Try again to save this report. | stiff |
| `web/components/workspace/PaywallModal.tsx` | Checkout could not start. Try again or restore an existing purchase. | Checkout didn’t start. Try again, or restore a purchase you’ve already made. | stiff |
| `web/lib/reports/client-report-save.ts` | This report couldn’t be saved. Please try again. | We couldn’t save this report. Try again. | please, passive |
| `web/lib/reports/client-report-save.ts` | We couldn’t confirm that this report was saved. Please try again. | We couldn’t confirm that this report was saved. Try again. | please |
| `web/lib/auth/content.ts` | Your saved reports | Sign in to see My reports | two_names (the glossary name) |
| `web/components/landing/mineral/MobileReportCTA.tsx` | Get your report | Get your free report | the glossary button name, for screen readers |

## The Chrome extension

| File | Before | After | Why |
| --- | --- | --- | --- |
| `extension/src/content/indeed.ts` | Extension reloaded - please refresh the page | The extension reloaded. Refresh the page. | please, a dash |
| `extension/src/popup/App.tsx` | The extension could not open. Close it and try again. | The extension didn’t open. Close it and try again. | stiff |
| `extension/src/popup/App.tsx` | Could not load your saved jobs. Try Refresh. | We couldn’t load your saved jobs. Try Refresh. | stiff |
| `extension/src/popup/components/AuthPrompt.tsx` | >Create one free | >Create a free account | says what the link does |

## Server messages a reader sees

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/app/api/account/delete/route.ts` | Admin client not configured | Account deletion isn’t available right now. Try again later, or write to support. | internal_term |
| `web/app/api/account/delete/route.ts` | We could not verify every subscription, so your account was not deleted. Please contact support. | We couldn’t check every subscription, so your account wasn’t deleted. Write to support and we’ll sort it out. | please, passive |
| `web/app/api/billing/restore/route.ts` | Please sign in first. | Sign in first. | please |
| `web/app/api/linkedin-feedback-stream/route.ts` | Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/yourname) | Enter your LinkedIn profile address, like linkedin.com/in/yourname. | please |
| `web/app/api/linkedin-feedback-stream/route.ts` | We couldn't parse your LinkedIn profile. Please make sure you uploaded a valid LinkedIn PDF export. | We couldn't read that LinkedIn PDF. Save a fresh PDF from your profile and upload it again. | please, internal_term ("parse") |
| `web/app/api/reports/[id]/route.ts` | Invalid report ID. | We can’t find that report. Open it from My reports. | internal_term |
| `web/app/api/reports/[id]/route.ts` | Report ownership check failed | We couldn’t confirm this report is yours. Refresh and try again. | internal_term |
| `web/app/api/reports/[id]/route.ts` | Report delete failed | We couldn’t delete this report. Try again. | internal_term |
| `web/app/api/reports/route.ts` | Could not save this report. Check History before trying again. | We couldn’t save this report. Check My reports before you try again. | two_names |
| `web/app/api/reports/route.ts` | Please sign in to verify ownership before saving this report. | Sign in to save this report to your account. | please, internal_term |
| `web/app/api/reports/recovery/route.ts` | Please sign in before saving this recovered report. | Sign in to save this recovered report. | please |
| `web/app/api/passes/route.ts` | Failed to fetch passes | We couldn’t load your passes. Try again. | internal_term |
| `web/app/api/resume-feedback/route.ts` | I couldn't read the response cleanly. Try again. | We couldn't read the report that came back. Try again. | the product never says "I" |
