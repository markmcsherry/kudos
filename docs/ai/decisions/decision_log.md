# Decision Log

Use this file to capture meaningful technical decisions in lightweight ADR format.

## Entry Template
### DEC-XXXX: Title
- Date:
- Status: Proposed/Accepted/Superseded
- Context:
- Decision:
- Consequences:
- Alternatives considered:

## Decisions

### DEC-0001: Establish AI documentation hierarchy
- Date: 2026-05-15
- Status: Accepted
- Context: AI prompts needed reusable, focused context with minimal token overhead.
- Decision: Use `master_spec.md` as an index and split guidance into context, specs, quality, engineering, decisions, and personas.
- Consequences: Easier prompt assembly, clearer ownership, and less duplication.
- Alternatives considered: Single monolithic spec file.
