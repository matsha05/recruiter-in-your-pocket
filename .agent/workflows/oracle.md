---
description: 
---

# Oracle Workflow for RIYP

Oracle bundles prompts + files to query GPT-5.2 Pro. This doc codifies how agents should invoke Oracle for maximum effectiveness.

## CRITICAL: Terminal Session Management

**Each Oracle browser query MUST run in its own terminal session.**

- DO NOT conflate Oracle queries with existing Oracle sessions
- DO NOT check command_status on a different session ID
- Oracle browser sessions run independently and take 5-30+ minutes
- If an existing Oracle session is running, create a NEW one for your query
- Monitor YOUR session ID, not a random previous session

```bash
# Check existing Oracle sessions
ls -lt ~/.oracle/sessions/ | head -5

# Each new query creates a new session in ~/.oracle/sessions/
```

## Critical Rule: Always Include File Context

**Oracle does NOT have access to your repo by default.** You MUST use `--file` to include relevant source files:

```bash
# WRONG - Oracle has no context
oracle -e browser -p "Review skill-engine.ts"

# CORRECT - Oracle sees the actual code
oracle -e browser --browser-manual-login \
  -p "Review this skill matching engine for accuracy" \
  --file "web/lib/matching/skill-engine.ts"
```

## Product Context (Include in Every Prompt)

When querying Oracle about RIYP, always include this context:

```
## PRODUCT CONTEXT
Recruiter in Your Pocket (RIYP) is an acquisition-grade career platform.

CORE PROMISE: "See what they see" - Show job seekers exactly how recruiters perceive their resume/LinkedIn.

THREE PILLARS:
1. Resume Review - AI analysis simulating 7.4-second recruiter scan
2. LinkedIn Review - Profile optimization for recruiter search visibility  
3. Match Intelligence - Job-resume skill matching with "Recruiter Fit Score"

WEDGE: The "Recruiter First Impression" - Score + Verdict + Critical Miss.
We simulate what a real recruiter sees in their first 7.4 seconds.

QUALITY STANDARDS:
- "Absolute Verifiability" - No hallucinated statistics, all claims must be grounded
- "Acquisition-Grade" - Every UI element should feel like Stripe/Linear/Notion
- Fair and accurate scoring - A 50% match should mean 50% qualified, not inflated

BUSINESS MODEL: One-time purchase ($9 single, $29 5-pack), not subscription.
```

## Prompt Structure

Oracle prompts should be **highly detailed and self-contained**. Follow this structure:

```
## CONTEXT
[Describe the system/component being analyzed]

## CURRENT STATE
[Describe what exists now - architecture, data flow, known issues]

## OBSERVED PROBLEM
[Specific symptoms, error messages, unexpected behavior]

## GOAL
[What you want Oracle to help with - be specific]

## QUESTIONS (numbered)
1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

## CONSTRAINTS
[Performance requirements, compatibility needs, things that cannot change]
```

## Example: Skill Engine Accuracy Review

```bash
oracle -e browser --browser-manual-login \
  --file "web/lib/matching/skill-engine.ts" \
  -p "## CONTEXT
A job-resume skill matching engine for a career platform.

## CURRENT STATE
- 600+ regex patterns extract skills from text
- quickMatch() compares resume skills to JD skills
- Score = matchedWeight / totalWeight * 100
- Added synonym layer (SKILL_EQUIVALENTS) for semantic matching

## OBSERVED PROBLEM
Score improved 34% → 79% with synonyms, but still missing matches.
Resume has 'client relationships' + '\$2M sales' but doesn't match 'Account Management'.

## GOAL
Make scoring FAIR and ACCURATE, not inflated. A 50% score should mean 50% qualified.

## QUESTIONS
1. Is 65% keyword + 35% semantic the right weighting?
2. Should we use LLM extraction instead of regex?
3. How to weight 'required' vs 'preferred' qualifications?
4. What's the right approach for skill importance weighting?

## CONSTRAINTS
- Must maintain <50ms execution time
- No external API calls during matching
- Works across domains: Engineering, HR, Sales, Ops"
```

## File Glob Patterns

```bash
# Single file
--file "web/lib/matching/skill-engine.ts"

# Multiple specific files
--file "web/lib/matching/*.ts"

# Include test files
--file "web/lib/matching/**/*.ts"

# Exclude patterns with !
--file "web/**/*.ts,!web/.next/**"
```

## When to Use Oracle

| Scenario | Oracle Command |
|----------|----------------|
| Bug after 2-3 failed attempts | Include failing code + test output |
| Architecture decision | Include all related files |
| Code review before shipping | Include full component |
| Research/benchmarking | Use detailed prompt with specific questions |

## Browser Mode Troubleshooting

```bash
# Cookie sync failing
oracle -e browser --browser-manual-login -p "..."

# Explicit cookie path
oracle -e browser --browser-cookie-path ~/.config/google-chrome/Default/Cookies -p "..."

# Keep browser open for debugging
oracle -e browser --browser-keep-browser -p "..."
```

## Capturing Output

```bash
# Write response to file
oracle -e browser --write-output /tmp/oracle-response.md -p "..."

# Copy to clipboard
oracle --copy -p "..."
```
