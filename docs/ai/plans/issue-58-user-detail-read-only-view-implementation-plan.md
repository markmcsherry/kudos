# Issue #58 Implementation Plan - User Detail Read-Only View

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Provide a read-only user detail experience from the admin user directory so admins can inspect profile and lifecycle information before taking any mutation action.

## Current State (Gap Analysis)
## Current Behavior
- User directory list/search/filter is available at `/kudos/admin/users`.
- Users table includes core fields and read-only admin indicator.
- No row-level detail view exists yet.

## Gaps
- Admins cannot inspect full user metadata from the list.
- No explicit detail surface to clarify what is editable now vs deferred.
- No contextual cue to route admin-role changes to Admin Access.

## Scope
### In Scope
- Add user detail read-only view entry from users list.
- Display core profile + lifecycle metadata (name, email, status, role indicator, created/updated timestamps).
- Show admin indicator as informational only.
- Provide explicit cue/link to Admin Access for role-change workflows.
- Add UI tests for opening and rendering detail view.

### Out of Scope
- Any editing controls.
- Password reset/change actions.
- Profile image management.

## Proposed Approach
## 1) Select UX Pattern for Detail View
- Recommended v1 pattern: row action `View` opens read-only modal/dialog.
- Keep users list context visible and avoid route complexity for this iteration.

## 2) Data Contract Reuse
- Reuse data already returned by `/api/admin/users` where sufficient.
- If additional fields are needed later, add a dedicated detail endpoint (`/api/admin/users/:id`) in follow-up.

## 3) Implement Read-Only Detail Surface
- Show fields:
  - full name
  - email
  - status
  - admin indicator
  - created at
  - updated at
- Include message/cue:
  - "Admin access changes are managed in Admin Access" with link to `/kudos/admin/admin-access`.

## 4) Non-Editable Role Handling
- Admin indicator is display-only.
- No role mutation controls in this view.

## 5) Accessibility and Usability
- Modal/dialog supports keyboard open/close flow.
- Escape and close button dismiss details.
- Read-only labels are clear and scannable.

## 6) Test and Verify
- Add client tests:
  - opens detail view from selected row
  - displays expected fields accurately
  - shows admin indicator as non-editable
  - shows cue/link to Admin Access
- Run full client and server suites.

## Acceptance Criteria Mapping
- Open details from list -> row action + detail modal implemented.
- Display metadata and status -> required fields shown.
- Admin visible but non-editable -> informational role indicator only.
- Link/cue to Admin Access -> present and visible in detail view.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep into editing controls | Delays and design ambiguity | Keep detail view read-only with explicit non-editable messaging |
| Missing data for future needs | Partial usefulness | Start with existing fields; add detail endpoint in later story if needed |
| Role-change confusion | Privileged workflow misuse | Add explicit Admin Access cue in detail view |

## Dependencies
- Parent epic: #31
- Depends on: #57 (directory list), #54 (Users/Admin Access split), #36 (admin guard)

## Deliverables Checklist
- [ ] Row-level detail action added in users list
- [ ] Read-only detail modal/dialog implemented
- [ ] Metadata/status/admin indicator rendered accurately
- [ ] Admin Access cue/link included
- [ ] Client tests added/updated
- [ ] Client/server regression suites passing

## Suggested Execution Order
1. Add row-level `View` action in users table
2. Implement detail modal with read-only fields
3. Add Admin Access cue/link for role changes
4. Add tests for modal open/content/non-editable role behavior
5. Run full test suites and finalize closeout notes
