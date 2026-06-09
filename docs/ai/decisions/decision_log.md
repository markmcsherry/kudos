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

### DEC-0007: Expand product scope to include qualifications/certifications tracking
- Date: 2026-05-15
- Status: Proposed
- Context: Product direction is being considered to extend Kudos beyond recognition events into profile-based qualifications tracking (for example certifications awarded or uploaded).
- Decision: Pending final decision on whether certifications become a first-class product capability in roadmap scope.
- Consequences: If accepted, this introduces new data model, UX, privacy, and verification requirements and should likely be managed as a dedicated epic.
- Alternatives considered:
  - Keep Kudos focused only on recognition events.
  - Add certifications as lightweight profile metadata only (no upload/verification).
  - Add full certifications capability with document upload, validation, and reminders.

#### Follow-up TODO
- Run product/architecture/security discovery to define:
  - audience and visibility model
  - verification requirements
  - document handling and compliance constraints
  - phased delivery approach (MVP vs full capability)

### DEC-0008: Visibility model for kudos (private/public/org-scoped)
- Date: 2026-05-15
- Status: Proposed
- Context: Current direction suggests kudos should be visible beyond only the recipient, but visibility may need to vary by recipient preference and organizational structure.
- Decision: Pending definition of a visibility model that balances recognition value with user control and organizational policy.
- Consequences: This decision impacts data model, access control, UI controls, moderation needs, and compliance/privacy posture.
- Alternatives considered:
  - Recipient-only visibility (private by default, no sharing)
  - Organization-default visibility (team/org visibility with optional recipient override)
  - Recipient-controlled visibility per kudos (`private`, `team`, `org`, `public`)
  - Hybrid model (recipient-level default plus per-kudos ad hoc override)

#### Follow-up TODO
- Define product and policy rules for:
  - default visibility at org and user levels
  - recipient override capability (global default and per-kudos ad hoc)
  - visibility inheritance for team/org structures
  - auditability and moderation requirements for public/org-visible kudos

### DEC-0009: Use REST endpoints now with planned GraphQL transition later
- Date: 2026-05-15
- Status: Accepted
- Context: Current delivery needs require fast implementation of auth and early user flows, while long-term architecture direction still targets GraphQL.
- Decision: Continue with pragmatic REST endpoints for current incremental delivery and defer GraphQL refactor until broader domain/API surface exists.
- Consequences: Faster near-term delivery and simpler debugging; future work must map existing REST behavior/tests to GraphQL equivalents during transition.
- Alternatives considered:
  - Block feature delivery until GraphQL-first API layer is implemented.
  - Build temporary GraphQL wrappers immediately around minimal current functionality.

#### Follow-up TODO
- Define migration trigger criteria (for example: number of domains/endpoints, duplication pain, cross-client API needs).
- Add API contract documentation so current REST behavior is preserved during GraphQL migration.
- Plan staged migration (auth first vs domain-by-domain) with compatibility strategy.

### DEC-0010: Feature toggle strategy for development and long-term optional features
- Date: 2026-05-16
- Status: Proposed
- Context: The team needs a consistent way to release work incrementally, test incomplete capabilities safely, and manage optional features over time without carrying uncontrolled branching logic.
- Decision: Adopt a centralized feature toggle strategy with environment-aware defaults and explicit toggle categories:
  - **Release toggles (short-lived):** temporary flags used to merge incomplete work safely and remove after rollout.
  - **Experiment toggles (time-boxed):** flags used for A/B or discovery work with a predefined end date.
  - **Ops toggles (operational):** kill switches or guardrails for runtime risk control.
  - **Entitlement toggles (long-lived):** flags used to enable optional features by plan/license.
  - Implement toggles through a single server-side toggle service/module, expose a typed contract to clients, and store current flag values in config + persistent backing store for non-local environments.
  - Require owner, purpose, creation date, and planned removal/review date metadata for every new flag.
- Consequences: Safer progressive delivery and clearer optional-feature governance; additional engineering overhead is required to maintain flag lifecycle hygiene, observability, and periodic cleanup.
- Alternatives considered:
  - Environment-only branching via `.env` variables without centralized ownership/lifecycle metadata.
  - No toggle strategy (feature branches only until full completion).
  - Third-party SaaS flag platform immediately (deferred until scale/operational needs justify).

#### Follow-up TODO
- Define the initial toggle registry format (for example YAML/JSON or database table) and naming convention.
- Add guardrails in CI/linting to detect stale release/experiment toggles past review date.
- Decide whether entitlement toggles are enforced server-side only or also reflected in client capability payloads.
- Create a licensing decision (new DEC) to define plan tiers, entitlement source of truth, and billing/commercial constraints for optional features.

### DEC-0011: Onboarding credential policy for admin-created users
- Date: 2026-05-21
- Status: Proposed
- Context: User-management create/edit capabilities are now available in admin flows, but initial credential handling for admin-created end users is not yet finalized. Allowing admins to set permanent user passwords directly can create security and operational risk, and first-login behavior is currently not governed by a formal policy.
- Decision: Pending final selection of onboarding credential model. Candidate options:
  - **Option A: Admin sets initial password directly (current behavior)**
  - **Option B: System-generated temporary credential with mandatory first-login password change**
  - **Option C: Invite token/link flow with user-defined password on first activation**
- Consequences: Until finalized, treat current behavior as transitional and avoid expanding permanent admin-assigned password semantics in additional flows.
- Alternatives considered:
  - Keep admin-assigned permanent password model with stronger policy controls only.
  - Hybrid model: temporary credential for most users, invite-only mode for external identities.

#### Follow-up TODO
- Decide preferred model with PO/Design/Security review (recommended baseline: Option B or C, not A).
- Define constraints for selected model:
  - one-time use and expiration windows
  - forced password rotation at first successful login
  - audit events for issuance/redemption/expiry/failure
  - sensitive artifact redaction rules
- Create implementation stories for backend/token lifecycle, UI flow updates, and test coverage.
