# Common Pitfalls

Track recurring implementation issues so they can be proactively checked in reviews and AI prompts.

## Recurring Problems
| ID | Pitfall | Impact | Preventive Check |
| --- | --- | --- | --- |
| CP-001 | | | |

## Pre-Merge Checks
- [ ] Null/empty/error states handled
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
