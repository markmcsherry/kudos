# Issue #13 Implementation Plan - Setup Database

| Field | Value |
| --- | --- |
| Owner | Engineering |
| Last Updated | 2026-05-15 |
| Status | Draft |
| Version | v0.1 |

## Objective
Implement a secure, reproducible PostgreSQL local/dev database foundation with migrations, seed data, and connectivity checks for the Kudos application.

## References
- Issue: `#13 [Technical Backlog] Setup database`
- `docs/ai/master_spec.md`
- `docs/ai/specs/architecture_concept.md`
- `docs/ai/quality/testing_strategy.md`
- `docs/ai/quality/security_baseline.md`
- `docs/ai/engineering/coding_standards.md`

## Scope
### In Scope
- PostgreSQL container setup (local/dev)
- Migration-based schema for `users` and `kudos`
- Deterministic seed scripts for sample users and kudos
- App-side DB connectivity and health verification
- Documentation updates for setup/reset/troubleshooting

### Out of Scope
- Production HA/replication/backup
- Full auth implementation
- Final business taxonomy for kudos type

## Work Breakdown
## 1) Infrastructure Setup
- Add `docker-compose.yml` service for PostgreSQL.
- Configure named volume for data persistence.
- Add environment-driven configuration (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`).
- Add `.env.example` and ensure `.env` remains ignored.

## 2) Migration Tooling
- Select migration mechanism and standardize commands.
- Add scripts:
  - `db:migrate`
  - `db:migrate:reset` (dev only)
  - `db:seed`
- Store migrations in a dedicated folder (`server/db/migrations` or similar).

## 3) Baseline Schema
- `users` table:
  - `id` primary key
  - `first_name`, `last_name`, `email`, `password_hash`
  - unique constraint on `email`
  - `created_at`, `updated_at`
- `kudos` table:
  - `id` primary key
  - `description`, `type`
  - `created_by_user_id`, `for_user_id` foreign keys to `users.id`
  - `created_at`, `updated_at`
- Add NOT NULL constraints and basic indexes.

## 4) Seed Data
- Add deterministic seed data for:
  - at least 2 sample users
  - at least 3 sample kudos entries
- Ensure user credentials are hash-only (no plaintext in DB).
- Make seed re-runnable and idempotent where practical.

## 5) Application Connectivity
- Add DB connection module in server layer.
- Add readiness/health endpoint behavior for DB status.
- Ensure connection errors are actionable but do not leak credentials.

## 6) Documentation
- Update `README.md` with:
  - prerequisites
  - startup commands
  - migration/seed/reset commands
  - smoke verification commands
- Add troubleshooting notes for common local issues (port conflict, volume reset, bad env vars).

## 7) Security Controls
- Validate no credentials are committed.
- Use env vars for all secrets.
- Document least-privilege model (app user vs admin user).
- Keep DB port exposure local-only in docs.

## Test Strategy
## Required
- Migration test: schema creates expected tables/constraints.
- Seed test: expected sample records created.
- Integration test: server can connect and return healthy DB check.

## Recommended
- Negative test for failed connection (invalid creds/host).
- Validation test for duplicate email constraint.

## Acceptance Mapping
- Container starts and persists data -> compose startup + restart check.
- Required schema exists -> migration verification query/tests.
- Seed data exists -> seed verification query/tests.
- Connectivity successful -> `/health` or `/health/db` returns success.
- No secrets in repo -> review checklist + `.env.example` only.

## Risks and Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Migration tool choice delayed | Slows implementation | Decide tooling first before coding schema |
| Seed data leaks insecure patterns | Security debt | Enforce hash-only passwords and review checklist |
| Non-idempotent reset scripts | Flaky local workflows | Add deterministic reset process and document clearly |

## Deliverables Checklist
- [ ] Docker Compose DB service + volume
- [ ] Migration tooling and baseline migrations
- [ ] Seed scripts with sample users/kudos
- [ ] Server DB connectivity module + health check
- [ ] Tests for migration/seed/connectivity
- [ ] README and setup docs updated

## Suggested Execution Order
1. Compose + env scaffolding
2. Migration tooling + initial schema
3. Seed scripts
4. Server connectivity + health checks
5. Tests
6. Docs and final verification
