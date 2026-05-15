# Maintaining Docs

This page describes how to maintain and update documentation in the Kudos project.

## Scope
- Documentation source lives in `docs/`.
- Published docs are built with MkDocs Material using `mkdocs.yml` at the repository root.
- Deployment to GitHub Pages is handled by `.github/workflows/docs.yml` at the repository root.

## Core Practices
- Keep pages concise and focused on one concern.
- Prefer clear headings, short sections, and link-based navigation.
- Update links when files are renamed or moved.
- Keep language consistent across docs (product terms, persona names, and section names).

## Structure and Navigation
- Use [`index.md`](index.md) as the main entry point for humans.
- Keep AI-process docs under `docs/ai/` and cross-links in [`ai_strategy.md`](ai_strategy.md).
- Add new top-level docs to `mkdocs.yml` navigation so they appear on the published site.

## Publishing and Validation
- Local preview:
  - `pip install mkdocs-material`
  - `mkdocs serve`
- Production build check:
  - `mkdocs build --strict`
- GitHub Pages deploys automatically on push to `main` when docs or docs config files change.

## Pull Request Checklist (Docs Changes)
- [ ] Content is accurate and concise.
- [ ] Cross-references and relative links resolve correctly.
- [ ] `mkdocs.yml` nav is updated when adding/moving major pages.
- [ ] Local `mkdocs build --strict` passes.

## Product Spec Approach (TO DO)
- TO DO: Decide whether product specification guidance remains in documentation files under `docs/ai/specs/` or moves primarily to GitHub Issues.
- TO DO: After that decision, update this guide and any related references in `README.md`, `docs/index.md`, and `docs/ai_strategy.md`.
