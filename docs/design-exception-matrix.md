# Design Exception Matrix

This matrix documents intentional deviations from the Lifted Line Design System.
If a rule is bent, it must be recorded here with a clear rationale and a review date.

## Active Exceptions

| Rule | Exception | Location | Rationale | Review Date |
| --- | --- | --- | --- | --- |
| Semantic styling | Legacy direct Tailwind palette utilities remain | Production routes, especially Research | Frozen at the July 11 guardrail baseline while surfaces migrate to semantic tokens. New debt fails CI. | 2026-08-01 |
| Shared controls | Some routes still use raw buttons and inputs | Production components | Frozen at the July 11 guardrail baseline. Migrate when each surface is touched; do not increase. | 2026-08-01 |
| Compatibility CSS | `--lift-*`, older `riyp-*`, and legacy surface aliases remain | `web/app/globals.css` | Preserve current visuals during compatibility-first consolidation. New Lifted Line work uses root semantic roles. | 2026-08-01 |
| Icon family | Legacy Lucide icons remain outside the selected landing and Research hub | Production routes | Phosphor is canonical for newly migrated public surfaces. Do not mix families within one surface. | 2026-08-01 |

## Retired Exceptions

| Rule | Exception | Location | Rationale | Resolved |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
