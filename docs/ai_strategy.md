# AI Strategy 

This folder contains lightweight documentation used to guide AI-assisted planning, design, implementation, testing, and review.

## Where To Start
- Read `master_spec.md` first. It is the central index and tells you which files to include for different task types.
- In `master_spec.md`, see the "Specs Split (Important)" section for how to use `requirements.md` (feature-level requirements) vs `design_spec.md` (product-level UI/UX standards).

## What Each Section Is For
- `context/`: product background and shared language (`project_context.md`, `glossary.md`).
- `specs/`: what to build and how it should work (`requirements.md`, `design_spec.md`, `architecture_concept.md`).
- `quality/`: how to validate quality and security (`testing_strategy.md`, `security_baseline.md`).
- `engineering/`: coding expectations and known pitfalls (`coding_standards.md`, `common_pitfalls.md`).
- `decisions/`: key technical decisions and rationale (`decision_log.md`).
- `personas/`: role-specific review lenses (developer, tester, security reviewer, designer, DevOps).

## Practical Use
- Keep files short and focused.
- Update docs when decisions or recurring issues appear.
- For prompts, include only the minimum context plus task-relevant files.

## Personas: Reference and Usage
- Persona docs live under `docs/ai/personas/`:
  - `developer.md`
  - `tester.md`
  - `security_reviewer.md`
  - `designer.md`
  - `devops.md`
- Use personas as focused review lenses, not as replacements for the full spec:
  - Start with `master_spec.md` and the core task docs.
  - Add one or more persona docs based on the work being done (for example: `tester.md` for test planning, `security_reviewer.md` for auth/data flows).
  - Ask the AI to produce persona-specific findings and then a merged, prioritized action list.
- Suggested prompt pattern:
  - "Using `master_spec.md` + relevant specs + `<persona>.md`, review this change and return: risks, missing requirements, and concrete fixes."

## Maintenance
- Owners should update "Last Updated" and version fields as docs evolve.
- If a doc becomes stale, mark its status clearly (Draft/Active/Deprecated).
