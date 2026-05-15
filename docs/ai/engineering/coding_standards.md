# Coding Standards

| Field | Value |
| --- | --- |
| Owner | |
| Last Updated | YYYY-MM-DD |
| Status | Draft |
| Version | v0.1 |

## Design Principles
- Keep modules cohesive and boundaries explicit.
- Prefer clarity over cleverness.
- Optimize for maintainability first.

## Code Organization
- Folder/module conventions:
- Public vs private API conventions:
- Dependency direction rules:

## Error Handling
- Fail fast on invalid input.
- Return actionable error messages.
- Avoid swallowing exceptions.

## Logging and Observability
- Structured logging expectations:
- Required fields in log context:
- PII and secret redaction rules:

## API and Contract Practices
- Backward compatibility expectations:
- Versioning policy:
- Validation and schema rules:

## Performance Practices
- Baseline performance constraints:
- Caching and batching guidelines:
- N+1 and hot-path review requirement:

## Review Checklist
- [ ] Naming and structure are consistent
- [ ] Error handling is explicit and tested
- [ ] Logging is useful and safe
- [ ] New behavior has matching tests
