# Issue #57 Implementation Plan - User Directory List + Search/Filter

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement a functional admin user directory at `/kudos/admin/users` with partial, case-insensitive search across name/email, status filtering, and deterministic paginated results.

## Current State (Gap Analysis)
## Current Behavior
- Admin shell and route namespace are available under `/kudos/admin/*`.
- Users page currently exists as placeholder content only.
- Admin guard and audit infrastructure already exist.

## Gaps
- No user list/table rendering.
- No search or status filtering UI wired to backend.
- No pagination model for user directory scale.
- No tests covering partial/case-insensitive search semantics.

## Scope
### In Scope
- Build users table/list with key fields:
  - name
  - email
  - status
  - created/updated timestamps
  - admin indicator (read-only informational)
- Add single search input across `firstName`, `lastName`, `email`.
- Enforce partial, case-insensitive, contains-based matching semantics.
- Add status filter (`all`, `active`, `inactive`).
- Add deterministic server-driven pagination.
- Add empty/loading/error states.

### Out of Scope
- Fuzzy typo-tolerant search.
- Full-text ranking/relevance search.
- Bulk destructive operations.

## Proposed Approach
## 1) API Contract Alignment
- Confirm/implement admin endpoint for user directory (recommended under `/api/admin/users`).
- Query params:
  - `page`
  - `pageSize`
  - `search` (single text input)
  - `status` (`all`/`active`/`inactive` or empty for all)
- Response shape:
  - `items[]`
  - `total`
  - `page`
  - `pageSize`
- Sort deterministically (for example by `created_at DESC, id DESC` or agreed business sort).

## 2) Backend Search Semantics
- Implement contains-based search across normalized fields:
  - `LOWER(first_name)`
  - `LOWER(last_name)`
  - `LOWER(email)`
- Ensure case-insensitive behavior.
- Combine with status filter and pagination in one query.

## 3) Frontend Users Page Implementation
- Replace placeholder in `AdminUsersPage` with:
  - search input
  - status dropdown
  - results table
  - pagination controls
  - state handling (loading/empty/error)
- Keep `isAdmin` read-only in list presentation with clear cue that role changes belong in Admin Access.

## 4) UX Behavior Rules
- Search applies with explicit action (or debounced input if chosen; pick one and keep consistent).
- Search query empty -> default paginated list.
- Search + status filter combine cumulatively.
- Pagination resets to page 1 on new search/filter application.

## 5) Test Coverage
- Backend tests:
  - partial search returns expected users
  - case-insensitive matching works
  - status filter behavior
  - pagination deterministic behavior
  - authz checks for non-admin/unauthenticated
- Frontend tests:
  - renders table + controls
  - search interaction and result updates
  - status filter interaction
  - empty/loading/error states

## Acceptance Criteria Mapping
- User list visible with pagination -> table + API pagination.
- `jo` query returns matching name/email contains results -> search semantics tests.
- `SMITH` case-insensitive matching -> search tests.
- Empty search returns default list -> UI + API behavior.
- Status filter combines with search -> integration tests.
- Clear empty-state when no matches -> UI state validation.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Search semantics drift (UI vs API) | Incorrect expectations and regressions | Explicit API contract and automated tests for partial/case-insensitive behavior |
| Poor performance on larger data | Slow admin workflow | Add indexes for email/name/status and server-side pagination |
| Role-management confusion in Users area | Privileged changes in wrong context | Keep `isAdmin` read-only and link/guide to Admin Access |

## Dependencies
- Parent epic: #31
- Depends on: #36, #38, #54
- Related: #40, #41

## Deliverables Checklist
- [ ] Admin users API endpoint with search/filter/pagination
- [ ] Users page UI with search + status filter + table
- [ ] Empty/loading/error states implemented
- [ ] Read-only admin indicator added to table
- [ ] Backend and frontend tests added/updated
- [ ] Full regression test suites pass

## Suggested Execution Order
1. Finalize backend API contract and query semantics
2. Implement backend search/filter/pagination endpoint
3. Implement users UI with controls and table
4. Add pagination and state handling
5. Add test coverage for semantics and guard behavior
6. Run full test suites and finalize closeout notes
