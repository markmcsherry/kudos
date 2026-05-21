# Issue #55 Implementation Plan - Audit Logs UX Improvement

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-21 |
| Status | Draft |
| Version | v0.1 |

## Objective
Improve audit log filtering UX by aligning controls with exact-match query behavior, adding sensible initial date defaults, and reducing technical-only filter complexity.

## Current State (Gap Analysis)
## Current Behavior
- Audit Logs page exists at `/kudos/admin/audit-log`.
- `Event Type` and `Result` filters are currently free-text inputs.
- `Actor User ID` is currently shown as a filter input.
- Date fields do not default to a last-24-hours window.
- `Clear filters` clears all fields to blank.

## Gaps
- Free-text exact-match fields encourage invalid/mismatched queries.
- No initial date-window default can overload result context and reduce usability.
- Actor ID filtering is too technical for primary admin workflows.

## Scope
### In Scope
- Replace `Event Type` filter input with a dropdown (`All event types` default).
- Replace `Result` filter input with a dropdown (`All results` default).
- Default `From` and `To` to last 24 hours on initial page load.
- Remove `Actor User ID` filter from UI.
- Preserve `Clear filters` behavior as clear-to-blank for all fields.
- Keep filtering and pagination behavior deterministic.

### Out of Scope
- Backend actor enrichment (name/email joins).
- Partial-match search semantics for event type/result.
- Additional date presets (for example last 7 days).

## Proposed Approach
## 1) Filter Model Update
- Update page filter state to:
  - `from`
  - `to`
  - `eventType`
  - `result`
- Remove `actorUserId` from local state and query parameter generation.

## 2) Dropdown UX for Exact-Match Fields
- Replace free-text controls with select/dropdown components.
- `Event Type` options:
  - include `All event types` empty option
  - include known event taxonomy values from current system.
- `Result` options:
  - `All results`
  - `success`, `failure`, `denied`.

## 3) Last-24-Hours Initial Defaults
- On first page load only, set:
  - `to = now`
  - `from = now - 24h`
- Reflect these values in date-time inputs and initial query.
- Add helper text indicating default date scope.

## 4) Preserve Clear Behavior
- Keep current clear action semantics:
  - clear all filter fields to blank (including date fields)
  - do not reapply last-24-hours defaults on clear
- Ensure this behavior is explicit in tests.

## 5) Query and Pagination Integrity
- Continue calling existing endpoint with deterministic ordering from server.
- Maintain page reset to `1` when filters are applied/cleared.
- Keep page size behavior unchanged.

## 6) Tests and Verification
- Update client tests for audit logs page to verify:
  - default last-24h prepopulation on initial load
  - dropdown rendering for Event Type and Result
  - no Actor User ID filter field visible
  - clear action blanks all fields including dates
  - filter apply still queries and renders deterministically
- Run full client and server test suites for regression confidence.

## Acceptance Criteria Mapping
- Dropdowns for Event Type/Result -> UI controls updated and tested.
- Last-24h default on initial load -> implemented and verified.
- Actor User ID removed -> UI no longer renders field.
- Clear-to-blank behavior preserved -> verified with explicit test.
- Deterministic query behavior remains -> no API contract break.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Event type option drift vs backend | Filter mismatch | Keep option list aligned with current audit taxonomy and review periodically |
| Date handling/timezone confusion | Unexpected ranges | Use consistent ISO/local conversion and test boundary behavior |
| Clear behavior regressions | UX inconsistency | Add dedicated test asserting all fields become blank |

## Dependencies
- Parent epic: #31
- Depends on: #42, #41, #36

## Deliverables Checklist
- [ ] Event Type converted to dropdown
- [ ] Result converted to dropdown
- [ ] Initial last-24h defaults applied to From/To
- [ ] Actor User ID filter removed
- [ ] Clear filters keeps clear-to-blank behavior
- [ ] Client tests updated and passing
- [ ] Regression suites passing

## Suggested Execution Order
1. Refactor filter state and remove actor filter from UI/state/query
2. Replace Event Type and Result fields with dropdowns
3. Add first-load last-24-hours defaulting behavior
4. Confirm clear-to-blank behavior remains unchanged
5. Update/add tests for all UX requirements
6. Run full client/server test suites and finalize
