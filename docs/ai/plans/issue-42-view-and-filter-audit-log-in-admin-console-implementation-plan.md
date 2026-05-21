# Issue #42 Implementation Plan - View and Filter Audit Log in Admin Console

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-19 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement an admin-facing audit log UI under `/kudos/admin/audit-log` so admins can investigate platform events through filtering, pagination, and event detail inspection.

## Current State (Gap Analysis)
## Current Behavior
- Foundational audit backend exists with admin-protected endpoint: `GET /api/admin/audit-events`.
- Admin shell and route namespace exist under `/kudos/admin/*`.
- Admin console landing has module tiles, but no dedicated tile/page for audit logs yet.

## Gaps
- No admin UI route for audit log browsing.
- No filter/query UX wired to audit endpoint.
- No event detail drawer/modal for investigative metadata.
- No explicit Admin Console tile/nav entry for logs.

## Scope
### In Scope
- Add admin route `/kudos/admin/audit-log`.
- Add Admin Console tile and shell navigation link for Audit Logs.
- Implement audit log table/list view with core fields.
- Implement filter controls: date range, actor, event type, result.
- Implement pagination, deterministic newest-first display, and event detail view.
- Implement loading/empty/error states.
- Add tests for route access, navigation, filtering behavior, and detail rendering.

### Out of Scope
- CSV export.
- SIEM integration.
- Advanced analytics/correlation visualizations.

## Proposed Approach
## 1) Route and Navigation Wiring
- Add new route constant for `/kudos/admin/audit-log`.
- Add `Audit Logs` navigation entry in Admin shell.
- Add `Audit Logs` tile on `/kudos/admin` landing linking to the new page.

## 2) Build Audit Log Page Skeleton
- Create `AdminAuditLogPage` component.
- Sections:
  - filter toolbar
  - results table/list
  - pagination controls
  - detail drawer/modal
  - loading/empty/error states

## 3) Integrate Audit API Querying
- Use existing endpoint `GET /api/admin/audit-events`.
- Query params:
  - `page`, `pageSize`, `from`, `to`, `eventType`, `actorUserId`, `result`
- Default query behavior:
  - `page=1`
  - `pageSize=20`
  - server default sort (`occurred_at desc, id desc`)

## 4) Implement Filter State and Interactions
- Add controlled filter inputs and explicit `Apply` action.
- Add `Clear filters` to reset to defaults.
- Keep filter state stable on error for retry.

## 5) Render Results and Event Details
- Base columns:
  - timestamp
  - actor
  - event type
  - target
  - result
- Row selection opens event detail view with metadata.
- Handle missing/null fields gracefully.

## 6) States and Error Handling
- Loading indicator during fetch.
- Empty state: no matching audit events.
- Error state with retry option.
- No leakage of backend internals in user-facing error text.

## 7) Security and Data Display Rules
- Keep route behind existing admin guard behavior.
- Respect backend redaction and avoid raw rendering of sensitive fields.
- Ensure non-admin/unauthenticated users cannot access route content.

## 8) Test and Verify
- Client tests for:
  - route resolution `/kudos/admin/audit-log`
  - landing tile navigation to audit logs
  - filter apply/clear behavior
  - empty/loading/error states
  - event detail opening
  - guard behavior unchanged for non-admin/unauthenticated users
- Run regression suites for client and server.

## Acceptance Criteria Mapping
- Admin can open `/kudos/admin/audit-log` and see newest-first events -> route + table + default query.
- Admin Console tile routes to logs page -> landing tile link test.
- Filters return matching records -> filter query behavior tests.
- Non-admin and unauthenticated access denied -> route guard and API behavior verified.
- Event details view supports investigation -> row-to-detail interactions implemented.
- Empty state is clear when no results -> empty-state UX implemented.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Large result sets impact UI performance | Slow admin experience | Server-side pagination with bounded page size |
| Metadata overexposure in UI | Security/privacy risk | Redaction/allowlist adherence and defensive rendering |
| UI/API contract drift | Broken filtering behavior | Keep explicit query contract and targeted tests |

## Dependencies
- Parent epic: #31
- Depends on: #41 (audit layer), #36 (admin authz baseline), #38 (admin shell)

## Deliverables Checklist
- [ ] Route added for `/kudos/admin/audit-log`
- [ ] Audit Logs tile added to Admin Console landing
- [ ] Audit Logs nav item added in Admin shell
- [ ] Audit log page with filters/table/pagination/detail implemented
- [ ] Loading/empty/error states implemented
- [ ] Client tests updated and passing
- [ ] Documentation updated where route map/admin modules are listed

## Suggested Execution Order
1. Add route constant, shell nav link, and landing tile
2. Create page skeleton for audit logs
3. Wire API querying and pagination
4. Add filters and detail view interactions
5. Implement loading/empty/error states
6. Add tests and run full regression suites
7. Update docs and issue closeout note
