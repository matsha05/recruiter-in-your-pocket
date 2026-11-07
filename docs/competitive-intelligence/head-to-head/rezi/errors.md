# Rezi errors and source differences

The PDF was unchanged. Rezi scored its automatically imported representation after the user authorized continuing through automatic imports. No manual correction, keyword insertion, or suggested rewrite was accepted.

## Factual/parsing differences

1. **Company parsing:** source “OpenAI” became “OpenAl” (final character lower-case `l`).
2. **Abbreviation parsing:** source “AI” became “Al” in the X-Team sectors example and Meta role/title/bullets; “DEI” became “DEl”.
3. **Level parsing:** source “Engineering Directors/VPs from L6 to L9” became “Engineering Directors/VPs from L6 to 19.”
4. **Certification expiry omitted:** source “Expires Jul 2024” is absent from the final imported certification presentation, which shows “SHRM Certified Professional (SHRM-CP)” and “August 2020”. The report does not explicitly claim that the certification is current.
5. **Education wording:** “B.S. Business Administration - Marketing and Finance focus” became “B.S. Business Administration - Marketing and Finance”.
6. **Bullet boundaries changed:** the X-Team DEI bullet was split before “This led to an increase in underrepresented candidates by 85% globally.” The Robert Half growth bullet was split before “Managed a staff of 32 consultants…”. This can affect bullet-level scoring.

## Incorrect or malformed feedback

- **Punctuation:** the no-posting report flags six experiences as “without punctuated bullet points”; the with-posting report flags “Member of Recruiting Staff”. The four source bullets in that role all begin with capitals or the number 200 and end in periods, as do their displayed imported versions. The deeper detail link identifies bullet 2: “200 offer accepts with a 94% accept rate.” That bullet ends in a period and starts with a number. The flag therefore does not identify absent punctuation; it may be treating the leading number as a capitalization failure. No correction was applied.
- **Length template:** the no-posting panel literally says “Your resume is page long”, with no quantity. The input PDF has three pages. The displayed warning is incomplete; it does not establish what page count the tool measured.
- **Email warning:** “Your Email address is missing” is an expected consequence of deliberate contact redaction, not a tool error.

- **Inconsistent score label:** the score modal pairs 96 with “Excellent”, while the later role-editor sidebar pairs 96 with “Needs improvement” (for example, `punctuation-detail.png`). Both are visible UI states from the same imported resume. The capture does not establish why the labels differ.

## Automatic additions and limitations

Rezi introduced a SUMMARY and a SKILLS section absent from the source. The continuation's generated summary reads:

> Experienced recruiting professional with a proven track record in talent acquisition, employee engagement, and HR strategy. Skilled in scaling organizations, managing remote teams, and implementing data-driven HR processes. Expertise in AI and ML hiring, as well as Cloud Sales and Engineering roles.

The final added skills were Talent Acquisition, Recruiting, HR Strategy, Employee Engagement, and Performance Management. These are Rezi-authored additions drawing on the source, not evidence that the original PDF contained these sections. No new numerical accomplishment was observed in them.

The first signup preview omitted Robert Half, the certification, and later bullets from several roles. Those roles/bullets were present in the later authenticated full preview; the early preview omissions are not asserted as permanent data loss. Source-preserving analysis cannot be claimed because parsing, layout, section additions, and the expiration-date loss persisted.

The score moved from the captured no-posting 56 to an intermediate 93 and then 96 after adding the posting. Content and Format scores changed without manual resume edits. These are observed UI states; whether asynchronous processing contributed was not isolated. The score delta should not be represented as a measured posting-only effect.

Evidence: `continuation-first-report-screen.txt`, `without-posting-score.txt`, `with-posting-score.txt`, and matching screenshots. All claims here concern visible output; no hidden PRO advice was evaluated.
