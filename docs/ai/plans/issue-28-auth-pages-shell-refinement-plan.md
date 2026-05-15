# Issue #28 Implementation Plan - Auth Page Header/Footer Refinement

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-16 |
| Status | Draft |
| Version | v0.1 |

## Objective
Complete remaining requirements for issue #28 by refining auth-page header behavior, while preserving the already completed header/footer shell integration.

## Current State (Gap Analysis)
## Already Completed
- Shared header is present on `/login` and `/register`.
- Shared footer is present on `/login` and `/register`.
- Auth page layout uses consistent `header/main/footer` structure.

## Remaining Gaps
- Header still shows links/actions to the current auth page context (self-link behavior not route-aware).
  - On `/login`, login action should not be shown.
  - On `/register`, register action should not be shown.

## Scope
### In Scope
- Add route-aware header action filtering for auth pages.
- Keep existing logged-in behavior unchanged.
- Add/update tests for auth-page-specific header action visibility.

### Out of Scope
- Navigation redesign.
- Auth strategy/session changes.
- Branding changes beyond this behavior fix.

## Proposed Approach
## 1) Route-Aware Header Actions
- In `Header`, detect current route (e.g. using `useLocation`).
- For unauthenticated users:
  - hide login action when pathname is `/login`
  - hide register action when pathname is `/register`
- For other public pages, keep both actions.

## 2) Preserve Existing Authenticated Header State
- Keep current authenticated actions/profile display unchanged.
- Ensure no regressions for `/dashboard` and logged-in landing behavior.

## 3) Test Updates
- Add/adjust client tests to assert:
  - `/login` page: register visible, login hidden
  - `/register` page: login visible, register hidden
  - non-auth public page: both register/login visible
- Keep existing keyboard/focus tests valid after action filtering.

## Acceptance Criteria Mapping
- Shared shell visible on auth pages -> already satisfied; keep regression check.
- No self-link on login/register -> implement and verify with tests.
- Responsive/usable auth layout -> retain existing layout checks.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Route matching too strict | Action visibility bug | Use exact path checks and test both routes explicitly |
| Regressions to existing header behavior | UX inconsistency | Preserve authenticated branch and run full client tests |

## Deliverables Checklist
- [ ] Header route-aware action filtering implemented
- [ ] Auth page action visibility tests added/updated
- [ ] Existing client test suite passes
- [ ] Issue #28 acceptance criteria revalidated

## Suggested Execution Order
1. Implement route-aware header action logic
2. Update/add tests for `/login` and `/register` header behavior
3. Run client lint/tests
4. Verify issue criteria and prepare closeout note
