# Issue #41 Implementation Plan - Foundational Audit Event Layer

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement a foundational, extensible audit layer that captures privileged and security-relevant events, persists them safely, and exposes controlled read access for admin workflows.

## Current State (Gap Analysis)
## Current Behavior
- Application runtime currently has basic console logging only.
- No structured audit event schema or persistence exists in the server.
- No admin-facing API currently exists for querying audit events.

## Gaps
- No centralized audit service entry point.
- No standardized event taxonomy or required event metadata contract.
- No redaction policy enforcement for sensitive metadata.
- No retention policy implementation or documentation.

## Scope
### In Scope
- Define v1 audit event taxonomy and event schema contract.
- Add database migration for `audit_events` storage and indexes.
- Implement centralized audit service module for event writes.
- Emit initial high-value audit events from auth/admin security paths.
- Expose admin-only paginated/filterable audit query API.
- Implement data minimization/redaction policy.
- Add tests and runbook documentation.

### Out of Scope
- SIEM or external log shipping integration.
- Full analytics dashboards and export capabilities.
- Distributed tracing platform integration.

## Proposed v1 Event Contract
Required fields for each persisted event:
- `occurred_at`
- `event_type` (for example `auth.login.success`, `security.authz.denied`)
- `event_version` (start at `1`)
- `result` (`success`, `denied`, `failure`)
- `actor_user_id` (nullable)
- `target_type` (nullable)
- `target_id` (nullable)
- `request_id` (nullable)
- `correlation_id` (nullable)
- `source_ip` (nullable)
- `metadata` (JSONB, redacted/allowlisted)

## Proposed Approach
## 1) Define Audit Taxonomy and Naming Rules
- Create event naming convention for v1 categories:
  - `auth.*`
  - `admin.*`
  - `security.*`
  - `data_lifecycle.*`
- Define stable list of initial event types and metadata keys.

## 2) Add Database Schema and Indexes
- Create migration for `audit_events` table.
- Add indexes for common query paths:
  - `occurred_at DESC`
  - `(event_type, occurred_at DESC)`
  - `(actor_user_id, occurred_at DESC)`
  - `(result, occurred_at DESC)`
- Enforce append-only behavior at application layer (no update/delete API).

## 3) Implement Centralized Audit Service
- Add a single service function (for example `writeAuditEvent`).
- Responsibilities:
  - input validation
  - event normalization
  - metadata redaction/allowlisting
  - persistence
- Ensure behavior is deterministic and testable.

## 4) Emit Initial High-Value Events
- Wire audit writes into first-priority server flows:
  - `auth.login.success`
  - `auth.login.failure`
  - `auth.logout.success`
  - `security.authz.denied`
  - `admin.bootstrap.created` / `admin.bootstrap.promoted` (from #40)
  - `admin.bootstrap.failed` (non-sensitive reason)

## 5) Expose Admin-Only Read API
- Add endpoint under `/api/admin/audit-events`.
- Support:
  - pagination (`page`, `pageSize`)
  - filtering (`from`, `to`, `eventType`, `actorUserId`, `result`)
  - deterministic default sort (`occurred_at desc`)
- Restrict access to admin users only (depends on #36).

## 6) Apply Redaction and Data Minimization Rules
- Never store plaintext passwords, tokens, secrets, or session identifiers.
- Apply key allowlists where possible by event type.
- Add explicit tests for redaction behavior.

## 7) Retention and Operational Guidance
- Define v1 retention policy and environment-specific defaults.
- Document purge/archive strategy (manual or scheduled follow-up job).
- Add runbook notes for audit review during incident response.

## Acceptance Criteria Mapping
- Structured event persistence -> migration + centralized service.
- Denied privileged action captured -> `security.authz.denied` emitted and stored.
- Non-admin cannot query -> admin authorization enforced on read API.
- Deterministic filtered pagination -> API query tests.
- Sensitive metadata excluded -> redaction policy and tests.

## Test Plan
- Unit tests:
  - event validation
  - metadata redaction
  - event normalization
- Integration tests:
  - auth flow event writes
  - denied access event writes
  - admin-only query authorization
  - filter/pagination determinism
- Regression checks:
  - existing auth behavior remains functionally unchanged

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Over-logging sensitive data | Security/privacy exposure | Centralized redaction policy with tests |
| Taxonomy drift between features | Inconsistent reporting/querying | Central event constants and naming convention |
| Query performance degradation | Slow admin log access | Indexed columns and bounded page size |
| Dependency timing with admin authz | Delayed API rollout | Build schema/service first, gate admin API on #36 |

## Dependencies
- Parent epic: #31
- Related: #40, #36

## Deliverables Checklist
- [ ] Audit taxonomy and v1 contract documented
- [ ] `audit_events` migration and indexes implemented
- [ ] Centralized audit write service implemented
- [ ] Initial high-value event emitters wired
- [ ] Admin-only audit query API implemented
- [ ] Redaction/data-minimization policy implemented and tested
- [ ] Retention/runbook documentation added

## Suggested Execution Order
1. Define v1 event contract and taxonomy
2. Implement schema migration and indexes
3. Build centralized audit service
4. Wire initial event emitters
5. Add admin-only query API
6. Add tests and performance sanity checks
7. Finalize runbook and closeout notes
