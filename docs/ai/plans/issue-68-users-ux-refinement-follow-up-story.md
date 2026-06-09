## User Story
As an admin user, I want the Users create/edit/list interactions to be faster and clearer so that I can manage accounts with fewer clicks and less ambiguity.

## Context
- Background:
  - Users management currently supports list/search/filter, create, view, and edit flows under `/kudos/admin/users`.
  - Current status controls and row actions are functional but can be improved for ergonomics and scalability.
- Problem:
  - Some controls feel clunky (two-step status dropdown for a binary state), actions are spread across columns, timestamps are harder to scan, and search requires an extra click after text entry.
- In scope:
  - Add account status field to Create User modal (`active` / `inactive`) with a clear default.
  - Add glossary definitions for account lifecycle terms (`Active`, `Inactive`).
  - Replace Edit User status dropdown with a binary control (radio buttons).
  - Move row actions (`View`, `Edit`) into a per-row meatball menu.
  - Remove `Created` column from users list table.
  - Standardize users-surface timestamp rendering to `yyyy/mm/dd hh:mm`.
  - Support pressing Enter in "Search name or email" to execute the same behavior as Apply.
- Out of scope:
  - Password onboarding/invite policy decisions.
  - Admin role (`isAdmin`) changes (remain in Admin Access).
  - Bulk actions.

## Requirements
- [ ] Create User modal includes `Status` with allowed values `Active` and `Inactive`.
- [ ] Create User status defaults to `Active` unless explicitly changed.
- [ ] Edit User status uses a radio-group binary selector instead of a dropdown.
- [ ] Users list row actions are consolidated in a meatball menu with at least `View` and `Edit`.
- [ ] Users list no longer shows `Created` column.
- [ ] Timestamps in Users surfaces render as `yyyy/mm/dd hh:mm`.
- [ ] Pressing Enter in search field executes the same query behavior as clicking Apply.
- [ ] Empty/loading/error behavior remains clear after these UX changes.

## Done Criteria
- [ ] Code implemented and reviewed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No critical bugs or regressions introduced

## Acceptance Criteria
- [ ] Given an admin opens Create User, when modal loads, then status is visible with `Active` selected by default and can be switched to `Inactive`.
- [ ] Given an admin opens Edit User, when changing status, then a radio control is used and status-change confirmation behavior remains intact.
- [ ] Given an admin views the users list, when reviewing row actions, then `View` and `Edit` are available via row meatball menu.
- [ ] Given an admin views the users list, when scanning columns, then `Created` is not present and `Updated` timestamps are shown in `yyyy/mm/dd hh:mm`.
- [ ] Given an admin enters text in the search field, when pressing Enter, then results refresh exactly as if Apply was clicked.
- [ ] Given no results match search/filter criteria, when query executes, then empty-state messaging remains clear and unchanged in meaning.

## Dependencies and Risks
- Dependencies:
  - Existing user-management baseline stories (`#57`, `#58`, `#59`, `#61`)
  - Admin authz baseline (`#36`)
- Risks:
  - Action discoverability can regress if menu affordance is unclear.
  - Date format requirement may later conflict with localization strategy.
- Mitigations:
  - Use accessible icon button labeling (`Row actions`) and keyboard-friendly menu behavior.
  - Encapsulate date formatting in a utility for easy future localization replacement.

## Notes
- Links:
  - Parent epic: `#31`
  - Related: `#54`, `#57`, `#58`, `#59`, `#61`, `#62`
- Additional details:
  - This is a UX refinement story to improve flow efficiency and consistency, not a scope expansion story.

## Implementation Plan

### Objective
Deliver UX refinements to `/kudos/admin/users` that reduce interaction cost, improve scanability, and preserve current authz/audit behavior.

### Current State (Implementation Gaps)
- Create modal currently captures first name/last name/email/password but not status.
- Edit modal currently uses status dropdown for a binary choice.
- Users table currently exposes direct `View` and `Edit` buttons in separate columns.
- Users list currently includes `Created` and `Updated` with raw ISO formatting.
- Search currently requires explicit Apply click.

### Technical Approach

#### 1) Create User Status Control
- Add `Status` field to create modal with allowed values `active` and `inactive`.
- Default selection to `active`.
- Include `status` in `POST /api/admin/users` request payload.
- Update server create validation/handler to accept optional `status` with safe default `active`.

#### 2) Edit Status Control Ergonomics
- Replace edit status dropdown with radio group (`Active`, `Inactive`).
- Preserve existing status-change confirmation modal behavior.
- Keep backend `PATCH /api/admin/users/:id` contract unchanged (`status` remains `active|inactive`).

#### 3) Row Action Consolidation (Meatball Menu)
- Replace inline `View`/`Edit` action columns with a single `Actions` column.
- Use icon button + accessible menu (`aria-label="Row actions"`) containing `View` and `Edit`.
- Ensure keyboard navigation and focus return behavior after menu close.

#### 4) Timestamp and List Scanability Improvements
- Remove `Created` column from users list table.
- Keep `Created` visible in read-only detail modal.
- Format user-facing timestamps in Users surfaces as `yyyy/mm/dd hh:mm`.
- Centralize formatting in a small utility function for future localization externalization.

#### 5) Enter-to-Search Behavior
- Wire Enter key in "Search name or email" input to execute the same action as Apply.
- Preserve existing filter semantics and query parameter behavior.

#### 6) Docs Alignment
- Keep glossary entries for `Active` and `Inactive` aligned with UI labels and API values.
- Keep role boundary explicit (`isAdmin` changes stay in Admin Access only).

### Test Plan

#### Client tests (`client/tests/admin-users-page.test.jsx`)
- Create modal includes status control and defaults to `Active`.
- Create flow can submit `Inactive` and list reflects inactive chip.
- Edit modal uses radio control for status and still requires confirmation for status change.
- Row actions open from meatball menu and invoke View/Edit flows.
- Table no longer renders `Created` column.
- Timestamp rendering assertions match `yyyy/mm/dd hh:mm`.
- Enter key on search input triggers same query behavior as Apply.
- Existing loading/empty/error states remain clear.

#### Server tests (`server/tests/users.test.js`)
- Create endpoint accepts optional `status` and persists correctly.
- Create endpoint defaults status to `active` when omitted.
- Existing authz/audit hardening assertions remain green.

### Risks and Mitigations
- Action discoverability risk: meatball actions may be missed initially.
  - Mitigation: clear icon affordance, tooltip/aria label, explicit `Actions` column header.
- Formatting drift risk: date formatting inconsistencies across components.
  - Mitigation: route all Users-surface timestamp display through one formatter.
- Behavior regression risk: Enter key handling might double-submit.
  - Mitigation: key handler calls single apply path and has test coverage.

### Deliverables Checklist
- [ ] Create modal status field added with active default
- [ ] Server create endpoint updated for optional status input
- [ ] Edit modal status control converted to radio group
- [ ] Row actions moved into meatball menu
- [ ] `Created` removed from list and timestamps reformatted
- [ ] Enter key triggers search apply behavior
- [ ] Client/server tests updated and passing

### Suggested Execution Order
1. Update server create handler/tests for optional status payload.
2. Update create/edit modal controls (status select + radio group).
3. Implement row actions meatball menu and remove redundant columns.
4. Apply timestamp formatting changes and remove `Created` list column.
5. Add Enter-to-search behavior.
6. Finalize tests and run full client/server suites.
