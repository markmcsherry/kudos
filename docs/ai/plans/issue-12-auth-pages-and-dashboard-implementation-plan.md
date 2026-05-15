# Issue #12 Implementation Plan - Auth Pages and User Dashboard

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-15 |
| Status | Draft |
| Version | v0.1 |

## Objective
Deliver initial auth-facing user experience with register, login, and protected user dashboard pages, using Passport for basic authentication and static mocked kudos display on the dashboard.

## References
- Issue: `#12 [User Story] Add initial pages including register, login and user landing page`
- `docs/ai/master_spec.md`
- `docs/ai/specs/requirements.md`
- `docs/ai/specs/design_spec.md`
- `docs/ai/specs/architecture_concept.md`
- `docs/ai/quality/testing_strategy.md`
- `docs/ai/quality/security_baseline.md`

## Scope
### In Scope
- Frontend routes/pages:
  - `/register`
  - `/login`
  - `/dashboard`
- Required form fields and validation messages
- Basic Passport-based authentication flow
- Protected dashboard routing for unauthenticated users
- Static mocked kudos rendering on dashboard (minimum 3 records)

### Out of Scope
- Forgot/reset password
- Email verification
- MFA/social login
- Full profile management
- Production-grade auth hardening beyond baseline guardrails

## Work Breakdown
## 1) Frontend Routing and Layout
- Add route definitions for register/login/dashboard.
- Keep shared visual language consistent with existing app theme/layout.
- Add auth guard behavior:
  - if user is not authenticated, dashboard route redirects to login.

## 2) Register and Login Pages
- Register form fields:
  - first name
  - second name
  - email
  - password
- Login form fields:
  - email
  - password
- Add client-side form validation and clear inline error display.
- Add loading, success, and error submission states.

## 3) Basic Passport Integration
- Add/confirm Passport local strategy wiring.
- Backend endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout` (recommended)
- Ensure generic authentication error messages.
- Ensure password hashing and no plaintext logging/storage.

## 4) Dashboard Page and Mocked Kudos
- Build dashboard shell with tiles:
  - Create Kudos
  - My Kudos Received
- Add static mocked kudos list (temporary):
  - at least 3 items
  - each includes: from, to, description, date, type
- Keep mock data colocated and clearly marked for replacement by API data.

## 5) Security Guardrails (Minimum)
- Validate required fields and email format server-side.
- Enforce minimum password policy.
- Use generic login failures (no account enumeration).
- Protect dashboard route and related endpoints.
- Confirm auth/session cookie defaults where applicable (`httpOnly`, `sameSite`, `secure` in prod).

## 6) Documentation Updates
- Update `README.md` with:
  - auth setup/run instructions
  - test user/demo flow
  - known temporary behavior (mocked dashboard kudos)
- Record any auth design decisions in `docs/ai/decisions/decision_log.md`.

## Test Plan
## Component Tests
- Register page renders required fields.
- Login page renders required fields.
- Dashboard renders required tiles.
- Dashboard renders mocked kudos list with at least 3 items.

## Integration Tests
- Successful login redirects to `/dashboard`.
- Unauthenticated access to `/dashboard` redirects to `/login`.
- Invalid login shows generic error messaging.

## Security-Focused Tests
- Passwords are not returned in auth responses.
- Register/login validation rejects missing required fields.
- Login failure does not disclose account existence.

## Acceptance Mapping
- Register fields present -> register render tests.
- Login fields present -> login render tests.
- Dashboard tiles present -> dashboard render tests.
- Mocked kudos visible -> dashboard mock-data tests.
- Auth redirect behavior -> route integration tests.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep into advanced auth | Delivery delay | Keep this story limited to basic Passport auth + page flow |
| Security debt from quick auth | Future vulnerabilities | Enforce minimum guardrails now and track follow-up hardening |
| Mock data confusion | Rework and ambiguity | Clearly mark mocked data and create follow-up API integration task |

## Deliverables Checklist
- [ ] Register page implemented
- [ ] Login page implemented
- [ ] Protected dashboard page implemented
- [ ] Passport basic auth endpoints integrated
- [ ] Static mocked kudos list added to dashboard
- [ ] Tests for route, form, and dashboard behavior
- [ ] Documentation and decision log updates

## Suggested Execution Order
1. Route scaffolding + page shells
2. Register/login form implementation
3. Passport auth integration
4. Dashboard tiles + mocked kudos list
5. Route protection and auth redirects
6. Tests
7. Docs and final verification
