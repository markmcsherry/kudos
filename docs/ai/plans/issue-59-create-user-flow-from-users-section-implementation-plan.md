# Issue #59 Implementation Plan - Create User Flow from Users Section

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Enable admins to create standard (non-admin) user accounts directly from `/kudos/admin/users` via an in-context modal so onboarding can happen without leaving the user directory workflow.

## Current State (Gap Analysis)
## Current Behavior
- Users page supports list/search/filter/pagination at `/kudos/admin/users`.
- User detail read-only modal flow exists (#58).
- No create action is currently available in the users section.

## Gaps
- Admins cannot create new users from the users list context.
- No v1 create modal for required onboarding fields.
- No create-user audit event emitted from this admin workflow.

## Scope
### In Scope
- Add a prominent primary `Create User` button above the users table/list.
- Implement create-user modal dialog with required inputs:
  - first name
  - last name
  - email
  - password (enforced per existing password policy)
- Add client-side required/format validation and surface API validation errors inline.
- Support explicit cancel/close with no side effects.
- On success: close modal and refresh/requery users list.
- Ensure server creates users as non-admin by default.
- Audit log successful create action with actor/action/target metadata.

### Out of Scope
- Admin role assignment (`isAdmin`) during create.
- Invite/email verification orchestration.
- Profile photo upload or extended profile fields.

## Proposed Approach
## 1) UX Integration in Users Page
- Add primary `Create User` button near existing filters/actions in `AdminUsersPage`.
- Open modal dialog that keeps list context visible behind overlay.
- Preserve existing users list state when modal is canceled.

## 2) API and Data Contract
- Add `POST /api/admin/users` endpoint under existing admin guard.
- Request payload:
  - `firstName`
  - `lastName`
  - `email`
  - `password`
- Response returns created user summary needed for list refresh, or rely on refetch strategy.

## 3) Server Validation and Defaults
- Reuse central validation rules where possible (especially password policy and email normalization).
- Enforce unique email behavior with clear conflict response for duplicate email.
- Force `isAdmin = false` on create in this flow.
- Apply default user lifecycle status per schema conventions (for example `active` where applicable).

## 4) Audit Logging
- Emit audit event on successful create with:
  - actor: authenticated admin id
  - event type: user create action type aligned to existing audit taxonomy
  - target: created user id/email
  - result: success/failure as supported by current audit layer
- Ensure sensitive fields (password) are never logged.

## 5) Modal Behavior and Accessibility
- Modal supports keyboard navigation and focus trapping.
- Enter submits when valid; Escape/Close/Cancel dismisses without mutation.
- Inline field-level errors are readable and associated to inputs.
- Submit button disabled or guarded during in-flight request to prevent duplicate submission.

## 6) Test and Verify
- Client tests:
  - `Create User` button visibility in users page header area.
  - modal open/close behaviors.
  - invalid input shows inline errors and blocks submit.
  - duplicate/invalid email API error appears clearly.
  - successful create closes modal and refreshes list.
- Server tests:
  - unauthenticated and non-admin denied for create endpoint.
  - valid create persists non-admin user with expected defaults.
  - duplicate email returns conflict/validation response.
  - audit event is written with expected metadata and without sensitive data.

## Acceptance Criteria Mapping
- Create button visible above list -> add primary action on users page.
- Clicking button opens create modal -> modal trigger + dialog rendering.
- Invalid input blocked with inline errors -> field and API validation surfaces.
- Duplicate/invalid email feedback -> explicit error messaging in modal.
- Valid create closes modal and updates list -> success path + refetch/re-render.
- Cancel/close produces no side effects -> dismiss path verified.
- Created user defaults to non-admin -> server-side enforced default.
- Audit metadata present after create -> event persisted and queryable.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Frontend/backend validation drift | Confusing UX and inconsistent rules | Keep backend as source of truth and map API errors directly in modal |
| Duplicate submits during latency | Multiple accidental user creations | Disable submit while request is in-flight and make endpoint idempotency-aware where feasible |
| Password handling leakage | Security/privacy incident | Never log raw password; redact sensitive request fields |
| Scope expansion into onboarding workflow | Delays for v1 delivery | Keep modal fields minimal and defer invites/verification to follow-up stories |

## Dependencies
- Parent epic: #31
- Depends on: #57 (users directory), #36 (admin authz baseline), #41 (audit layer)
- Related: #54 (Users/Admin Access split), #58 (user detail read-only)

## Deliverables Checklist
- [ ] Primary `Create User` button added above users list
- [ ] Create-user modal implemented with required fields
- [ ] Validation and inline error handling implemented
- [ ] `POST /api/admin/users` endpoint implemented under admin guard
- [ ] Create flow enforces non-admin default
- [ ] Successful create refreshes users list and closes modal
- [ ] Create action audit logging implemented
- [ ] Client and server tests added/updated
- [ ] Regression suites passing

## Suggested Execution Order
1. Add admin users create endpoint and validation contract
2. Wire audit logging for successful create operation
3. Add `Create User` button and modal UI in users page
4. Connect modal submit/cancel behavior and list refresh path
5. Add client/server tests for success/failure/authz/audit cases
6. Run regression suites and prepare issue closeout notes
