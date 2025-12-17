# Archived: Case Files Feature

This directory contains deprecated code from the "Case Files" experiment.
It has been archived but preserved for potential future use.

## What's Here

- **components/** - React components for Case Files UI
  - `NegotiationCase.tsx` - Main negotiation flow container
  - `NegotiationIntake.tsx` - Offer input form  
  - `NegotiationStrategy.tsx` - AI-generated strategy display
  - `InterviewCase.tsx` - Interview prep container
  - `InterviewCoach.tsx` - AI interview coaching
  - `StoryBank.tsx` - STAR story management
  - `CaseView.tsx` - Stage-based case router

- **types/** - TypeScript type definitions
  - `case.ts` - Case, Artifact, and Stage types

- **prompts/** - LLM prompts for case modes
  - `case_negotiation_v1.txt`
  - `case_interview_v1.txt`
  - `case_resume_v1.txt`

- **routes/** - Next.js routes
  - `dashboard/` - Dashboard pages
  - `cases/` - Cases API endpoints

## Why Archived

The "Case Files" concept was a multi-stage job search companion (Resume → Interview → Negotiation).
It was deprecated in favor of the focused Workspace flow (resume audit only).

## To Restore

If you want to revive this feature:
1. Move components back to `components/dashboard/`
2. Move types back to `lib/types/`
3. Move prompts back to `prompts/`
4. Move routes back to `app/`
5. Wire up entry points in the Workspace UI

---

_Archived: December 2024_
