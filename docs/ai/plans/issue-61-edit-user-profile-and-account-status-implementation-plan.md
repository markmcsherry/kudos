# Issue #61 Implementation Plan - Edit User Profile and Account Status

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Enable admins to update user profile fields and lifecycle status (`active`/`inactive`) in one coherent edit flow within `/kudos/admin/users`, while preserving admin guardrails and auditability.

## Current State (Gap Analysis)
## Current Behavior
- Users list/search/filter/pagination exists in `/kudos/admin/users`.
- Read-only user details modal is available (#58).
- Create-user modal flow is available (#59).
- No edit mutation flow currently exists for profile/status updates.

## Gaps
- No API endpoint to update user profile/status from admin users section.
- No edit UI to modify approved fields with inline validation.
- No explicit confirmation step for status transitions.
- No dedicated audit trail for profile/status update outcomes.

## Scope
### In Scope
- Add user edit entry point from users table/detail context.
- Edit approved fields:
  - `firstName`
  - `lastName`
  - `email` (if policy allows; default plan assumes allowed)
  - `status` (`active` / `inactive`)
- Keep `isAdmin` informational only and non-editable.
- Require explicit confirmation when status value changes.
- Validate format and uniqueness constraints (including duplicate email conflict handling).
- Persist updates via admin-only endpoint under `/api/admin/users/:id`.
- Audit log successful and failed update attempts with actor/action/target/outcome metadata.

### Out of Scope
- `isAdmin` role updates (handled in Admin Access).
- Password reset/change.
- Profile picture/media fields.

## Proposed Approach
## 1) API Contract and Authorization
- Add `PATCH /api/admin/users/:id` endpoint in admin users routes.
- Keep route under existing `/api/admin` + `requireAdmin` protections.
- Return updated user payload aligned with users list model.

## 2) Server Validation and Mutation Rules
- Validate request body fields and reject unknown mutation fields.
- Enforce:
  - non-empty first/last name
  - valid email format when provided
  - unique email conflict handling (409)
  - status constrained to `active|inactive`
- Prevent `isAdmin` mutation through this endpoint even if submitted.

## 3) Status Change Confirmation Pattern
- In UI, status change triggers confirmation dialog before final submit.
- Confirmation message should reflect transition direction:
  - Activate user
  - Deactivate user
- Canceling confirmation aborts mutation and leaves form values unchanged unless user edits again.

## 4) UI Integration in Users Page
- Add row-level `Edit` action (or detail-modal `Edit` CTA) in `AdminUsersPage`.
- Implement edit modal with current values prefilled.
- Show `isAdmin` as read-only informational text with Admin Access cue.
- Surface inline field errors and global API errors.

## 5) Audit Logging
- Emit audit events for update attempts with consistent taxonomy, for example:
  - `admin.users.update.success`
  - `admin.users.update.failure`
- Include metadata:
  - actor user id
  - target user id
  - changed field names
  - prior/new status when status changes
  - failure reason code when applicable
- Ensure sensitive data is not logged.

## 6) Test and Verify
- Server tests:
  - unauthenticated/non-admin denied for patch endpoint
  - valid profile update persists
  - duplicate email returns 409 with clear payload
  - status transitions persist correctly
  - blocked `isAdmin` mutation attempt is ignored/rejected per contract
  - audit records exist for success/failure outcomes
- Client tests:
  - edit modal opens with prefilled values
  - inline validation and API conflict feedback render correctly
  - status change requires confirmation and respects cancel path
  - successful save closes modal and refreshes list

## Acceptance Criteria Mapping
- Valid profile save persists -> patch endpoint + success UI flow.
- Invalid/conflicting values blocked with feedback -> inline + API error handling.
- Active->inactive with confirmation -> status transition + confirm dialog.
- Inactive->active with confirmation -> reverse transition + confirm dialog.
- Canceled confirmation makes no change -> confirm-cancel flow test.
- Audit metadata present -> audit assertions in server tests.
- Unauthorized/non-admin denied -> authz tests for patch route.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Edit modal complexity grows | UX confusion and slower delivery | Keep v1 fields minimal; defer extras |
| Confusion between status and admin-role controls | Security/permission mistakes | Keep `isAdmin` read-only; route to Admin Access |
| Validation mismatch client/server | Inconsistent behavior | Server remains source of truth; map field errors to UI |
| Missing audit detail for investigations | Reduced traceability | Standardize event metadata and verify in tests |

## Dependencies
- Parent epic: #31
- Depends on: #36 (admin authz), #41 (audit), #57 (users list)
- Related: #54 (Users/Admin Access split), #58 (detail view), #59 (create user flow)

## Deliverables Checklist
- [ ] `PATCH /api/admin/users/:id` endpoint implemented with validation
- [ ] Admin guard preserved for edit/status mutation endpoint
- [ ] `isAdmin` non-editable in edit flow
- [ ] Edit modal/UX implemented with status confirmation
- [ ] Duplicate email and validation errors surfaced clearly
- [ ] Audit logging implemented for success/failure update attempts
- [ ] Client and server tests added/updated
- [ ] Regression suites passing

## Suggested Execution Order
1. Implement server patch endpoint + validation + guarded field set
2. Add audit logging for success/failure update attempts
3. Add users-page edit modal with prefilled values and submit path
4. Implement status-change confirmation dialog behavior
5. Add/expand server and client tests for all AC scenarios
6. Run full regression suites and draft issue closeout notes
