# Issue #35 Implementation Plan - Move Existing Routes to /kudos

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Move existing end-user routes under `/kudos/*` to establish route namespace separation, preserve user flows, and unblock admin namespace implementation under `/kudos/admin/*`.

## Current State (Gap Analysis)
## Current Behavior
- Existing user-facing routes are currently rooted at `/` and other root paths.
- Planned admin capabilities require a dedicated `/kudos/admin/*` namespace.

## Gaps
- Canonical end-user paths under `/kudos/*` are not yet established.
- Backward-compatible redirect behavior from old root paths is not yet defined/implemented.
- Auth and navigation flows may break if path changes are made without coordinated updates.

## Scope
### In Scope
- Define and implement canonical end-user routes under `/kudos/*`.
- Update route guards, navigation links, and auth redirects to canonical paths.
- Implement old-to-new redirects for legacy root routes.
- Add/update tests for route resolution, redirects, and auth flow behavior.
- Update relevant docs to reflect canonical route paths.

### Out of Scope
- Admin authorization logic and policy enforcement (tracked in issue #36).
- New admin features/pages beyond namespace preparation.
- Multi-product root landing implementation beyond current redirect behavior.

## Proposed Route Mapping
| Old Route | New Canonical Route | Redirect Strategy | Notes |
| --- | --- | --- | --- |
| `/` | `/kudos` | 302/307 initially, later 301/308 | Keep option to repurpose `/` for multi-product entry in future |
| `/login` | `/kudos/login` | 302/307 initially, later 301/308 | Update all internal links/forms |
| `/register` | `/kudos/register` | 302/307 initially, later 301/308 | Preserve safe query params only |
| `/dashboard` | `/kudos/dashboard` | 302/307 initially, later 301/308 | Use final logged-in landing route if different |

## Proposed Approach
## 1) Define Canonical Route Contract
- Finalize the canonical user route set under `/kudos/*`.
- Document legacy root routes and mapped destinations.
- Confirm redirect status code policy for rollout.

## 2) Refactor Client/Server Routing
- Update router definitions to use canonical `/kudos/*` paths.
- Ensure server-side routing handles direct navigation/refresh for `/kudos/*`.
- Confirm no collisions with reserved admin namespace (`/kudos/admin/*`).

## 3) Update Auth and Navigation Flows
- Update login/register/logout and post-login redirect destinations.
- Ensure route guards continue to protect authenticated pages as before.
- Validate `returnTo` handling and prevent open-redirect behavior.

## 4) Implement Legacy Redirects
- Add explicit old-to-new redirects for mapped legacy routes.
- Preserve safe query strings where appropriate.
- Keep redirect behavior deterministic and documented.

## 5) Test and Verify
- Add/update tests for:
  - canonical route resolution
  - old route redirect mapping
  - authenticated vs unauthenticated guard behavior
  - direct URL access and browser refresh behavior
  - `returnTo` safety checks
- Run full relevant test suites and fix regressions.

## Acceptance Criteria Mapping
- End-user routes available under `/kudos/*` -> implemented and validated.
- Legacy paths continue to function via redirects -> implemented and tested.
- Auth behavior unchanged functionally after migration -> verified via tests.
- Admin namespace can be introduced without route conflict -> validated in route design.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Incomplete redirect mapping | Broken bookmarks/deep links | Maintain explicit old->new mapping and test each route |
| Auth regressions after path changes | Login/access failures | Add integration tests for auth flow before/after migration |
| Route handling mismatch on refresh | 404s on direct URL access | Validate server fallback behavior for canonical client routes |
| Open redirect via query params | Security exposure | Validate/allowlist redirect targets |

## Dependencies
- Parent epic: #31
- Unblocks: #36

## Deliverables Checklist
- [ ] Canonical `/kudos/*` route contract finalized
- [ ] Router and navigation updates implemented
- [ ] Legacy redirect mappings implemented
- [ ] Auth flow paths updated and validated
- [ ] Tests added/updated and passing
- [ ] Docs updated with canonical route map

## Suggested Execution Order
1. Finalize route contract and mapping
2. Refactor canonical routes under `/kudos/*`
3. Update auth/navigation paths
4. Add legacy redirects
5. Update tests and run verification
6. Update docs and close issue with validation notes
