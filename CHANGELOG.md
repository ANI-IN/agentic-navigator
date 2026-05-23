# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres (best-effort) to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `LICENSE` (MIT, 2026, Animesh Kumar).
- `.editorconfig` for consistent indentation across editors.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- `docs/architecture.md` with high-level flow, sequence diagrams, and a "what lives where" map.
- `docs/getting-started.md` with prerequisites, install steps, and a manual QA checklist.
- GitHub issue templates (bug, feature) and a pull request template.
- `.github/workflows/ci.yml` for lint and build on every push and PR.
- `Dockerfile` for containerized preview of the production build.

### Changed
- Removed unused `d3` runtime dependency.
- Fixed the eight `react-hooks/purity` lint errors and the one unused-variable error in `src/App.jsx`.
- Corrected factual inaccuracies in `README.md` (module count, React/Vite versions, bundle size, Node version range).
- Updated `index.html` title and meta tags.
- Added security and caching headers to `vercel.json` and `netlify.toml`.

### Removed
- macOS Finder duplicate files at repo root: `index copy.html`, `package copy.json`, `package-lock copy.json`, `README copy.md`, `vite.config copy.js`.
