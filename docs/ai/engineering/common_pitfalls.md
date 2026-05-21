# Common Pitfalls

Track recurring implementation issues so they can be proactively checked in reviews and AI prompts.

## Recurring Problems
| ID | Pitfall | Impact | Preventive Check |
| --- | --- | --- | --- |
| CP-001 | Story/TBI route or API paths are ambiguous (for example "admin route" without exact URI). | Implementation lands on incorrect route/endpoint, causing rework and mismatched expectations. | Require explicit canonical paths in issue scope/AC (for example `/kudos/admin/audit-log`, `/api/admin/audit-events`) and verify in tests. |
| CP-002 | UI filter behavior is not explicitly defined (exact match vs partial, default values, clear/reset semantics). | Admin workflows return unexpected results and create trust issues in reporting screens. | In story requirements, define filter match mode, initial defaults, and clear behavior; add tests for each behavior. |

## Pre-Merge Checks
- [ ] Null/empty/error states handled
- [ ] Story/TBI includes explicit UI route and API endpoint paths where applicable
- [ ] Authorization checks present on sensitive operations
- [ ] Input validation covers boundaries and invalid formats
- [ ] Retry/idempotency considered for external calls
- [ ] Telemetry added for key failure paths

## Regression History
| Date | Area | Issue Summary | Guardrail Added |
| --- | --- | --- | --- |
| YYYY-MM-DD | | | |

## Prompt Snippet For AI
Use this before implementation requests:

"Before writing code, review `engineering/common_pitfalls.md` and list which pitfalls apply to this change. Include explicit mitigations in code and tests."
