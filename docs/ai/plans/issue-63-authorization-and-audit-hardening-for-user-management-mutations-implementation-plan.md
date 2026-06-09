# Issue #63 Implementation Plan - Authorization and Audit Hardening for User-Management Mutations

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Enforce consistent admin authorization and complete audit coverage across all user-management mutation endpoints, including denied-attempt traceability and sensitive-data protection.

## Current State (Gap Analysis)
## Current Behavior
- Admin guard baseline exists under `/api/admin` (`#36`).
- Foundational audit service and admin audit views exist (`#41`, `#42`, `#55`).
- User-management mutation endpoints now include create and edit flows (`#59`, `#61`).

## Gaps
- Hardening needs a single cross-endpoint verification pass to prevent drift.
- Denied-access audit behavior may not be uniformly asserted for every mutation path.
- Mutation endpoint checklist is not yet codified as a repeatable guardrail.

## Scope
### In Scope
- Inventory all current user-management mutation endpoints.
- Verify each mutation endpoint enforces admin-only authorization.
- Ensure deterministic deny responses:
  - `401` for unauthenticated
  - `403` for authenticated non-admin
- Ensure success and denied attempts both emit structured audit events.
- Ensure sensitive fields never persist in audit metadata.
- Add/expand test coverage for positive and negative authz/audit paths.

### Out of Scope
- UI/UX changes.
- SIEM forwarding/export pipelines.
- Reworking Admin Access product behavior beyond authz/audit consistency.

## Proposed Approach
## 1) Mutation Endpoint Inventory and Contract Matrix
- Build a mutation matrix (path, method, expected authz, expected audit events):
  - `POST /api/admin/users`
  - `PATCH /api/admin/users/:id`
  - any additional user-management mutation routes currently in admin namespace
- Document expected outcomes and audit event taxonomy per endpoint.

## 2) Authorization Guardrail Normalization
- Confirm all mutation endpoints live under `/api/admin` and inherit `requireAdmin`.
- For any exceptions, explicitly apply `requireAdmin` middleware.
- Ensure response behavior is consistent and deterministic for deny cases.

## 3) Audit Event Coverage Normalization
- For each mutation endpoint, verify event coverage for:
  - success (`...success`)
  - deny/forbidden (`...denied` or equivalent authz event)
  - failure (`...failure` where applicable)
- Standardize minimum metadata set:
  - actor user id
  - target type/id
  - action/event type
  - result/outcome
  - source IP
  - timestamp (from audit row)

## 4) Sensitive Data Protection
- Verify metadata allowlist/redaction paths block sensitive keys (`password`, `token`, etc.).
- Ensure mutation handlers do not pass sensitive raw payload values into audit metadata.
- Add explicit tests proving sensitive fields are excluded.

## 5) Test Expansion and Hardening
- Server tests per mutation endpoint:
  - unauthenticated -> `401`
  - non-admin authenticated -> `403`
  - admin success -> mutation persists + audit success event
  - denied attempts -> audit deny/security event present
  - redaction assertions for sensitive metadata
- Keep assertions deterministic for status/error payload shape where practical.

## 6) Documentation and Operational Guardrails
- Add/refresh engineering note that every new mutation endpoint must include:
  - admin authz assertion tests
  - deny-path audit assertions
  - sensitive metadata redaction assertions
- Optionally add a lightweight endpoint checklist in `docs/ai/engineering/common_pitfalls.md`.

## Acceptance Criteria Mapping
- All mutation endpoints admin-only -> endpoint inventory + guard verification complete.
- 401/403 deny semantics consistent -> negative-path tests enforce exact status behavior.
- Successful mutations audited with required metadata -> success audit assertions per endpoint.
- Denied mutations audited -> deny audit assertions per endpoint.
- Tests pass -> expanded server suite green.
- Sensitive payload not persisted -> redaction tests pass.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| New mutation endpoint added without hardening | Security drift | Maintain mutation checklist and required test pattern |
| Inconsistent audit taxonomy | Harder incident triage | Define and follow endpoint event naming conventions |
| Sensitive data leakage in metadata | Security/privacy risk | Enforce redaction and add explicit regression tests |

## Dependencies
- Parent epic: #31
- Depends on: #36 (admin authz), #41 (audit layer)
- Related: #54, #57, #59, #61

## Deliverables Checklist
- [ ] Mutation endpoint matrix documented and reviewed
- [ ] Admin authz verified across all user-management mutation endpoints
- [ ] Deny behavior standardized (`401`/`403`)
- [ ] Success/failure/deny audit coverage implemented consistently
- [ ] Sensitive metadata redaction verified with tests
- [ ] Server tests expanded for positive + negative hardening paths
- [ ] Documentation/checklist updated for future mutation endpoints

## Suggested Execution Order
1. Build and validate mutation endpoint inventory/matrix
2. Normalize authz behavior across endpoints (`401`/`403`)
3. Normalize audit event coverage for success/deny/failure
4. Add redaction-focused regression tests
5. Expand server test suite for full hardening coverage
6. Update docs/checklist and prepare closeout evidence
