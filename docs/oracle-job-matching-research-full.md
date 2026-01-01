Launching browser mode (gpt-5.1-pro) with ~30,448 tokens.
[2mThis run can take up to an hour (usually ~10 minutes).[22m
[1mAnswer:[22m
You’re seeing a classic failure mode of “similarity-first” matching: if you don’t **gate on role family and must-have qualifications**, then generic language (teamwork, leadership, communication) becomes enough to produce a high score for totally unrelated jobs.

Below is (1) what the best systems publicly say they do, (2) why your current architecture inflates scores (including what I see in your code), and (3) a concrete, bootstrapped-friendly plan to fix it without expensive per-match LLM calls.

---

## 1) How big systems match jobs and candidates at scale

### The common pattern: retrieval → hard filtering → ranking

Even when they use advanced ML, large platforms generally do three things:

1. **Understand / structure both sides** (normalize titles, skills, requirements, preferences).
   Indeed explicitly describes this as step 1, including extracting **skills, certifications, licenses, degrees, preferences**, and also leveraging an internal “understanding of the work itself” across many occupations and attributes. ([Indeed][1])

2. **Remove clear non-matches with hard constraints** (licenses, location, remote-only, etc).
   Indeed explicitly calls out filtering out non-matches like “requires a specific license they don’t have.” ([Indeed][1])

3. **Rank what remains** using many signals and feedback loops (clicks, applies, hires).
   LinkedIn describes training a two-tower embedding model using impression and engagement data with negative sampling. ([LinkedIn][2])
   Indeed describes learning from outcomes (applications, interview progress, hires) to refine matching. ([Indeed][1])

If you take only one lesson from the industry: **the score is not purely “text similarity.”** It is “fit after constraints.”

---

## 2) What LinkedIn, Indeed, ZipRecruiter, and enterprise ATS do (publicly)

### LinkedIn (public engineering detail)

LinkedIn’s public engineering blog is unusually specific about skills extraction and matching infrastructure:

* They extract and normalize skills into a canonical taxonomy (“data analytics” vs “data analysis”), and treat **where** a skill appears (qualifications vs company description) as a relevance signal. ([LinkedIn][3])
* They use a **fast token-based tagger** (trie-based lookup over skill names) plus a **semantic two-tower model** (LLM encoder based) to catch contextual/indirect matches. ([LinkedIn][3])
* They do **skill expansion** using graph relationships (parent, child, sibling) after initial extraction. ([LinkedIn][3])
* For job recommendation matching, they describe a two-tower model trained on engagement. ([LinkedIn][2])

This maps closely to what you’re attempting (regex + ontology + embeddings), but there’s a missing piece in your system: **hard gating and discriminativeness weighting** (more on that below).

### Indeed (public product description)

Indeed describes:

* A deep understanding step across qualifications and preferences, including licenses and degrees. ([Indeed][1])
* “Finding the right fit” includes removing non-matches first (license, remote preference mismatch), then retrieval and ranking based on behavioral signals. ([Indeed][1])
* Continuous learning from outcomes like applications and hires. ([Indeed][1])

### ZipRecruiter (public product description)

ZipRecruiter publicly frames match strength as discrete bands (Great, Good, Fair, Not a Match) and says it is trained on marketplace interaction data. ([ZipRecruiter][4])
This is important for you as a consumer product: **bands are easier to keep honest than a single “87%” that users interpret as calibrated truth.**

### Enterprise ATS systems (public documentation)

Enterprise ATS matching is often:

* **criteria-based filtering** (required vs desired), not just semantic similarity. Oracle Taleo documentation describes matching candidates to requisitions via selected criteria and explicitly supports “required” vs “desired.” ([Oracle Docs][5])
* “Match jobs using resume” features commonly lean on **skills and titles**. Oracle’s documentation explicitly states job recommendations are based on the **skills and titles specified in the resume**. ([Oracle Docs][6])
* Skills platforms emphasize ontology and relationships. Workday describes Skills Cloud as a “universal skills ontology” leveraging ML and graph technology to map related skills. ([Workday Blog][7])

The consistent theme: enterprise systems avoid catastrophic false positives by relying heavily on **structured constraints** and **job-family alignment**, even when they also use ML.

---

## 3) Why your current system produces absurd false positives

### Root cause A: You don’t cover the JD’s domain, so only generic skills remain

In your `skill-engine.ts`, there are extensive soft-skill patterns and inference rules, but there is **no construction/trades vocabulary** (I searched for “drywall”, “OSHA”, “blueprint”, “framing” and found nothing). That means a Drywall Framer JD will yield a “skill set” dominated by generic soft skills.

Once the JD’s extracted skills are mostly “Teamwork”, “Leadership”, “Communication”, your system will match almost any white-collar resume and can reach 100.

This is not a bug in scoring math. It’s a **coverage detection problem**.

### Root cause B: Soft skills are being treated as primary evidence

You currently:

* Extract a large set of soft skills via explicit patterns, and also
* Infer soft skills from generic evidence (“managed a team” → Teamwork, Leadership, etc).

Soft skills are not useless, but they are almost never the deciding factor for “qualified vs not qualified.” Recruiters use them as tie-breakers after role alignment.

### Root cause C: Your claim scoring treats many requirements as equal-weight items

In `claim-extractor.ts`, every requirement counts equally in the final claim score (met = 1, partial = 0.5). Missing a license should not be “one item out of ten.” Indeed explicitly frames licenses as a clear non-match filter. ([Indeed][1])

### Root cause D: No “role-family gate” before scoring

Big systems effectively do: “Are you in the right neighborhood?” before computing the nuanced score. You currently allow scoring to proceed even when the job is a different occupation family.

---

## 4) The industry-grade fix that works with your constraints

You can keep your hybrid architecture, but you need to redesign it into a **gated scoring pipeline**:

### The new mental model

**Fit Score = Role Alignment × Must-Have Coverage × (Nice-to-Have + Similarity bonuses)**

That multiplication (or strong caps) is the key. It forces unrelated roles to stay near zero.

---

## 5) Concrete, implementable recommendations

### Recommendation 1: Add a Role Family Gate (fast, explainable, no training data required)

#### What to do

Assign both the resume and JD to a **standard occupation / job family** (and a confidence score). Then gate the match score by job-family compatibility.

You can do this without proprietary data by using open occupational taxonomies:

* **O*NET** provides a large occupation taxonomy with rich descriptors and encourages developers to incorporate the database. ([O*NET Resource Center][8])
* **ESCO** is explicitly designed to support competence-based job matching and provides skill sets linked to occupations. ([ESCo][9])

#### Bootstrapped implementation option A (recommended): Embedding nearest-neighbor over occupation prototypes

1. Offline, build an “occupation prototype text” for each occupation (title + short description + tasks/skills from O*NET/ESCO).
2. Precompute embeddings for all occupations once.
3. At runtime, embed:

   * JD: title + first N lines of responsibilities/requirements
   * Resume: recent titles + summary + top extracted hard skills
4. Find top-3 occupations for each; compute:

   * `role_alignment = cosine_similarity(resume_occ_embedding, jd_occ_embedding)` (or overlap among top-k)
5. Gate:

   * If `role_alignment < 0.45`, cap final score to 0–10
   * If `0.45–0.60`, cap to 0–35 (career-changer zone)
   * If `> 0.60`, normal scoring

#### Why this works

A drywall framer occupation embedding will be far from recruiter/talent acquisition. So the score can’t be 100, no matter how many soft skills match.

#### Explainability UX

Show: “Role family: Construction Trades (JD) vs Human Resources (Resume). Recruiters usually treat this as a non-match.”

That is directly aligned with your promise: “See what they see.”

---

### Recommendation 2: Split skills into Hard vs Soft, and remove soft skills from the denominator

#### What to do

Tag every extracted skill with `skill_type`:

* Hard: tools, technical skills, certifications, domain-specific processes (OSHA, drywall, benefits administration)
* Soft: teamwork, communication, leadership, etc
* Meta: things like “fast-paced”, “detail-oriented” (should be ignored for scoring)

Then change scoring:

* Hard skills drive 85–95% of the keyword component.
* Soft skills can add at most a small bonus (example: +0 to +5 points), and only if hard-skill coverage is already decent.

#### Concrete scoring rule

* Compute `hard_keyword_score` using only hard skills.
* Compute `soft_bonus = min(5, soft_coverage * 0.05)` but only if `hard_keyword_score >= 50`.
* Final keyword score = `hard_keyword_score + soft_bonus`.

This mirrors how recruiters behave and prevents generic inflation.

---

### Recommendation 3: Add a “Coverage Confidence” check so out-of-domain JDs cannot score high

Right now, your system silently fails when the JD is from a domain you did not model (construction), and it still outputs a high score.

#### What to do

Compute:

* `jd_hard_skill_count`
* `jd_hard_skill_weight_sum`
* `%soft = soft_weight_sum / total_weight_sum`

Then apply a confidence gate:

* If `jd_hard_skill_count < 3` OR `%soft > 0.6`, then:

  * `confidence = low`
  * `final_score_cap = 35` (or even 20 if role alignment is also low)

Also surface this in UX: “Low confidence: job is outside current skill coverage.”

This is a pragmatic fail-safe until your taxonomy coverage is truly broad.

---

### Recommendation 4: Make Must-Haves a hard cap, not just a weighted term

Indeed explicitly treats missing key qualifications like licenses as filterable non-matches. ([Indeed][1])
You should do the same.

#### What to do in claim scoring

1. Update your JD parsing prompt to explicitly extract:

* licenses/certifications (OSHA 10/30, RN, PE, etc)
* required years
* required tools
* required domain specialty (“benefits administration”, “fertility benefits”, “plan design”)

2. Introduce **category weights and hard caps**:

Example:

* If any `must_have` of category `license` is unmet → final score cap = 0–10
* If `must_have` years unmet by >30% → final score cap = 0–20
* If `must_have` domain specialty unmet → final score cap = 0–35

Then, within the allowed cap, compute your weighted blend.

This single change will fix many “HR-adjacent but wrong specialty” cases like benefits manager vs recruiter.

---

### Recommendation 5: Add discriminativeness weighting (IDF) to kill generic skills

LinkedIn’s approach effectively learns which skills matter more via models and context. ([LinkedIn][3])
You can approximate this without training data:

#### What to do

Maintain document frequency counts over all captured JDs:

* `df[skill]` = number of JDs where this skill appears
* `N` = total JDs seen

Compute:

* `idf(skill) = log((N + 1) / (df + 1)) + 1`

Then:

* `weight’ = base_weight * clamp(idf_normalized, 0.2, 2.0)`

Result:

* “Teamwork” appears everywhere → low weight
* “Drywall”, “OSHA 30” appear rarely → high weight
* Your false positives drop immediately as soon as you have even a modest corpus

This is cheap, fast, and explainable.

---

### Recommendation 6: Require evidence strength for matched skills (prevents both false positives and resume stuffing)

Right now, inferred skills and skills-section-only mentions can match too strongly.

#### What to do

Track `evidence_level` per resume skill:

* Level 2: appears in experience bullet/project context
* Level 1: appears only in skills section
* Level 0: inferred

Then credit:

* Level 2: 1.0 credit
* Level 1: 0.6 credit
* Level 0: 0.2 credit (or 0 for scoring, only for explanations)

This is the “show, don’t tell” version of qualification.

---

### Recommendation 7: Fix semantic similarity so it cannot “rescue” a mismatch

Even if semantic is only 20%, it can still inflate borderline cases.

#### What to do

Compute embeddings on a **structured summary** rather than full text:

Example embedding input for JD:

* Title
* 10 must-have requirements (skills/tools/licenses/years)
* Domains/industries

For resume:

* Recent titles
* Top hard skills
* Tools
* Domains/industries
* A few scale claims

This is similar in spirit to LinkedIn segmenting content and treating sections differently. ([LinkedIn][3])

Then:

* Only apply semantic bonus if role alignment and must-have coverage pass thresholds.

---

## 6) Handling career changers correctly (recruiting → HR is valid, recruiting → construction is not)

### The rule

Career changing should be allowed only when:

1. **Role families are adjacent**, and
2. Candidate matches **a meaningful subset of must-have domain skills**, not just soft skills.

### How to implement adjacency without training data

Using O*NET/ESCO:

* Consider two roles “adjacent” if:

  * they share a parent family (SOC major group), or
  * they share a high overlap in essential skills (ESCO is explicitly built for linking occupation ↔ skill sets). ([ESCo][9])

Then enforce:

* Adjacent roles can reach at most ~60–70 unless must-have specialty skills are present.
* Non-adjacent roles are capped at ~0–15.

This gives you:

* Recruiter → HR Generalist: possible 40–70 depending on must-haves
* Recruiter → Benefits Specialist: maybe 20–50 unless they have benefits keywords/evidence
* Recruiter → Drywall Framer: 0–10

---

## 7) Score calibration: making “50%” actually mean something

Without marketplace training data, you cannot truthfully claim “50 means 50% qualified” in a statistical sense. The way out is:

### A) Switch to bands (recommended for consumer trust)

ZipRecruiter uses discrete bands (Great/Good/Fair/Not a Match). ([ZipRecruiter][4])
You can still show 0–100, but anchor it to bands:

* 0–15: Not a match
* 16–40: Stretch / career-change
* 41–70: Plausible match
* 71–85: Strong match
* 86–100: Very strong match

### B) Add a “confidence meter”

Confidence should drop when:

* JD hard-skill coverage is low
* Role-family classification is uncertain
* JD is messy or generic

This prevents users from over-trusting a number that is based on weak evidence.

### C) Collect lightweight labels over time

Even as a bootstrapped product, you can gather tiny amounts of calibration data:

* “Was this score accurate?” (Yes/No)
* “Would a recruiter consider you qualified?” (Yes/No)

You don’t need a full ML model. Even 200–500 responses can tune thresholds and caps per job family.

---

## 8) A practical roadmap you can execute quickly

### Phase 1 (fast, immediate impact)

1. **Stop soft skills from driving the score** (hard/soft split, soft removed from denominator).
2. Add **JD coverage confidence gating** (if JD has <3 hard skills recognized, cap score).
3. Add **must-have hard caps** in claim scoring (license, years, domain specialty).

Expected effect: Drywall Framer stops scoring 100 even before you add full occupation taxonomy.

### Phase 2 (high leverage, still bootstrapped-friendly)

4. Implement **role-family classification** using O*NET or ESCO embeddings and nearest-neighbor lookup. ([O*NET Resource Center][8])
5. Add **role alignment gate** and “career changer adjacency” rules.

Expected effect: catastrophic false positives basically disappear.

### Phase 3 (quality and defensibility)

6. Add **IDF weighting** from your growing JD corpus.
7. Add **evidence strength** levels for resume skills.
8. Improve semantic by embedding structured summaries.

---

## 9) How this specifically fixes your three test cases

### Test Case 1: Drywall Framer (currently 100, should be ~0)

* Role family: Construction Trades vs HR/Recruiting → role alignment gate caps at 0–10.
* Must-haves like OSHA, drywall, blueprints → unmet → additional caps push to near 0.
* Soft skills no longer count materially.

### Test Case 2: Fertility Benefits Manager (currently 87, should be 30–40)

* Same broad family (HR) so not auto-zero.
* Must-have specialty: benefits plan design, vendor management, fertility benefits domain → likely gaps → cap around 20–50.
* Transferable HR skills (compliance, HRIS) contribute but can’t inflate past the specialty cap.

### Test Case 3: Preconstruction Senior Engineer (currently 33, should be 5–10)

* Role family mismatch (construction engineering vs recruiting) → gate caps low.
* Generic “project management” no longer enough.

---

## 10) One product-level suggestion that increases trust immediately

When you show the score, show the **gates** and **why**:

* Role alignment (job family match)
* Must-have coverage (met vs missing)
* Nice-to-have coverage
* Transferable skills found
* Confidence level

This matches what recruiters actually do and protects your credibility when the system is uncertain.

---

If you want to use your existing structure with minimal refactor, the single highest ROI change is:

**“Final Score = min( RoleAlignmentCap, MustHaveCap, WeightedBlendScore )”**

Where RoleAlignmentCap and MustHaveCap are derived from taxonomy classification and must-have satisfaction. That one pattern will stop the inflated nonsense while staying fast, cheap, and explainable.

[1]: https://www.indeed.com/news/releases/how-indeed-job-matching-works "Job Matching 101: How Indeed’s AI Connects Millions of People to Opportunity - Indeed Press Room"
[2]: https://www.linkedin.com/blog/engineering/platform-platformization/using-embeddings-to-up-its-match-game-for-job-seekers "How LinkedIn Is Using Embeddings to Up Its Match Game for Job Seekers"
[3]: https://www.linkedin.com/blog/engineering/skills-graph/extracting-skills-from-content "Extracting skills from content to fuel the LinkedIn Skills Graph"
[4]: https://www.ziprecruiter.com/blog/ziprecruiter-tells-you-how-strong-a-match-you-are-for-every-job/ "ZipRecruiter Now Tells Job Seekers How Strong a Match They Are for Every Job - ZipRecruiter"
[5]: https://docs.oracle.com/en/cloud/saas/taleo-enterprise/21b/otrcg/candidate-and-requisition-matching.html "Candidate and Requisition Matching"
[6]: https://docs.oracle.com/en/cloud/saas/talent-management/faarb/external-candidate-match-jobs-using-resume.html "External Candidates - Match Jobs Using Resume"
[7]: https://blog.workday.com/en-us/foundation-workday-skills-cloud.html "
      The Foundation of the Workday Skills Cloud | Workday US
    "
[8]: https://www.onetcenter.org/database.html "O*NET Database at O*NET Resource Center"
[9]: https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/competence-based-job-matching "Competence-based job matching | European Skills, Competences, Qualifications and Occupations (ESCO)"


[34m13m39s · gpt-5.1-pro[browser] · ↑30.45k ↓4.78k ↻0 Δ35.23k[39m
[2mfiles=2[22m
