# Master AI Spec

This file is the orchestration index for AI-assisted work. Keep it short and link to focused docs.

For a short human onboarding overview, see [`../ai_strategy.md`](../ai_strategy.md).

## How To Use
- Start with the minimum context pack.
- Add only the task-specific files needed.
- Add one or more persona files to shape review depth and focus.

## Specs Split (Important)
- [`specs/requirements.md`](specs/requirements.md): source of truth for feature-level requirements, acceptance criteria, constraints, and traceability.
- [`specs/design_spec.md`](specs/design_spec.md): product-level UI/UX standards and cross-cutting design direction (Material UI defaults, responsive behavior, theming, accessibility baseline).

## Minimum Context Pack
- [`context/project_context.md`](context/project_context.md)
- [`specs/requirements.md`](specs/requirements.md)
- [`engineering/coding_standards.md`](engineering/coding_standards.md)
- [`engineering/common_pitfalls.md`](engineering/common_pitfalls.md)

## Task-Based Context Assembly

### Architecture or platform decisions
- Minimum context pack
- [`specs/architecture_concept.md`](specs/architecture_concept.md)
- [`decisions/decision_log.md`](decisions/decision_log.md)

### Feature implementation
- Minimum context pack
- [`specs/requirements.md`](specs/requirements.md)
- [`specs/design_spec.md`](specs/design_spec.md)
- [`quality/testing_strategy.md`](quality/testing_strategy.md)

### Testing and QA hardening
- Minimum context pack
- [`quality/testing_strategy.md`](quality/testing_strategy.md)
- [`personas/tester.md`](personas/tester.md)

### Security review or secure coding
- Minimum context pack
- [`quality/security_baseline.md`](quality/security_baseline.md)
- [`personas/security_reviewer.md`](personas/security_reviewer.md)

### UX and interface design tasks
- Minimum context pack
- [`specs/requirements.md`](specs/requirements.md)
- [`specs/design_spec.md`](specs/design_spec.md)
- [`personas/designer.md`](personas/designer.md)

## Full Index

### Context
- [`context/project_context.md`](context/project_context.md)
- [`context/glossary.md`](context/glossary.md)

### Specifications
- [`specs/requirements.md`](specs/requirements.md)
- [`specs/design_spec.md`](specs/design_spec.md)
- [`specs/architecture_concept.md`](specs/architecture_concept.md)

### Quality
- [`quality/testing_strategy.md`](quality/testing_strategy.md)
- [`quality/security_baseline.md`](quality/security_baseline.md)

### Engineering Guidance
- [`engineering/coding_standards.md`](engineering/coding_standards.md)
- [`engineering/common_pitfalls.md`](engineering/common_pitfalls.md)

### Decisions
- [`decisions/decision_log.md`](decisions/decision_log.md)

### Personas
- [`personas/developer.md`](personas/developer.md)
- [`personas/tester.md`](personas/tester.md)
- [`personas/security_reviewer.md`](personas/security_reviewer.md)
- [`personas/designer.md`](personas/designer.md)
- [`personas/devops.md`](personas/devops.md)
- [`personas/product_owner.md`](personas/product_owner.md)
- [`personas/architect.md`](personas/architect.md)

## Document Metadata Template
Use this at the top of each file:

| Field | Value |
| --- | --- |
| Owner | |
| Last Updated | YYYY-MM-DD |
| Status | Draft/Active/Deprecated |
| Version | v0.1 |

## Maintenance Rules
- Keep each file focused on one concern.
- Prefer checklists and tables over long prose.
- Update `decisions/decision_log.md` whenever a significant technical choice is made.
- Update `engineering/common_pitfalls.md` when regressions repeat.
