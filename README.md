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

## Contributing
- Follow [`docs/contributing.md`](docs/contributing.md) for contribution expectations and workflow.

## Docs Publishing (GitHub Pages)
- Documentation is built from `docs/` using MkDocs Material.
- GitHub Actions workflow: [`.github/workflows/docs.yml`](.github/workflows/docs.yml).
- On push to `main` (for docs/config changes), the docs site is built and deployed to GitHub Pages.
