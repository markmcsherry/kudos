# Issue #36 Implementation Plan - Admin Authentication and Authorization Baseline

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement a secure admin authorization baseline so privileged functionality is clearly separated from end-user capabilities and consistently enforced server-side.

## Current State (Gap Analysis)
## Current Behavior
- End-user routes have been moved under `/kudos/*` and legacy redirects are in place.
- User model now includes `is_admin` and bootstrap tooling exists for initial admin setup.
- Audit infrastructure exists, including `security.authz.denied` events and admin-only audit API.

## Gaps
- No dedicated admin route shell at `/kudos/admin/*` yet.
- No reusable admin middleware/policy module enforcing deny-by-default across future admin APIs.
- No complete protection matrix tests for unauthenticated vs non-admin vs admin across admin boundaries.

## Scope
### In Scope
- Implement baseline admin authorization policy (`is_admin` based).
- Add reusable server middleware/policy checks for admin-only endpoints.
- Define and wire initial admin UI route namespace under `/kudos/admin/*`.
- Ensure unauthenticated and non-admin access paths are blocked with consistent behavior.
- Add audit events for denied admin access attempts (using existing audit layer).
- Add tests for route and API protection behavior.

### Out of Scope
- Full RBAC permissions matrix.
- MFA/step-up authentication.
- Advanced admin feature pages beyond baseline route and access control.

## Proposed Approach
## 1) Standardize Admin Policy Module
- Add a dedicated admin policy helper/middleware in server auth layer.
- Policy behavior:
  - unauthenticated -> `401 Unauthorized`
  - authenticated non-admin -> `403 Forbidden`
  - admin -> allow
- Emit `security.authz.denied` audit event for blocked attempts.

## 2) Protect Admin API Namespace
- Define baseline admin namespace `/api/admin/*`.
- Apply admin policy middleware at router level to avoid per-endpoint duplication.
- Keep deny-by-default semantics for all routes mounted in this namespace.

## 3) Establish Admin UI Route Namespace
- Add placeholder/admin shell routes under `/kudos/admin/*` in client router.
- Enforce frontend guard behavior for non-admin users:
  - redirect to login if unauthenticated
  - show forbidden state or safe redirect for non-admin users
- Keep server API authorization as the source of truth.

## 4) Align Auth User Context
- Ensure user context exposes `isAdmin` consistently from login and `/auth/me`.
- Verify route guards consume this value safely without assuming trust beyond server checks.

## 5) Tests and Verification
- Server integration tests:
  - unauthenticated admin API access -> `401`
  - non-admin admin API access -> `403`
  - admin access -> success
- Client tests:
  - non-admin cannot access admin route content
  - unauthenticated users are redirected to `/kudos/login`
- Audit verification:
  - denied admin API attempts produce audit events.

## Acceptance Criteria Mapping
- Restrict `/kudos/admin/*` routes and `/api/admin/*` endpoints -> implemented and verified.
- Deny-by-default behavior for non-admin users -> enforced by reusable admin policy.
- Middleware tests in CI -> integration tests added and passing.
- Security visibility -> denied access events captured in audit log.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Inconsistent checks across endpoints | Authorization bypass risk | Enforce router-level middleware for `/api/admin/*` |
| Frontend-only protection assumptions | Security gap | Keep server-side policy as source of truth |
| Admin route UX ambiguity | Confusing user behavior | Define consistent redirect/forbidden behavior and test it |

## Dependencies
- Parent epic: #31
- Depends on: #40 (admin bootstrap), #41 (audit layer)
- Related: #35 (route namespace migration)

## Deliverables Checklist
- [ ] Admin policy middleware/module implemented
- [ ] Admin API namespace protected by middleware
- [ ] Client admin route namespace established (`/kudos/admin/*`)
- [ ] Denied access audit events verified
- [ ] Server and client tests added/updated and passing
- [ ] Documentation updated for admin access model

## Suggested Execution Order
1. Implement reusable server admin policy middleware
2. Apply middleware to `/api/admin/*` namespace
3. Add baseline client admin route namespace and guard behavior
4. Add integration and UI tests for protection matrix
5. Verify audit event emission and update docs
