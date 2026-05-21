# Issue #37 Implementation Plan - Admin Login/Logout and Hardened Session Controls

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Provide a secure admin login/logout flow with hardened session handling and protection against repeated failed login attempts.

## Current State (Gap Analysis)
## Current Behavior
- Session auth is enabled with `express-session` and Passport local strategy.
- Admin authorization baseline exists (`is_admin`, `/kudos/admin`, `/api/admin/*` middleware).
- Auth auditing is in place for login/logout success/failure and authz denials.

## Gaps
- No dedicated admin login entry behavior or flow guard for admin-only experience.
- Session timeout is currently fixed and not split into idle vs absolute admin policy.
- No throttling/lockout guard for repeated failed login attempts.
- Session hardening policy is not explicitly documented/tested for admin-risk profile.

## Scope
### In Scope
- Add admin login entry path alignment with `/kudos/admin` flow.
- Harden session controls for admin-risk actions:
  - secure cookie settings review
  - idle timeout enforcement
  - absolute timeout enforcement
- Add repeated-failure throttling/lockout for login endpoint.
- Emit audit events for lockout/throttle and session timeout behavior.
- Add server and client tests for login/logout and timeout/lockout behavior.
- Update docs/runbook with policy defaults and env overrides.

### Out of Scope
- MFA and step-up authentication (separate follow-up story).
- External IAM/SSO integration.
- Full account recovery and unlock workflow UI.

## Proposed Approach
## 1) Define Session Policy Contract
- Introduce environment-configurable session policy values:
  - `SESSION_IDLE_TIMEOUT_MS`
  - `SESSION_ABSOLUTE_TIMEOUT_MS`
  - keep secure cookie defaults (`httpOnly`, `sameSite`, `secure` in prod)
- Store login timestamp and last activity timestamp in session.

## 2) Enforce Idle and Absolute Session Timeouts
- Add middleware to validate session age/activity on authenticated requests.
- If session exceeds idle or absolute threshold:
  - invalidate session
  - return `401` or redirect to `/kudos/login` as appropriate
  - emit audit event (`auth.session.timeout`).

## 3) Implement Login Throttle/Lockout Guard
- Add rate limit logic for `/auth/login` keyed by normalized email + source IP.
- Suggested baseline policy (configurable):
  - failure window (for example 15 minutes)
  - threshold (for example 5 failed attempts)
  - lockout duration (for example 15 minutes)
- On lockout, return deterministic error and emit audit event (`auth.login.locked`).

## 4) Align Admin Entry Flow
- Ensure admin users can authenticate and proceed to `/kudos/admin`.
- Ensure non-admin users cannot use admin entry to access privileged pages.
- Keep existing user login flow intact for `/kudos/dashboard`.

## 5) Logout Hardening
- Ensure logout always clears session and cookie state.
- Verify no authenticated access remains after logout.
- Emit audit event for successful logout (`auth.logout.success`) and forced timeout logout if applicable.

## 6) Test and Verify
- Server tests:
  - valid login/logout path
  - lockout after threshold failures
  - session timeout invalidation
  - admin vs non-admin post-login authorization behavior
- Client tests:
  - admin route entry redirects properly based on auth state
  - logout returns to login and blocks protected routes

## Acceptance Criteria Mapping
- Valid admin credentials create authenticated session -> verified via login + admin route/API access tests.
- Logout invalidates session -> verified by post-logout access denial.
- Repeated failures trigger throttle/lockout -> verified with deterministic lockout response.
- Session inactivity triggers re-authentication -> verified through idle timeout tests.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Overly aggressive lockout harms UX | Admin access disruption | Configurable thresholds and clear operator docs |
| Inconsistent timeout enforcement | Security gap | Centralized session validation middleware |
| Session policy drift by environment | Unpredictable behavior | Explicit env defaults + documentation |

## Dependencies
- Parent epic: #31
- Related: #36 (admin authz baseline), #40 (admin bootstrap), #41 (audit layer)

## Deliverables Checklist
- [ ] Session policy config and middleware implemented
- [ ] Idle and absolute timeout enforcement added
- [ ] Login lockout/throttling controls implemented
- [ ] Audit events for lockout/timeouts verified
- [ ] Server/client tests updated and passing
- [ ] README/runbook updated with session/lockout policy

## Suggested Execution Order
1. Add session policy configuration and middleware scaffolding
2. Implement idle and absolute timeout checks
3. Implement login failure tracking and lockout enforcement
4. Align admin entry flow behavior and responses
5. Add/adjust tests and run full verification
6. Update docs and close with operational guidance
