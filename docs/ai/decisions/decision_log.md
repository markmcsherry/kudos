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

### DEC-0002: Select optional edge/routing layer
- Date: 2026-05-15
- Status: Proposed
- Context: The architecture includes an optional ingress/reverse-proxy layer for routing, TLS termination, and edge concerns in containerized deployments.
- Decision: Pending final selection between Traefik and NGINX.
- Consequences: Until this is finalized, deployment configuration and operational patterns should avoid vendor-specific assumptions at the edge layer.
- Alternatives considered: Traefik, NGINX, no dedicated edge/routing layer in initial release.

### DEC-0003: Source of truth for backlog and product requirements
- Date: 2026-05-15
- Status: Proposed
- Context: The team is deciding whether backlog and requirement management should primarily live in GitHub Issues or in `specs/requirements.md`.
- Decision: Pending final approach.
- Consequences: Until decided, keep both sources aligned where possible and avoid duplicating detailed requirement text in multiple places.
- Alternatives considered:
  - **Option A: GitHub Issues as primary backlog/requirements source**
    - Pros:
      - Native workflow for triage, assignment, labels, comments, and status tracking.
      - Strong collaboration and audit trail through discussion history.
      - Easy linkage to PRs, commits, and automation.
      - Flexible templates for user stories, bugs, and technical backlog items.
    - Cons:
      - Requirements can become fragmented across many issues.
      - Harder to maintain a single structured overview without extra curation.
      - Cross-issue consistency depends on process discipline.
  - **Option B: `specs/requirements.md` as primary requirements source (with issues for execution tracking)**
    - Pros:
      - Single consolidated document for product requirements and traceability.
      - Easier to review requirements holistically and maintain consistency.
      - Better fit for stable baseline specs and AI-context packaging.
    - Cons:
      - Weaker day-to-day workflow for ownership, lifecycle, and discussion compared with issues.
      - More manual effort to keep execution status in sync.
      - Risk of stale requirements if document updates lag implementation.

### DEC-0004: Initial landing runtime structure and container strategy
- Date: 2026-05-15
- Status: Accepted
- Context: Issue #8 requires a first landing page plus a runnable Node/React containerized baseline.
- Decision: Implement a separated `client/` React app and `server/` Node Express static host, with a multi-stage Docker build that compiles the client and serves built assets from the server.
- Consequences: Clear separation of frontend and runtime responsibilities, reproducible container builds, and a straightforward path to later API/service expansion.
- Alternatives considered:
  - Single folder app with no explicit client/server split.
  - Single-stage Docker image with build tooling kept in runtime image.

### DEC-0005: Local database baseline via PostgreSQL container and SQL migrations
- Date: 2026-05-15
- Status: Accepted
- Context: Issue #13 requires a local development database with stable schema setup, repeatable seed data, and security-conscious configuration.
- Decision: Use PostgreSQL in Docker Compose for local runtime, SQL file-based migrations applied by a Node migration runner, and deterministic SQL seed scripts.
- Consequences: Faster onboarding and reproducible local data workflows; schema evolution is traceable through migration files.
- Alternatives considered:
  - Manual schema setup in psql.
  - ORM-managed schema sync without explicit migration files.

### DEC-0006: Initial auth implementation strategy for user pages
- Date: 2026-05-15
- Status: Accepted
- Context: Issue #12 requires register/login/dashboard pages with basic authentication flow while avoiding premature complexity.
- Decision: Use Passport local strategy with session-based authentication for initial page flow, and render static mocked kudos data on dashboard until API integration is implemented.
- Consequences: Fast delivery of core user flow and protected routing; future work must replace mocked dashboard data and harden auth for production needs.
- Alternatives considered:
  - Full token-based auth implementation in first iteration.
  - Blocking dashboard build until live kudos API is complete.

#### Follow-up TODO
- Add persistent session storage before staging/production rollout (for example PostgreSQL-backed sessions via `connect-pg-simple` or Redis-backed sessions), replacing default in-memory session storage.
