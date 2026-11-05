# Rezi recommendations

For locked entries, a GENERIC label classifies only the visible topic heading. The unseen recommendation body is unavailable and unclassified; it is not inferred from that heading.

Wording below is copied from the visible free UI. Category order follows the score panel's tabs: Content, Format, Optimization, Best Practices, Application Ready. Each tab was opened. Locked labels are recorded without inventing their hidden advice. These recommendations concern Rezi's automatic import, which differed from the source; see `errors.md`.

## Without posting

Before opening the score panel, the workspace's **AI Keyword Targeting** panel said:

- **KEYWORD:** “We help you get more interviews by optimizing your resume with important keywords in the job description. It's super easy - let's start by adding a job description.”

The **Rezi Score** panel introduced its suggestions with “Improve your Rezi Score by making the suggested adjustments in each category.” Its entries, in displayed order:

1. **SPECIFIC — Content:** “Your resume has 2 experiences with weak bullet points” / “Weak verbs will fail to explain your experience with meaningful language.” Named roles, in order: “Recruiting Manager (Al and ML SWE)”; “Recruiting Director”. This identifies roles but does not quote an exact bullet.
2. **GENERIC — locked:** “Personal pronouns” / “PRO”. Hidden recommendation body unavailable.
3. **GENERIC — locked:** “Buzzwords” / “PRO”. Hidden recommendation body unavailable.
4. **GENERIC — locked:** “Passive voice” / “PRO”. Hidden recommendation body unavailable.
5. **GENERIC — locked:** “Filler words” / “PRO”. Hidden recommendation body unavailable.
6. **SPECIFIC — Content:** “Your resume has 6 experiences without punctuated bullet points” / “Capitalize the first letter and end with a period for each bullet point.” Named roles, in order: “Member of Recruiting Staff”; “Chief People Officer”; “Recruiting Manager (Al and ML SWE)”; “Recruiting Director”; “Talent Acquisition”; “Staffing Executive”.
7. **GENERIC — Format:** “Your resume is page long” / “Two pages are sufficient to include enough relevant experiences for any targeted application.” The absent quantity is how the UI rendered it.
8. **KEYWORD — Optimization:** “Your resume is not tailored for a specific job description” / “Add specific keywords from a targeted job description to optimize your resume.”
9. **SPECIFIC — Best Practices:** “Your Email address is missing” / “Add a clean email address like firstname-lastname@gmail.com to be contacted easily.” This responds to the deliberately redacted `[EMAIL]` field.
10. **GENERIC — Application Ready:** “Your resume is not ready for application” / “Try to fix failed audits by yourself or ask for help with a resume review.”

## With posting

### AI Keyword Targeting panel

The panel first displayed this prompt:

- **KEYWORD:** “Is this missing keyword relevant to your experience?” / “Strategic Recruiting”. The offered actions were “YES - ADD BULLET POINT” and “NO”; neither was selected.

Then it said:

> Want to improve your chances of getting this role? Consider adding the following keywords to your resume:

The list, in order:

1. **KEYWORD:** “Strategic Recruiting”
2. **KEYWORD:** “Targeted Outreach”
3. **KEYWORD:** “Market Mapping”
4. **KEYWORD:** “Interview Design”
5. **KEYWORD:** “Bar Calibration”
6. **KEYWORD — locked:** remaining keyword position 6; obfuscated text, PRO.
7. **KEYWORD — locked:** remaining keyword position 7; obfuscated text, PRO.
8. **KEYWORD — locked:** remaining keyword position 8; obfuscated text, PRO.
9. **KEYWORD — locked:** remaining keyword position 9; obfuscated text, PRO.
10. **KEYWORD — locked:** remaining keyword position 10; obfuscated text, PRO.
11. **KEYWORD — locked:** remaining keyword position 11; obfuscated text, PRO.
12. **KEYWORD — locked:** remaining keyword position 12; obfuscated text, PRO.
13. **KEYWORD — locked:** remaining keyword position 13; obfuscated text, PRO.
14. **KEYWORD — locked:** remaining keyword position 14; obfuscated text, PRO.
15. **KEYWORD — locked:** remaining keyword position 15; obfuscated text, PRO.
16. **KEYWORD — locked:** remaining keyword position 16; obfuscated text, PRO.
17. **KEYWORD — locked:** remaining keyword position 17; obfuscated text, PRO.
18. **KEYWORD — locked:** remaining keyword position 18; obfuscated text, PRO.
19. **KEYWORD — locked:** remaining keyword position 19; obfuscated text, PRO.
20. **KEYWORD — locked:** remaining keyword position 20; obfuscated text, PRO.
21. **KEYWORD — locked:** remaining keyword position 21; obfuscated text, PRO.
22. **KEYWORD — locked:** remaining keyword position 22; obfuscated text, PRO.
23. **KEYWORD — locked:** remaining keyword position 23; obfuscated text, PRO.
24. **KEYWORD — locked:** remaining keyword position 24; obfuscated text, PRO.
25. **KEYWORD — locked:** remaining keyword position 25; obfuscated text, PRO.
26. **KEYWORD — locked:** remaining keyword position 26; obfuscated text, PRO.

“See all (26)” was expanded. The 21 locked labels appeared as scrambled strings, not readable recommendations. The literal obfuscated text is preserved in `with-posting-keywords.txt`; no attempt was made to recover hidden labels.

### Rezi Score panel

1. **SPECIFIC — Content:** “Your resume has 2 experiences with weak bullet points” / “Weak verbs will fail to explain your experience with meaningful language.” Named roles, in order: “Recruiting Director”; “Recruiting Manager (Al and ML SWE)”.
2. **GENERIC — locked:** “Personal pronouns” / “PRO”. Hidden recommendation body unavailable.
3. **GENERIC — locked:** “Buzzwords” / “PRO”. Hidden recommendation body unavailable.
4. **GENERIC — locked:** “Passive voice” / “PRO”. Hidden recommendation body unavailable.
5. **GENERIC — locked:** “Filler words” / “PRO”. Hidden recommendation body unavailable.
6. **SPECIFIC — Content:** “Your resume has 1 experience without punctuated bullet points” / “Capitalize the first letter and end with a period for each bullet point.” Named role: “Member of Recruiting Staff”.
7. **GENERIC — Format status:** “Looks great!” / “No adjustments needed at the moment.”
8. **GENERIC — Optimization status:** “Looks great!” / “No adjustments needed at the moment.”
9. **SPECIFIC — Best Practices:** “Your Email address is missing” / “Add a clean email address like firstname-lastname@gmail.com to be contacted easily.”
10. **GENERIC — Application Ready status:** “Looks great!” / “No adjustments needed at the moment.”

Status messages are retained for completeness; they are not counted as requested edits. Locked-item classifications describe the visible category only, not its hidden content.

## Free detail links opened after the with-posting score

The three flagged role links were opened without saving any changes. These revealed more precise feedback than the score overview.

### Recruiting Director — Adventures in Missions

1. **SPECIFIC:** “Weak Bullet Points” / “Avoid using weak verbs to describe your experience. Replace "worked" with an action verb”. The source contains “worked as the Head of Logistics”.
2. **GENERIC — PRO / locked:** “Personal Pronoun”. Personalized advice is locked; no hidden terms or bullet positions were available.
3. **GENERIC — PRO / locked:** “Buzzwords”. Personalized advice is locked; no hidden terms or bullet positions were available.
4. **GENERIC — PRO / locked:** “Passive Voice”. Personalized advice is locked; no hidden terms or bullet positions were available.
5. **GENERIC — PRO / locked:** “Filler Words”. Personalized advice is locked; no hidden terms or bullet positions were available.
6. **GENERIC — PRO / locked:** “Wordy Content”. Personalized advice is locked; no hidden terms or bullet positions were available.

Expanding “6 best practices applied” exposed these **passed checks**, in order, rather than new failed recommendations:

1. **GENERIC:** “Number of Bullet Points” / “Include 3-10 bullet points for each experience if possible”
2. **GENERIC:** “Quantified Bullet Points” / “Add metrics to each bullet point when possible”
3. **GENERIC:** “Short Bullet Points” / “Each bullet point should be a full line length”
4. **GENERIC:** “Punctuated Bullet Points” / “Capitalize the first letter and end with a period for each”
5. **GENERIC:** “Abbreviated Months” / “Months should be fully spelled rather than abbreviated.”
6. **GENERIC:** “Dates are missing” / “Dates provide essential context for your professional tenure.” This label appeared within the passed-check group; it is not treated as an assertion that this role's dates were missing.

The open role editor additionally said **GENERIC:** “Aim for a balanced mix of descriptive and key number bullet points.” Its “SUGGEST BULLET” and “Save to Experience list” actions were not used.

### Recruiting Manager (Al and ML SWE) — Meta (formerly Facebook)

1. **SPECIFIC:** “Weak Bullet Points” / “Avoid using weak verbs to describe your experience. Replace "took" with an action verb”. The source contains “took charge of org-wide offer standups”.
2. **GENERIC — PRO / locked:** “Personal Pronoun”. Personalized advice is locked; no hidden terms or bullet positions were available.
3. **GENERIC — PRO / locked:** “Buzzwords”. Personalized advice is locked; no hidden terms or bullet positions were available.
4. **GENERIC — PRO / locked:** “Passive Voice”. Personalized advice is locked; no hidden terms or bullet positions were available.
5. **GENERIC — PRO / locked:** “Filler Words”. Personalized advice is locked; no hidden terms or bullet positions were available.
6. **GENERIC — PRO / locked:** “Wordy Content”. Personalized advice is locked; no hidden terms or bullet positions were available.

“6 best practices applied” was also shown. The terms and positions hidden in PRO text were not recovered.

### Member of Recruiting Staff — OpenAl

1. **SPECIFIC:** “Punctuated Bullet Points” / “Capitalize the first letter and end with a period for each bullet point. Take a look at bullet 2”.
2. **GENERIC — PRO / locked:** “Personal Pronoun”. Personalized advice is locked; no hidden terms or bullet positions were available.
3. **GENERIC — PRO / locked:** “Buzzwords”. Personalized advice is locked; no hidden terms or bullet positions were available.
4. **GENERIC — PRO / locked:** “Passive Voice”. Personalized advice is locked; no hidden terms or bullet positions were available.
5. **GENERIC — PRO / locked:** “Filler Words”. Personalized advice is locked; no hidden terms or bullet positions were available.
6. **GENERIC — PRO / locked:** “Wordy Content”. Personalized advice is locked; no hidden terms or bullet positions were available.

“6 best practices applied” was also shown. Unopened PRO tooltip templates are omitted from the detail text captures with explicit markers. No hidden terms were recovered. See `evidence-notes.md` for supplementary screenshot timing limitations.
