# Issue #54 Implementation Plan - Separate Users and Admin Access Areas

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Separate standard user lifecycle actions from privileged access governance in the admin console by creating distinct IA routes, labels, and page responsibilities.

## Current State (Gap Analysis)
## Current Behavior
- Admin shell and routes exist under `/kudos/admin/*`.
- Admin landing currently has tiles for "Manage Admin Users" and "Manage Users" pointing to the same `/kudos/admin/users` route.
- Users page is currently a placeholder and does not clearly separate risk-level operations.

## Gaps
- IA ambiguity: two concepts route to one destination.
- No dedicated route/page for privileged admin role governance.
- No explicit risk/context cues for high-impact access changes.

## Scope
### In Scope
- Introduce explicit split in admin IA:
  - `Users` for account lifecycle operations
  - `Admin Access` for admin privilege governance
- Add dedicated route: `/kudos/admin/admin-access`.
- Update admin shell nav and landing tiles to distinct labels/descriptions.
- Add a dedicated `AdminAccessPage` placeholder with risk-context messaging.
- Keep existing route guards and role restrictions intact.
- Update tests to verify route resolution and navigation behavior.

### Out of Scope
- Full implementation of user/admin management workflows.
- RBAC model beyond current admin/non-admin.
- MFA/step-up authorization flows.

## Proposed Approach
## 1) Route and Constants Update
- Add `ADMIN_ROUTES.adminAccess` in admin route constants.
- Wire new route in App routing under existing `AdminRoute` and `AdminShell`.

## 2) Admin Shell Navigation Update
- Add nav item `Admin Access` with clear intent wording.
- Keep existing `Users` route as lifecycle-focused destination.

## 3) Landing Tile IA Update
- Rename tile labels and subtitles:
  - `Users` -> `Account lifecycle and status`
  - `Admin Access` -> `Grant/revoke privileged roles`
- Ensure each tile routes to a unique target path.

## 4) New Admin Access Page
- Create `AdminAccessPage` component with:
  - explicit high-risk context copy
  - clear TODO scope for role governance functions
  - guardrail notes (for example last-admin protection, audit logging expectations)

## 5) Users Page Messaging Alignment
- Keep users page focused on standard account operations messaging.
- Remove copy overlap with admin privilege operations.

## 6) Tests and Verification
- Update client route tests to verify:
  - `/kudos/admin/users` renders Users section
  - `/kudos/admin/admin-access` renders Admin Access section
  - landing tile navigation routes correctly
  - admin guard behavior remains unchanged for non-admin/unauthenticated users
- Run full client and server test suites.

## Acceptance Criteria Mapping
- Distinct tiles for Users and Admin Access -> labels and routes updated.
- Distinct non-overlapping destinations -> two separate pages/routes verified.
- Admin Access includes risk/context messaging -> page content implemented.
- Route/nav changes preserve guard behavior -> regression tests pass.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Residual label ambiguity | Continued user confusion | Use short, explicit subtitles and consistent naming in nav + tiles |
| Route drift in future stories | Broken IA consistency | Centralize routes in `ADMIN_ROUTES` constants |
| Placeholder pages interpreted as complete | Misaligned expectations | Mark TODO scope clearly and link follow-up stories |

## Dependencies
- Parent epic: #31
- Depends on: #38 (admin shell/routes), #36 (admin guard), #40 (admin governance context)

## Deliverables Checklist
- [ ] Add `/kudos/admin/admin-access` route constant and route wiring
- [ ] Update admin nav with `Admin Access` item
- [ ] Update landing tiles and subtitles for clear IA split
- [ ] Add `AdminAccessPage` placeholder with risk-context messaging
- [ ] Align `Users` page messaging to lifecycle scope
- [ ] Update client route/navigation tests
- [ ] Run client/server regression suites

## Suggested Execution Order
1. Update route constants and app routing
2. Add Admin Access page component
3. Update admin shell nav and landing tile labels/targets
4. Refine Users/Admin Access placeholder copy boundaries
5. Update tests for new route and navigation expectations
6. Run full test suites and finalize closeout notes
