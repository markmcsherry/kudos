# Issue #27 Implementation Plan - Add a Logo to the Header

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-16 |
| Status | Draft |
| Version | v0.1 |

## Objective
Add Kudos logo branding to the header across logged-out and logged-in states, while preserving usability, responsiveness, and accessibility.

## References
- Issue: `#27 [User Story] Add a logo to the header`
- `docs/ai/specs/design_spec.md`
- `docs/ai/specs/requirements.md`
- Existing implementation: `client/src/components/Header.jsx`

## Scope
### In Scope
- Add logo asset to frontend assets directory.
- Render logo in header brand area (top-left), aligned with `Kudos` brand text.
- Apply consistently to public and authenticated header states.
- Keep brand block clickable to `/`.
- Ensure responsive sizing and spacing for mobile/desktop.
- Add fallback behavior for missing logo asset.
- Add/update tests for presence and behavior.

### Out of Scope
- Complete branding refresh.
- Dynamic theme-based logo switching.
- Navigation redesign.

## Proposed Asset and Placement
- Asset path:
  - `client/src/assets/logo/kudos-logo.svg`
- Header placement:
  - Left side of header, before/with brand text.
- Click behavior:
  - Brand area links to `/`.

## Work Breakdown
## 1) Asset Setup
- Add logo asset file under `client/src/assets/logo/`.
- Confirm asset is optimized for web (SVG preferred).

## 2) Header Composition Updates
- Update `Header` component to render logo + text in one brand block.
- Ensure both auth states (logged-out and logged-in) render same brand block.
- Maintain existing right-side actions without regression.

## 3) Responsive and Layout Rules
- Implement size constraints:
  - desktop logo height target: `28-32px`
  - mobile logo height target: `24-28px`
- Preserve aspect ratio and avoid stretching.
- Ensure brand block does not push important actions out of viewport.

## 4) Accessibility and Fallback
- Add alt text: `Kudos logo`.
- Ensure keyboard focus style remains visible when brand is link.
- Fallback to text-only `Kudos` when logo unavailable.

## 5) Test Coverage
- Update/add component tests to verify:
  - logo appears in header
  - brand link points to `/`
  - header still behaves correctly for logged-in/logged-out states
  - fallback text present when image cannot render (as practical in test env)

## 6) Documentation/Decision Notes
- If asset conventions are new, add brief note in `README.md` or contributing docs.
- If design deviation is needed, record in `docs/ai/decisions/decision_log.md`.

## Acceptance Mapping
- Logo visible in header -> header render tests + visual check.
- Clicking logo routes home -> link target/assertion tests.
- Responsive behavior stable -> viewport QA on mobile + desktop.
- Accessibility and fallback -> alt/focus/fallback checks.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Header crowding on small screens | Action buttons overlap/truncate | Tune spacing and allow secondary text reduction before action loss |
| Inconsistent branding across auth states | UX inconsistency | Reuse single shared brand block in one header component |
| Logo contrast issues | Accessibility/usability degradation | Validate against header backgrounds in light/dark modes |

## Deliverables Checklist
- [ ] Logo asset added under `client/src/assets/logo/`
- [ ] Header updated with logo + home link behavior
- [ ] Logged-in/logged-out header states validated
- [ ] Tests updated/added and passing
- [ ] Responsive and accessibility checks completed

## Suggested Execution Order
1. Add asset file and import path
2. Update `Header` brand block
3. Tune responsive sizing/spacing
4. Add/update tests
5. Run lint/tests and complete visual QA
