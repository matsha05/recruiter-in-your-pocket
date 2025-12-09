# Hiring & Resume Research

This file collects external research that informs how Recruiter in Your Pocket works.

It is for:
- Product decisions and copy that stay grounded in evidence
- LLM agents that need real sources, not vibes
- A future public "Hiring Research" microsite

---

## 0. Core link list (primary and near‑primary sources)

### Recruiter eye tracking and resume behavior

- TheLadders eye tracking study (original PDF)  
  https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf  

- TheLadders eye tracking study (Boston University mirror)  
  https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf  

### How people scan text and layouts

- Nielsen Norman Group – Eyetracking evidence on reading digital content  
  https://www.nngroup.com/reports/how-people-read-web-eyetracking-evidence/  

- Nielsen Norman Group – F‑shaped pattern for reading web content  
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/  

- Nielsen Norman Group – Text scanning patterns: eyetracking evidence  
  https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/  

- How People Read on the Web (printable PDF based on NN/g work)  
  https://www.iso.org/files/live/sites/isoorg/files/styleguide/resources/How_People_Read_on_the_Web.pdf  

### ATS behavior, filtering, and "hidden workers"

- Harvard Business School & Accenture – Hidden Workers: Untapped Talent (2021)  
  https://www.hbs.edu/managing-the-future-of-work/Documents/research/hiddenworkers09032021.pdf  

- Enhancv – Does the ATS Reject Your Resume? 25 Recruiters Explain (original interviews, 2024)  
  https://enhancv.com/blog/does-ats-reject-resumes/  

### Recruiting funnel and volume benchmarks

- Lever – Recruiting Benchmarks Report (live resource page, updated)  
  https://www.lever.co/resources/recruiting-benchmarks-report/  

- Lever – The Latest Talent Acquisition & Recruiting Benchmarks  
  https://www.lever.co/resources/the-latest-talent-acquisition-recruiting-benchmarks/  

- Employ / Jobvite – 2023 Recruiter Nation Report (PDF)  
  https://web.jobvite.com/rs/328-BQS-080/images/2023-Employ-Recruiter-Nation-Report-Moving-Forward-in-Uncertainty.pdf  

### Talent trends and recruiter preferences

- LinkedIn – Global Talent Trends landing (links to current report, including 2024)  
  https://business.linkedin.com/talent-solutions/global-talent-trends  

- LinkedIn – Global Talent Trends 2024 (PDF example mirror)  
  https://content.linkedin.com/content/dam/me/business/zh-cn/talent-solutions/Event/2024/winwang/2024%20Global%20Talent%20Trends.pdf  

- LinkedIn – Future of Recruiting 2024 (PDF)  
  https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2024.pdf  

---

## 1. How recruiters actually read resumes

### 1.1 TheLadders eye tracking study (2012, referenced through 2018+)

**Links**

- Main PDF:  
  https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf  
- BU mirror:  
  https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf  

**What it found (short)**

- Recruiters spend around **6–7 seconds** on the initial "fit / no‑fit" decision for each resume.
- During that first skim, they focus on a small set of fields:
  - Name  
  - Current title and company  
  - Current dates  
  - Previous title and company  
  - Previous dates  
  - Education
- Only a fraction of the resume's text is fully read; the rest is scanned quickly for keywords and numbers.
- Resumes with clean hierarchy (clear headings, consistent layout, readable bullets) were rated easier to use and performed better.

**How we use this**

- Justifies the **Recruiter First Impression** module and our "6–10 second" framing.
- Guides our focus on:
  - Recent roles  
  - Titles, companies, and dates  
  - Scope and impact surfaced in top bullets
- Supports product copy like:  
  "Recruiters often decide whether to move you forward or pass in about 6–8 seconds, based on eye‑tracking research."

---

## 2. How people scan text and layouts

### 2.1 Eyetracking and reading patterns (Nielsen Norman Group)

**Links**

- Eyetracking evidence report (paid, but canonical):  
  https://www.nngroup.com/reports/how-people-read-web-eyetracking-evidence/  

- F‑shaped pattern overview:  
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/  

- Text scanning patterns article:  
  https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/  

- How People Read on the Web (ISO PDF summarizing NN/g findings):  
  https://www.iso.org/files/live/sites/isoorg/files/styleguide/resources/How_People_Read_on_the_Web.pdf  

**Key findings**

- Most users **scan**, they do not read word by word.
- Common patterns:
  - F pattern: heavy attention on top lines and along the left edge, then a downward skim.
  - Layer cake pattern: jumping from heading to heading.
  - Spotting: eyes land on numbers, bold phrases, and proper nouns.
- Dense paragraphs are often skipped.
- Bullets, headings, and visible numbers win attention.
- Consistent formatting and white space improve comprehension and make content feel more trustworthy.

**How we use this**

- Informs the **Bullet Upgrades** design:
  - One idea per bullet  
  - Numbers early  
  - Clear verbs and outcomes
- Guides report layout:
  - Max line length for text  
  - Clear section headings  
  - Enough spacing between modules
- Justifies feedback like:
  - "Some bullets try to do too much"  
  - "Add a number early in this bullet so it survives the first skim"

---

## 3. ATS behavior, filtering, and "hidden workers"

### 3.1 Hidden Workers: Untapped Talent (Harvard Business School & Accenture, 2021)

**Link**

- Full report PDF:  
  https://www.hbs.edu/managing-the-future-of-work/Documents/research/hiddenworkers09032021.pdf  

**Key findings relevant to ATS**

- ATS and CRM/RMS systems are now used by **90 percent+** of surveyed employers to initially filter or rank candidates in many roles.
- These systems are configured with **narrow parameters**:
  - Degree requirements  
  - Exact skills  
  - Continuous employment history  
  - Employment gaps used as negative filters
- As a result, large numbers of "hidden workers" are excluded from consideration even when they could perform well with modest training.
- The report recommends:
  - Moving from negative filters ("reject if X is missing") to affirmative logic ("surface candidates with Y capability").
  - Refreshing job descriptions to reduce legacy and "nice to have" requirements.

**How we use this**

- We do not pretend ATS does nothing. It clearly shapes **who gets seen**.
- We also do not push "beat the bots" gimmicks:
  - Our stance: ATS filters and ranks, but recruiters still decide who moves forward.
- We can reference this when we explain:
  - Why clear skills and experience signals matter  
  - Why unexplained gaps or lack of basics might hurt more than formatting

### 3.2 Does the ATS Reject Your Resume? 25 Recruiters Explain (Enhancv, 2024)

**Link**

- Article with original recruiter interviews:  
  https://enhancv.com/blog/does-ats-reject-resumes/  

**Key points**

- Enhancv interviewed 25 recruiters across industries in the U.S.
- **92 percent** reported that their ATS does **not** automatically reject resumes for formatting, design, or minor issues.
- Most said:
  - ATS is used to **store, search, and filter** resumes.
  - The real bottleneck is **volume** and limited recruiter time.
- Job seekers often misinterpret silence as "ATS rejection" when it is usually human overload and prioritization.

**How we use this**

- Supports our education that:
  - The bigger risk is writing a resume that is hard for humans to parse or that never gets surfaced in a search, not secret formatting rules.
- Justifies focusing our scoring and advice on:
  - Clarity  
  - Obvious skills and keywords in sensible places  
  - Measurable impact

---

## 4. Recruiting funnel and volume benchmarks

### 4.1 Lever recruiting benchmarks

**Links**

- Recruiting Benchmarks Report (landing page for current edition):  
  https://www.lever.co/resources/recruiting-benchmarks-report/  

- The Latest Talent Acquisition & Recruiting Benchmarks:  
  https://www.lever.co/resources/the-latest-talent-acquisition-recruiting-benchmarks/  

**Key themes**

- Applicant‑to‑hire ratios are steep across many roles.
- Only a fraction of applicants make it to interview, and an even smaller fraction to offer.
- Time to fill and pass‑through rates vary widely by company size and role type.
- Recruiters and talent teams are under pressure to:
  - Move faster  
  - Maintain or improve quality  
  - Work with limited headcount

**How we use this**

- Reinforces that resumes are often one of **hundreds** in a pipeline.
- Supports our emphasis on:
  - Surviving the first skim  
  - Being easy to advance to "shortlist" status
- Justifies language like:
  "Small improvements in clarity and scope make a big difference when a recruiter is scanning dozens of profiles in a session."

### 4.2 Employ / Jobvite – 2023 Recruiter Nation Report

**Link**

- Full PDF (Employ / Jobvite, 2023):  
  https://web.jobvite.com/rs/328-BQS-080/images/2023-Employ-Recruiter-Nation-Report-Moving-Forward-in-Uncertainty.pdf  

**Key themes**

- Data from more than 21,000 customers and 1,200+ HR leaders and recruiters.
- Confirms:
  - Continued high volume in many hiring pipelines  
  - Ongoing difficulty finding "qualified" candidates, even with lots of applicants  
  - Strong focus on metrics like time to hire, funnel health, and quality of hire
- Many respondents expect to rely more on automation, but still see human judgment as central.

**How we use this**

- Supports the narrative that:
  - Recruiters are overwhelmed more by **quantity** than by system limitations.
- Anchors our product's focus on:
  - Helping candidates stand out in large pools  
  - Helping recruiters quickly see scope, level, and impact

---

## 5. Talent trends and recruiter preferences

### 5.1 LinkedIn Global Talent Trends (2024 and recent years)

**Links**

- Overview page (always points to latest report):  
  https://business.linkedin.com/talent-solutions/global-talent-trends  

- Example 2024 PDF mirror:  
  https://content.linkedin.com/content/dam/me/business/zh-cn/talent-solutions/Event/2024/winwang/2024%20Global%20Talent%20Trends.pdf  

**Key themes relevant to resumes**

- Emphasis on:
  - Clear communication  
  - Demonstrated impact  
  - Adaptability and learning  
  - Collaboration and cross‑functional work
- Growing focus on:
  - Internal mobility  
  - Skills based hiring (beyond degrees)  
  - Human skills alongside technical skills
- AI and automation are increasing, but human decisions on fit and potential still dominate.

**How we use this**

- Supports our **Impact** and **Story** subscores.
- Justifies calling out:
  - Collaboration wins  
  - Cross‑functional leadership  
  - Clear outcomes rather than task lists
- Helps shape Job Alignment and Best Fit Roles logic.

### 5.2 Future of Recruiting 2024 (LinkedIn)

**Link**

- PDF:  
  https://business.linkedin.com/content/dam/me/business/en-us/talent-solutions/resources/pdfs/future-of-recruiting-2024.pdf  

**Key themes**

- Survey of thousands of recruiting professionals and analysis of LinkedIn platform data.
- Predicts:
  - Increased role of AI in sourcing and screening  
  - Continued emphasis on quality of hire, not just speed  
  - Need for recruiters to build skills in storytelling, stakeholder management, and strategy

**How we use this**

- Validates that our product should:
  - Help candidates tell a clear, strategic story on the page  
  - Focus on clarity of signal for both recruiters and hiring managers

---

## 6. How we map research to product features

For internal use (LLMs, product, design).

- **Recruiter First Impression**  
  - Grounded in TheLadders eye tracking work on 6–7 second skims.  
  - Used to justify focusing on recent roles, titles, companies, dates, and top bullets.

- **Main score (Recruiter Read) and bands**  
  - Interpreted as "how well your resume survives that first quick skim in a crowded pipeline," using data from TheLadders and funnel benchmarks from Lever and Jobvite.

- **Subscores (Impact, Clarity, Story, Readability)**  
  - Clarity and Readability informed by NN/g scanning research and digital reading behavior.  
  - Impact and Story informed by LinkedIn talent reports that emphasize measurable results, narrative, and collaboration.

- **Bullet Upgrades**  
  - Directly shaped by NN/g's findings that users fixate on numbers, short lines, and strong visual hierarchy.

- **ATS education content**  
  - Uses HBS "Hidden Workers" to explain how ATS and RMS filter and rank.  
  - Uses Enhancv's recruiter interviews to debunk the idea that formatting alone causes auto rejection.  
  - Our stance: ATS shapes which resumes are surfaced, but **humans** still decide who moves forward.

---

## 7. Extending this file

When adding new research:

1. Add the link in the core list, preferably from:
   - Original PDF or official site  
   - A vendor or academic institution, not a random blog
2. Add a short summary:
   - 3–6 bullets of what it found  
   - 1–3 bullets of how we use it
3. Keep language plain so both humans and LLMs can read it easily.

This file is meant to be a lightweight, evolving knowledge base, not a full literature review.
