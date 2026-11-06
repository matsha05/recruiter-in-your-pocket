# Rewrites: Workspace and report shell

Where: `/workspace`, `/reports/[id]`, `/sample-report` (the report surface), the command palette and the mobile menu. November 6, 2026. Verified on a local production build with the Playwright specs listed in `README.md`.

| File | Before | After | Why |
| --- | --- | --- | --- |
| `web/components/workspace/AnalysisScanning.tsx` | Starting the read again | Starting over | coined_word ("the read") |
| `web/components/workspace/report/ReportEnding.tsx` | Send it. Then read it against the posting you're going for. | This is killer! Send it. / Every line says what you did and what changed, so your resume won't be the reason you don't get the call. Read it against the posting you're going for, and look at whether anyone can bring you in. | Matt's answer 5: big praise with its reason, and the resume as one variable. Only on a worklist report with nothing to fix; v2 reports keep the old line, since they can be clear with one question open |
| `web/components/workspace/report/ReportEnding.tsx` | What would they think of yours? | That’s Jordan’s. Yours is next. | question_heading (a pitch the reader can't answer) |
| `web/lib/reports/worklist-presentation.ts` | This version didn't clear any of them. Start with the first again. | None of them came off the list this time. Let's start with the first one again. | coaching: walk the next step together ("let's") |
| `web/lib/reports/worklist-presentation.ts` | Up 6 since last time. | Up 6 since last time. That's the right direction! | a real win gets one exclamation point; Matt's answer 11, without the promise of more responses. A drop stays plain: Down 6 since last time. |
| `web/components/workspace/report/worklist/WorklistCard.tsx` | Left blank for now. A recruiter will have the same question, and they won't call to ask it. | Left blank, and that's fine. Not every line needs every detail. Let's make sure the rest of your resume gives a recruiter something to grab onto. | Matt's answer 10: reassurance, then the way out, together |
| `web/components/workspace/hooks/useResumeReview.ts` | Report saved to your history | Saved to My reports. | two_names ("your history" for My reports) |
| `web/components/workspace/hooks/useResumeReview.ts` | This report wasn’t saved to your history. Keep this tab open and try again. | We couldn’t save this report to My reports. Keep this tab open and try again. | two_names, passive |
| `web/components/workspace/WorkspaceResumePicker.tsx` | Upload resume file from commands | Upload a resume file | internal_term (the screen-reader label named the command palette) |
| `web/components/workspace/PaywallModal.tsx` | Want another read? | Five more reads. | question_heading |
| `web/components/CommandPalette.tsx` | Upload Resume | Upload a resume | title_case |
| `web/components/CommandPalette.tsx` | Go to Home | Go home | title_case |
| `web/components/CommandPalette.tsx` | Go to Workspace | Go to workspace | title_case |
| `web/components/CommandPalette.tsx` | Go to Research | Go to research | title_case |
| `web/components/CommandPalette.tsx` | Keyboard Shortcuts | Keyboard shortcuts | title_case |
| `web/components/layout/MobileNav.tsx` | Navigate the studio, reports, settings, and account actions. | Open your reports, settings and account. | coined_word ("the studio", a retired name) |
