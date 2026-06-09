## Documentation Task
- Objective:
  - Define and document the decision for how initial credentials are handled when admins create end-user accounts.
- Why this matters:
  - Current create flow allows admin-supplied passwords, which increases operational/security risk and creates policy ambiguity for first login behavior.
- Documentation area:
  - [ ] Decision log follow-up
  - [ ] New/updated implementation docs
  - [ ] API/reference docs
  - [ ] Runbook/operational docs
  - [ ] Contributor/onboarding docs
  - [ ] Other

## Decision Linkage (if applicable)
- Related decision ID(s): `DEC-0011`
- Decision status:
  - [ ] Proposed
  - [ ] Accepted
  - [ ] Superseded
- What needs to be revisited from the decision:
  - Whether admin-created user onboarding must move to invite/token or temporary-password + forced rotation model.
  - Expiry/replay policy for onboarding credentials.
  - Audit requirements for issuance, redemption, expiry, and failure.
- What output is expected:
  - [ ] Clarification note
  - [ ] Constraints documented
  - [ ] Migration plan
  - [ ] Follow-up tasks created
  - [ ] Decision updated

## Scope
- In scope:
  - Document current state and risk profile in AI docs.
  - Capture option set and recommendation in decision log.
  - Define acceptance constraints for selected onboarding approach.
  - Define required implementation follow-up stories/TBIs after decision acceptance.
- Out of scope:
  - Implementing invite flow, email delivery, token storage, or password-reset UI.
  - Changing live auth behavior in this documentation task.

## Deliverables
- [ ] `docs/ai/decisions/decision_log.md` updated with accepted decision outcome
- [ ] Cross-links added from related user-management plans/stories
- [ ] Terminology aligned with glossary/specs
- [ ] Follow-up implementation story/TBI list created
- [ ] Security constraints explicitly captured (redaction, expiry, one-time use, forced rotation)

## Acceptance Criteria
- [ ] Given the decision entry, when reviewed by PO/Design/Security, then chosen onboarding credential model and rationale are clear.
- [ ] Given the updated docs, when engineering reads them, then implementation constraints are unambiguous.
- [ ] Given this task is complete, when reviewed, then no contradictions remain between user-management docs and decision log.

## Verification Checklist
- [ ] Accuracy checked against current code/config
- [ ] Internal links validated
- [ ] Security/privacy review considered
- [ ] Spelling/clarity pass completed

## Impact and Risks
- Risks if not completed:
  - Security posture remains ambiguous for first-login credential handling.
  - UX and backend implementation may diverge in onboarding behavior.
- Potential confusion areas:
  - Difference between invite onboarding, temporary passwords, and standard password reset flows.
- Dependencies:
  - `#59`, `#61`, `#63`

## References
- Docs paths to update:
  - `docs/ai/decisions/decision_log.md`
  - `docs/ai/context/glossary.md`
  - `docs/ai/engineering/common_pitfalls.md`
- Related issues:
  - `#59`, `#61`, `#63`
- Additional notes:
  - Recommendation is to avoid admin-assigned permanent passwords and adopt a forced first-login credential rotation pattern.
