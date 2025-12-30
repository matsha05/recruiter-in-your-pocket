# Source Quality Standards (Research Library)

**Repo:** `/Users/matsha05/Desktop/dev/recruiter-in-your-pocket`
**Scope:** All `/web/app/research/*` pages and any future research additions.

This library exists to establish credibility. We use sources that strengthen trust.
If a claim cannot be backed by a Tier‑1 source, we may use a **Tier‑2 source** that is still direct,
credible, and methodologically sound. If neither exists, we **remove the claim** or **hold the page**.

---

## Tier‑1 Preferred (Use When Available)

Acceptable sources:
- **Peer‑reviewed journals** (DOI links preferred)
- **Government or academic institution reports** (PDFs or direct report pages)
- **Official platform data** (e.g., LinkedIn Newsroom stats or official PDFs)
- **Primary research from recognized research orgs** (e.g., Nielsen Norman Group, TheLadders eye‑tracking study, Upturn)

## Tier‑2 Allowed (When Tier‑1 Is Unavailable)

Acceptable Tier‑2 sources:
- **Official industry reports** with clear methodology (e.g., LinkedIn, SHRM, Indeed)
- **Reputable research orgs** (e.g., Nielsen Norman Group)
- **Top-tier consultancies** with published methods and primary data

Tier‑2 is **not** a license for weak stats. It still must be direct, accessible, and defensible.

Not acceptable:
- Marketing blogs
- Vendor “statistics” pages without primary citations
- Aggregators or rewritten summaries
- Broad landing pages that don’t contain the specific stat

---

## Link Quality Rules (Mandatory)

Each citation must:
- Link to the **exact evidence** (PDF, DOI, or the specific section)
- Avoid generic landing pages or navigation hubs
- Be accessible without login or paywalls (or include an open mirror)

---

## Content Gate

Before publishing:
- If a Tier‑1 source **does not exist**, a Tier‑2 source is acceptable **only if** it is direct and methodologically clear.
- If no Tier‑1 or Tier‑2 source exists, the claim is removed or the page is held until sourcing is complete.
- No “best guesses,” no paraphrased marketing stats.

---

## Checklist (Required in PRs)

- [ ] Every stat is tied to a Tier‑1 or Tier‑2 source
- [ ] Each link goes directly to the evidence
- [ ] No Tier‑2/3 sources remain
- [ ] Language matches the evidence (no inflation)
