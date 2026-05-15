# kudos

Kudos is a project centered on recognition: awarding special thanks to people for contributions, and optionally allowing people to award themselves for completed work.

At a product level, this can support broader gamification of tasks that need to be done, tracked, or maintained across teams.

## Documentation
- Project entry point: [`docs/index.md`](docs/index.md)
- AI strategy overview: [`docs/ai_strategy.md`](docs/ai_strategy.md)
- Contribution guide: [`docs/contributing.md`](docs/contributing.md)
- Docs maintenance guide: [`docs/maintaining_docs.md`](docs/maintaining_docs.md)
- Docs site config: [`mkdocs.yml`](mkdocs.yml)

## Getting Started
- Product/domain overview: start with [`docs/index.md`](docs/index.md), then read [`docs/ai/context/project_context.md`](docs/ai/context/project_context.md).
- Requirements and design direction: review [`docs/ai/specs/requirements.md`](docs/ai/specs/requirements.md) and [`docs/ai/specs/design_spec.md`](docs/ai/specs/design_spec.md).
- AI-assisted workflows: use [`docs/ai_strategy.md`](docs/ai_strategy.md), then assemble task context from [`docs/ai/master_spec.md`](docs/ai/master_spec.md).

## Runtime Prerequisites
- Node.js 20.x LTS
- npm 10+
- Docker (for containerized run)

## Local Development
- Install dependencies:
  - `npm install`
- Start local database:
  - `npm run db:up`
- Apply migrations:
  - `npm run db:migrate`
- Seed sample data:
  - `npm run db:seed`
- Run client and server in watch mode:
  - `npm run dev`
- Build frontend assets:
  - `npm run build`
- Start Node server (serves `client/dist`):
  - `npm run start`

By default, the server listens on `http://localhost:3000`.

## Database Reset (Local)
- Reset schema state:
  - `npm run db:reset`
- Re-apply schema and data:
  - `npm run db:migrate`
  - `npm run db:seed`

## Environment Configuration
- Copy `.env.example` to `.env` and set local values.
- Required variables for local DB workflows:
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_PORT`
  - `DATABASE_URL`

## Quality Checks
- Lint all workspaces:
  - `npm run lint`
- Run tests across client and server:
  - `npm run test`

## Docker
- Build image:
  - `docker build -t kudos:local .`
- Run container:
  - `docker run --rm -p 3000:3000 kudos:local`

Open `http://localhost:3000` to view the landing page.

## Local Verification
- App health:
  - `curl.exe -s http://localhost:3000/health`
- DB health:
  - `curl.exe -s -i http://localhost:3000/health/db`

If DB health returns `503`, verify DB container is running and environment variables are set correctly.

## Contributing
- Follow [`docs/contributing.md`](docs/contributing.md) for contribution expectations and workflow.

## Docs Publishing (GitHub Pages)
- Documentation is built from `docs/` using MkDocs Material.
- GitHub Actions workflow: [`.github/workflows/docs.yml`](.github/workflows/docs.yml).
- On push to `main` (for docs/config changes), the docs site is built and deployed to GitHub Pages.
