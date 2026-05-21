# Issue #38 Implementation Plan - Admin Console Shell and Route Structure

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement a dedicated admin shell and route structure under `/kudos/admin/*` so administration is clearly separated from end-user functionality.

## Current State (Gap Analysis)
## Current Behavior
- Baseline admin route and guard already exist for `/kudos/admin`.
- Admin authorization is enforced server-side for `/api/admin/*`.
- Admin login redirect behavior is in place for admin users.

## Gaps
- Full admin sub-route structure is not yet defined and wired.
- Admin shell layout/navigation for all target areas is not standardized.
- Placeholder modules for admin domains are not consistently represented.
- Route-level tests for full `/kudos/admin/*` map are incomplete.

## Scope
### In Scope
- Define and implement admin route map:
  - `/kudos/admin`
  - `/kudos/admin/users`
  - `/kudos/admin/tags`
  - `/kudos/admin/jobs`
  - `/kudos/admin/feature-toggles`
- Implement shared Admin shell layout (header/side navigation/content region).
- Add placeholder cards/tiles on admin landing page for:
  - Manage Admin Users
  - Manage Users
  - Tag Management
  - Certification Management
  - Kudos Management
  - Feature Toggle
- Ensure guarded route rendering for all admin routes.
- Add tests for route resolution and fallback behavior.

### Out of Scope
- Full implementation of each admin feature module.
- Advanced role-based permissions beyond existing admin/non-admin model.
- Final UX polish for each feature page.

## Proposed Approach
## 1) Define Admin Route Contract
- Establish canonical admin route constants for all `/kudos/admin/*` paths.
- Ensure route naming supports expansion and avoids collisions.

## 2) Build Shared Admin Shell
- Create an `AdminShell` layout component with:
  - title/context header
  - navigation links for each admin section
  - content outlet area
- Keep shell visually distinct from end-user dashboard while preserving current design language.

## 3) Add Admin Sub-Route Pages (Placeholder)
- Create placeholder page components for users/tags/jobs/feature toggles.
- Include explicit TODO placeholders and minimal section descriptions.
- Keep each page behind existing `AdminRoute` guard.

## 4) Upgrade Admin Landing Page
- Convert current admin landing to a module-launch surface.
- Add tiles/cards for required admin capabilities with navigation links.
- Add clear TODO labels where functionality is pending.

## 5) Route Guard and Fallback Consistency
- Verify unauthenticated access redirects to `/kudos/login`.
- Verify non-admin access falls back to `/kudos` (or defined forbidden view if later adopted).
- Confirm server API remains source of truth for authorization.

## 6) Tests and Verification
- Add/update client tests to verify:
  - all admin routes resolve under `/kudos/admin/*`
  - admin user can navigate to each route
  - non-admin and unauthenticated fallback behavior
  - admin login flow lands on `/kudos/admin`

## Acceptance Criteria Mapping
- All admin pages resolve under `/kudos/admin/*` -> route map implemented and tested.
- Non-admin protected fallback shown -> guard behavior tested.
- Root-level app expansion remains isolated -> no new root route leakage.
- Admin login lands on Admin Console -> login redirect behavior verified.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Route sprawl/inconsistency | Navigation confusion | Centralize route constants and shared shell |
| Guard regressions on new sub-routes | Unauthorized access risk | Route matrix tests for all admin paths |
| Placeholder drift into stale UX | Confusion for users | Mark TODO explicitly and link follow-up issues |

## Dependencies
- Parent epic: #31
- Related/completed foundations: #35, #36, #37, #40, #41

## Deliverables Checklist
- [ ] Admin route map implemented for all target paths
- [ ] Shared admin shell and nav implemented
- [ ] Landing page tiles/placeholders implemented
- [ ] Placeholder sub-pages created and linked
- [ ] Guard behavior validated across all admin routes
- [ ] Tests updated and passing
- [ ] Documentation updated where route map is referenced

## Suggested Execution Order
1. Define route constants and wire `/kudos/admin/*` map
2. Build shared `AdminShell` layout and navigation
3. Add placeholder pages and landing tiles
4. Validate guard behavior for all routes
5. Add/adjust tests and run full client/server checks
6. Update docs and close with follow-up links for each TODO module
