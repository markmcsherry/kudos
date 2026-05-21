# Issue #40 Implementation Plan - Bootstrap Admin User

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement a secure, repeatable bootstrap process for initial admin creation/promotion without direct database edits.

## Current State (Gap Analysis)
## Current Behavior
- Users can register/login, but no first-class admin bootstrap capability exists.
- Admin role metadata now exists in schema (`users.is_admin`) but no operational flow manages first admin creation.

## Gaps
- No command-driven bootstrap for initial admin creation.
- No explicit operator-intent guard for promoting existing users.
- No audit visibility for bootstrap actions.

## Scope
### In Scope
- Add bootstrap script to create or promote admin users via controlled env inputs.
- Enforce explicit promotion intent for existing non-admin users.
- Keep operation idempotent for existing admin users.
- Emit audit events for bootstrap create/promote/noop/failure outcomes.
- Add tests for bootstrap behavior and `is_admin` propagation through auth user context.
- Update runbook/README usage for local and non-local environments.

### Out of Scope
- Full role-based permissions matrix.
- Admin UI for role management.
- MFA and step-up authentication policy.

## Proposed Approach
## 1) Add Bootstrap Command
- Add `server/db/scripts/bootstrap-admin.js` and npm script `db:bootstrap-admin`.
- Required env vars:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Optional env vars:
  - `ADMIN_FIRST_NAME` (default `Admin`)
  - `ADMIN_LAST_NAME` (default `User`)
  - `ADMIN_PROMOTE_EXISTING=true` required to promote existing non-admin user.

## 2) Reuse Auth-Compatible Hashing and User Writes
- Use existing auth-compatible hashing flow and user store paths.
- Ensure script-created users can log in without special casing.

## 3) Enforce Safety and Intent
- Fail safely if required env values are missing or invalid.
- If user exists and is non-admin, require `ADMIN_PROMOTE_EXISTING=true`; otherwise fail with actionable message.
- If user already admin, exit successfully with noop message.

## 4) Emit Audit Events
- Emit events for:
  - `admin.bootstrap.created`
  - `admin.bootstrap.promoted`
  - `admin.bootstrap.noop`
  - `admin.bootstrap.failed`
- Ensure sensitive fields (for example `password`) are never persisted in metadata.

## 5) Tests and Verification
- Add tests for:
  - `isAdmin` field returned through auth flows.
  - Promotion behavior path (existing non-admin -> admin).
  - Safety behavior when promotion intent is not explicit.
- Run server and client tests for regression confidence.

## Acceptance Criteria Mapping
- Non-admin default role after migration -> already enforced by schema.
- Bootstrap command creates/promotes admin -> implemented and verified.
- Idempotent rerun behavior -> noop path implemented and verified.
- Admin status available in user context -> auth tests verify.
- Missing bootstrap inputs fail safely -> script validates and exits non-zero.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Accidental privilege elevation | Security exposure | Require explicit promote flag for existing user |
| Secret leakage in logs | Security exposure | Never log password; rely on redacted audit metadata |
| Hashing mismatch with auth login | Login failures | Reuse existing user-store/hash flow |

## Dependencies
- Parent epic: #31
- Related: #36, #41

## Deliverables Checklist
- [ ] Bootstrap admin script implemented
- [ ] NPM scripts wired (`db:bootstrap-admin`)
- [ ] Explicit promotion safety guard implemented
- [ ] Bootstrap audit events emitted
- [ ] Tests updated and passing
- [ ] README/runbook usage updated

## Suggested Execution Order
1. Implement bootstrap script and npm wiring
2. Add safety checks and explicit promotion intent gate
3. Emit bootstrap and user-flow audit events
4. Add tests for admin propagation/promotion behavior
5. Run test suites and update docs
