# Teal errors and input fidelity

## Automatic additions during import

At 2026-11-05 13:31:24.753 MST (20:31:24.753 UTC), the imported resume's Contact Information section showed the new account's email rather than the source's `[EMAIL]` placeholder. No phone field was shown in that expanded section. Its Target Title section contained “Technical Recruiter”, populated from required onboarding; the source PDF has no Target Title line.

These are observed differences between the uploaded PDF and the representation Teal scored. They were not manual edits in the resume editor or accepted AI rewrites. The career content was imported into a separate clean account, with no merge of prior work history. `import-autofill-redacted.png` documents the expanded fields; its magenta mask deliberately covers the exact email text for privacy. The mask is an evidence redaction, not part of Teal's UI.

## Visible analysis

No misread career fact, wrong-job attribution, or invented career claim was identified in the visible without-posting Analyzer output. Its visible output consists of a score and issue-category counts; all 16 detailed recommendations were locked, so their factual accuracy cannot be assessed.

The visible imported OpenAI and X-Team headings, dates, and shown bullets were compared against `input/resume.txt`. Teal reformatted dates and rendered the content in its own builder. The source itself contains “a 300% reduction in time to hire”; its appearance in Teal's imported X-Team text is not an invented Teal claim. This check does not establish fidelity of every imported field or hidden recommendation.

Earlier original-account draft contents were excluded entirely from the test. The final run used a separate clean account; the original account's three resumes were preserved.

## With-posting keyword findings

Resume-analysis factual errors: **none found in the readable output**, with the following qualification. “Full Lifecycle Recruiting” was marked “Not Found in Resume”, while the Google section says “Full-cycle recruiting from 2018-2020 across a variety of roles from sales, product, operations and engineering.” The exact phrase Teal searched for is absent, but closely related wording is present. This is recorded as a possible semantic-match limitation, not proof that Teal misread or omitted the line.

The other four visible missing phrases—“Greenhouse”, “Applicant Tracking System”, “Bar Calibration”, and “Interview Loop Design”—do not appear verbatim in the source resume. Their absence as literal phrases does not establish that the person lacks the corresponding experience. No evidence was available to assess the hidden 21 keywords or the 16 locked Analyzer recommendations.
