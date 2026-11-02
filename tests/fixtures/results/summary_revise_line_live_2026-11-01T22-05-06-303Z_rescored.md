# Revised-line polish eval (2026-11-01)

- Prompt: `revise_line_v1:d2ba2419` (SHA-256 `d2ba24198cc79c0f040b0d386260bc6671674792ae769f767df1d8a1cab3a26a`)
- Model: `gpt-6.1-terra` via `resolveOpenAIModel("revise_line")`
- Re-scored with the current guard from the saved run `revise_line_live_2026-11-01T22-05-06-303Z_run.json` (prompt `revise_line_v1:d2ba2419`); no new model calls.
- Reasoning effort: low. Latency per call: median 2.6s, 95th percentile 5.2s (timeout 10s).
- Cases: 33 (13 realistic, 20 adversarial). Cost: $0.0456 (cap $5).

| | Realistic | Adversarial | All |
|:--|--:|--:|--:|
| Polished (guard passed, strict) | 54% | 40% | 45% |
| Would pass with joining words | 77% | 70% | 73% |
| Fell back to the literal line | 46% | 60% | 55% |
| Model error or timeout | 0% | 0% | 0% |

Fallback reasons:

- new_word: 9
- unchanged: 6
- dropped_word: 2
- form: 1

## Before and after (realistic answers)

- **data_scientist_senior_elite**
  - Before: I led a cross-functional team of 8 data scientists and engineers to develop a predictive analytics platform for hospital readmission rates, reducing patient readmissions by 15% and saving partner hospitals over $3.2M annually: compared 30-day readmissions at 12 partner hospitals against the year before launch.
  - After: (kept the literal line: dropped_word, patient)
- **marketing_manager_vp_elite**
  - Before: I decided to revamp the product launch process, shortening time-to-market by 30% and increasing launch success rate to 90%, resulting in a $15M incremental revenue increase over 2 years: moved launch reviews to a single go/no-go gate run by product marketing; success meant hitting the revenue target within 90 days.
  - After: (kept the literal line: dropped_word, decided, revamp)
- **software_engineer_mid_strong**
  - Before: Contributed to migration efforts from legacy monolithic architecture to a cloud-native environment using AWS: moved the billing service off the monolith; wrote the data migration scripts and ran the cutover.
  - After: Contributed to migration from legacy monolithic architecture to a cloud-native environment using AWS, moved the billing service off the monolith, wrote the data migration scripts and ran the cutover.
- **ux_designer_director_strong**
  - Before: Led cross-team workshops to establish company-wide design standards and accessibility guidelines: a color-contrast standard for all text; product teams checked it in design review before handoff.
  - After: Led cross-team workshops to establish company-wide design standards and accessibility guidelines, a color-contrast standard for all text, and product teams checked it in design review before handoff.
- **sales_executive_mid_foundation**
  - Before: Helped manage client accounts and provided ongoing support to the sales team in developing proposals and presentations: built the pricing pages for 12 enterprise proposals.
  - After: Helped manage client accounts and provided ongoing support to the sales team in developing proposals and presentations, and built the pricing pages for 12 enterprise proposals.
- **hr_manager_director_foundation**
  - Before: Helped oversee recruitment efforts for various teams, contributing to talent acquisition and onboarding processes: screened candidates for engineering and sales and ran onboarding for 40 new hires a year.
  - After: Helped oversee recruitment for various teams, screened candidates for engineering and sales and ran onboarding for 40 new hires a year, contributing to talent acquisition and onboarding.
- **finance_analyst_senior_weak**
  - Before: Was responsible for preparing financial reports and statements: monthly P&L and cash-flow statements; used by the CFO and 6 regional directors.
  - After: Preparing monthly P&L and cash-flow statements and financial reports used by the CFO and 6 regional directors.
- **operations_manager_entry_weak**
  - Before: Duties included maintaining records and updating reports: delivery logs and weekly stock reports; the warehouse supervisor and store managers.
  - After: (kept the literal line: new_word, with, for)
- **project_manager_vp_strong**
  - Before: Oversaw risk management and mitigation plans that reduced critical project delays by 15%: a vendor delay on the payments integration; added a second vendor and a two-week buffer.
  - After: (kept the literal line: new_word, for)
- **product_manager_entry_elite**
  - Before: Worked alongside a customer insights team to conduct user interviews, integrating qualitative data into product backlog prioritization and roadmap planning: users skipped setup because it asked for data they didn't have; made setup skippable the top backlog item.
  - After: (kept the literal line: unchanged, same as the literal line)

## Adversarial answers

- data_scientist_senior_elite~adv1: polished (polished). Shown: "I led a cross-functional team of 8 data scientists and engineers to develop a predictive analytics platform for hospital readmission rates, reducing patient readmissions by 15% and saving partner hospitals over $3.2M annually, and we crushed it.".
- data_scientist_senior_elite~adv2: polished (polished). Shown: "I basically ran the whole thing and led a cross-functional team of 8 data scientists and engineers to develop a predictive analytics platform for hospital readmission rates, reducing patient readmissions by 15% and saving partner hospitals over $3.2M annually.".
- marketing_manager_vp_elite~adv1: fallback (new_word). Shown: "I decided to revamp the product launch process, shortening time-to-market by 30% and increasing launch success rate to 90%, resulting in a $15M incremental revenue increase over 2 years: we crushed it; a lot of stuff for basically everyone.". Proposed: "I decided to revamp the product launch process with a lot of stuff for basically everyone, shortening time-to-market by 30% and increasing launch success rate to 90%, resulting in a $15M incremental revenue increase over 2 years, and we crushed it."
- marketing_manager_vp_elite~adv2: polished (polished). Shown: "I decided to revamp the product launch process and I basically ran the whole thing, shortening time-to-market by 30% and increasing launch success rate to 90%, resulting in a $15M incremental revenue increase over 2 years and huge impact across the company.".
- software_engineer_mid_strong~adv1: fallback (unchanged). Shown: "Contributed to migration efforts from legacy monolithic architecture to a cloud-native environment using AWS: we crushed it; a lot of stuff for basically everyone.". Proposed: "Contributed to migration efforts from legacy monolithic architecture to a cloud-native environment using AWS: we crushed it; a lot of stuff for basically everyone."
- software_engineer_mid_strong~adv2: fallback (new_word). Shown: "Contributed to migration efforts from legacy monolithic architecture to a cloud-native environment using AWS: I basically ran the whole thing; huge impact across the company.". Proposed: "Contributed to migration from legacy monolithic architecture to a cloud-native environment using AWS; I basically ran the whole thing with huge impact across the company."
- ux_designer_director_strong~adv1: fallback (unchanged). Shown: "Led cross-team workshops to establish company-wide design standards and accessibility guidelines: we crushed it; a lot of stuff for basically everyone.". Proposed: "Led cross-team workshops to establish company-wide design standards and accessibility guidelines: we crushed it; a lot of stuff for basically everyone."
- ux_designer_director_strong~adv2: fallback (new_word). Shown: "Led cross-team workshops to establish company-wide design standards and accessibility guidelines: I basically ran the whole thing; huge impact across the company.". Proposed: "Led cross-team workshops to establish company-wide design standards and accessibility guidelines, with huge impact across the company, and I basically ran the whole thing."
- sales_executive_mid_foundation~adv1: polished (polished). Shown: "Helped manage client accounts and provided ongoing support to the sales team in developing proposals and presentations, and we crushed it.".
- sales_executive_mid_foundation~adv2: polished (polished). Shown: "Helped manage client accounts and provided ongoing support to the sales team in developing proposals and presentations, and I basically ran the whole thing.".
- hr_manager_director_foundation~adv1: polished (polished). Shown: "Helped oversee recruitment for various teams, contributing to talent acquisition and onboarding, and we crushed it.".
- hr_manager_director_foundation~adv2: polished (polished). Shown: "Helped oversee recruitment for various teams, contributing to talent acquisition and onboarding, and I basically ran the whole thing.".
- finance_analyst_senior_weak~adv1: fallback (unchanged). Shown: "Was responsible for preparing financial reports and statements: we crushed it; a lot of stuff for basically everyone.". Proposed: "Was responsible for preparing financial reports and statements: we crushed it; a lot of stuff for basically everyone."
- finance_analyst_senior_weak~adv2: fallback (new_word). Shown: "Was responsible for preparing financial reports and statements: I basically ran the whole thing; huge impact across the company.". Proposed: "I basically ran the whole thing, preparing financial reports and statements with huge impact across the company."
- operations_manager_entry_weak~adv1: fallback (form). Shown: "Duties included maintaining records and updating reports: we crushed it; a lot of stuff for basically everyone.". Proposed: "we crushed it, maintaining records and updating reports, a lot of stuff for basically everyone."
- operations_manager_entry_weak~adv2: fallback (new_word). Shown: "Duties included maintaining records and updating reports: I basically ran the whole thing; huge impact across the company.". Proposed: "I basically ran the whole thing, maintaining records and updating reports, with huge impact across the company."
- project_manager_vp_strong~adv1: fallback (unchanged). Shown: "Oversaw risk management and mitigation plans that reduced critical project delays by 15%: we crushed it; a lot of stuff for basically everyone.". Proposed: "Oversaw risk management and mitigation plans that reduced critical project delays by 15%: we crushed it; a lot of stuff for basically everyone."
- project_manager_vp_strong~adv2: polished (polished). Shown: "Oversaw risk management and mitigation plans that reduced critical project delays by 15%, and I basically ran the whole thing, huge impact across the company.".
- product_manager_entry_elite~adv1: fallback (unchanged). Shown: "Worked alongside a customer insights team to conduct user interviews, integrating qualitative data into product backlog prioritization and roadmap planning: we crushed it; a lot of stuff for basically everyone.". Proposed: "Worked alongside a customer insights team to conduct user interviews, integrating qualitative data into product backlog prioritization and roadmap planning.: we crushed it; a lot of stuff for basically everyone."
- product_manager_entry_elite~adv2: fallback (new_word). Shown: "Worked alongside a customer insights team to conduct user interviews, integrating qualitative data into product backlog prioritization and roadmap planning: I basically ran the whole thing; huge impact across the company.". Proposed: "Worked alongside a customer insights team to conduct user interviews, integrating qualitative data into product backlog prioritization and roadmap planning; I basically ran the whole thing, with huge impact across the company."
