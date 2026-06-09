# Common Pitfalls

Track recurring implementation issues so they can be proactively checked in reviews and AI prompts.

## Recurring Problems
| ID | Pitfall | Impact | Preventive Check |
| --- | --- | --- | --- |
| CP-001 | Story/TBI route or API paths are ambiguous (for example "admin route" without exact URI). | Implementation lands on incorrect route/endpoint, causing rework and mismatched expectations. | Require explicit canonical paths in issue scope/AC (for example `/kudos/admin/audit-log`, `/api/admin/audit-events`) and verify in tests. |
| CP-002 | UI filter behavior is not explicitly defined (exact match vs partial, default values, clear/reset semantics). | Admin workflows return unexpected results and create trust issues in reporting screens. | In story requirements, define filter match mode, initial defaults, and clear behavior; add tests for each behavior. |
| CP-003 | Mutation endpoints rely on auth middleware but do not consistently assert deny-path auditing/redaction in tests. | Security incidents become harder to investigate and sensitive fields can leak into logs over time. | For each mutation endpoint, add tests for `401` unauthenticated, `403` non-admin, deny audit event presence, and sensitive metadata redaction checks. |
| CP-004 | Binary states are modeled as dropdowns in high-frequency admin workflows. | Extra interaction cost and lower clarity for simple state toggles (for example active/inactive). | Prefer radio buttons or segmented controls for two-option choices; reserve dropdowns for larger option sets. |
| CP-005 | Row actions are placed as standalone buttons early and do not scale as new actions are added. | Table density and usability degrade as actions expand, causing UI churn later. | Start with a row action menu (meatball/kebab) when follow-on actions are likely; enforce keyboard and screen-reader accessibility. |
| CP-006 | Timestamp presentation is inconsistent or too verbose for table scanning. | Slower operational review and avoidable readability complaints. | Define a temporary display standard per surface (for example `yyyy/mm/dd hh:mm`) and centralize formatting utility for later localization upgrades. |
| CP-007 | Search controls require pointer-only submit patterns (button click) without keyboard-equivalent triggers. | Power users experience friction and perceived latency in routine filtering. | Ensure Enter key triggers the same query action as Apply and cover with UI tests. |

## Pre-Merge Checks
- [ ] Null/empty/error states handled
- [ ] Story/TBI includes explicit UI route and API endpoint paths where applicable
- [ ] Authorization checks present on sensitive operations
- [ ] Denied sensitive operations produce auditable security events (`401` and `403` paths)
- [ ] Input validation covers boundaries and invalid formats
- [ ] Audit metadata excludes sensitive keys (for example password/token)
- [ ] Binary selection controls use appropriate UI primitives (radio/segmented vs dropdown)
- [ ] Row action pattern is scalable (menu-based where growth is expected)
- [ ] Search flows support keyboard submit parity (Enter == Apply)
- [ ] Timestamp format is explicitly defined and consistent for the surface
- [ ] Retry/idempotency considered for external calls
- [ ] Telemetry added for key failure paths

## Regression History
| Date | Area | Issue Summary | Guardrail Added |
| --- | --- | --- | --- |
| YYYY-MM-DD | | | |

## Prompt Snippet For AI
Use this before implementation requests:

"Before writing code, review `engineering/common_pitfalls.md` and list which pitfalls apply to this change. Include explicit mitigations in code and tests."
