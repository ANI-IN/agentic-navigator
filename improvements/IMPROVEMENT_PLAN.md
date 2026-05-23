# Improvement Plan: Agentic AI Navigator

This document is the entry point for the audit. Read this first, then drill into the linked reports for evidence and detail. Every finding cites real files and line ranges in the current `main` branch (commit `28e3aed` and earlier).

## Executive Summary

Agentic AI Navigator is a client-side React + Vite single-page application that teaches Agentic AI through 22 modules across 6 phases. The app is genuinely well-built for what it is: zero backend, two runtime dependencies, fully responsive, with thoughtful ARIA labelling, a deterministic quiz shuffle, and localStorage persistence with graceful failure paths. The animated SVG diagrams and the gamified XP/streak loop give it a real product feel.

The downsides are concentrated in three places:

1. A **single 1597-line `src/App.jsx`** holds all data, all components, and all state. The file is the only real obstacle to testing, code review, and incremental refactor.
2. The **existing `README.md`** is detailed and confident but contains several **factually incorrect claims**: it says "15 modules across 5 phases" (actual: 22 modules across 6 phases per `src/App.jsx:19-26,28-568`), "React 18.3 / Vite 6" (actual: React 19.2 / Vite 7.3 per `package.json:14-15,26`), and "67KB gzipped" (actual: 96.26KB gzip per `npm run build` output). Worth correcting in `docs/README.proposed.md`.
3. The **lint baseline is red**: `npm run lint` currently exits 1 with 12 errors, eight of them `react-hooks/purity` violations on `Math.random()` calls in the confetti renderer at `src/App.jsx:1369`, and one `no-unused-vars` at `src/App.jsx:1431`. These pre-date this audit and stay untouched (Hard Rule 2), but they should be fixed before any CI workflow is turned on as a merge gate.

There are also a handful of **macOS Finder duplicate files** committed at the repo root: `index copy.html`, `package copy.json`, `package-lock copy.json`, `README copy.md`, `vite.config copy.js`. They are noise and a maintenance trap. Flagged here, not modified.

Overall health: **good for a teaching artifact**, with two or three days of cleanup work standing between it and "production-quality demo".

## Top Findings Across All Reviews

| ID | Title | Severity | Effort | Report |
| --- | --- | --- | --- | --- |
| SEC-01 | `dangerouslySetInnerHTML` with regex-based markdown, no sanitizer | High | Medium | [security-review.md](security-review.md) |
| SEC-02 | `index.html` ships with default title "agent-app" and Vite favicon | Low | Small | [security-review.md](security-review.md) |
| SEC-03 | No CSP, no `Referrer-Policy`, no `X-Content-Type-Options` headers on Vercel/Netlify configs | Medium | Small | [security-review.md](security-review.md) |
| CODE-01 | Monolithic `src/App.jsx` (1597 lines) holds data, components, and shell | High | Large | [code-review.md](code-review.md) |
| CODE-02 | Lint baseline is failing (12 errors) | Medium | Small | [code-review.md](code-review.md) |
| CODE-03 | Committed Finder duplicate files at repo root | Low | Small | [code-review.md](code-review.md) |
| CODE-04 | `README.md` claims do not match the current code (modules, React/Vite version, bundle size) | Medium | Small | [code-review.md](code-review.md) |
| PERF-01 | Unused `d3` runtime dependency inflates `npm install` footprint | Low | Small | [performance-review.md](performance-review.md) |
| PERF-02 | Inline `<style>{CSS_VARS}{GLOBAL_STYLES}</style>` re-injected on every `AppCore` render | Low | Small | [performance-review.md](performance-review.md) |
| PERF-03 | Confetti renderer creates 40 randomised divs inline on every render of `AppCore` | Medium | Small | [performance-review.md](performance-review.md) |
| DEP-01 | `d3` declared but never imported | Low | Small | [dependencies.md](dependencies.md) |
| DEP-02 | No lockfile validation step in any CI (CI does not exist) | Medium | Small | [dependencies.md](dependencies.md) |
| TEST-01 | Zero automated tests, no test framework configured | High | Medium | [testing-gaps.md](testing-gaps.md) |
| DEBT-01 | Single-file architecture is a "feature" per README, but blocks testability | High | Large | [tech-debt-and-refactoring.md](tech-debt-and-refactoring.md) |
| DEBT-02 | Inline-styles-only approach makes theming and dark/light toggle expensive | Low | Medium | [tech-debt-and-refactoring.md](tech-debt-and-refactoring.md) |
| A11Y-01 | Focus is never moved into the new module on advance, screen-reader users lose place | Medium | Small | [accessibility-and-ux.md](accessibility-and-ux.md) |
| A11Y-02 | Quiz feedback relies on emoji + colour without an explicit "Correct" / "Incorrect" text label | Medium | Small | [accessibility-and-ux.md](accessibility-and-ux.md) |
| A11Y-03 | The 22 SVG diagrams are marked `role="img"` but the long descriptions live only in tooltips | Medium | Medium | [accessibility-and-ux.md](accessibility-and-ux.md) |

Each finding is cross-referenced to a detailed entry in the per-topic report.

## Prioritized Roadmap

### Quick wins (low effort, high value)

1. **Delete the five `* copy.*` files** at the repo root (`index copy.html`, `package copy.json`, `package-lock copy.json`, `README copy.md`, `vite.config copy.js`). Owner-only action. See CODE-03.
2. **Remove the unused `d3` dependency** from `package.json:13`. One line. See DEP-01.
3. **Fix the eight `react-hooks/purity` errors** in the confetti renderer at `src/App.jsx:1369` by precomputing the 40 confetti specs in a `useMemo` keyed on a render-time seed, or by moving them into a `useState` initialiser. See CODE-02.
4. **Fix the one unused variable** at `src/App.jsx:1431` (`idxInPhase`). See CODE-02.
5. **Set the real document title** in `index.html` (currently "agent-app") and update the favicon. See SEC-02.
6. **Correct the inaccurate numbers** in `README.md`: 22 modules / 6 phases, React 19, Vite 7, 96KB gzip. See CODE-04 and the new `docs/README.proposed.md`.

### Medium-term improvements (1 to 4 hours each)

7. **Sanitize the markdown renderer**. Either swap the regex-based `Md` component (`src/App.jsx:1010-1024`) for `marked` plus `DOMPurify`, or, since the markdown source is entirely controlled by the developer, switch from `dangerouslySetInnerHTML` to a small JSX renderer that maps tokens to elements. See SEC-01.
8. **Add a CI workflow** that runs lint and build on every PR. The skeleton is at `.github/workflows/ci.yml` in this PR. The lint step will fail today because of the existing 12 errors, so either land the fixes for CODE-02 first, or temporarily set `continue-on-error: true` on the lint step with a follow-up ticket. See DEP-02.
9. **Add a `vitest` smoke-test** for the deterministic quiz shuffle (`src/App.jsx:1032-1044`) and the storage round-trip (`src/App.jsx:576-586`). These are the highest-value, lowest-coupling places to start testing. See TEST-01.
10. **Add security headers** to `vercel.json` and a companion `netlify.toml` block: `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`. See SEC-03.
11. **Move focus into the new module's main heading** when `step` changes, in `AppCore` at `src/App.jsx:1313-1323`. See A11Y-01.
12. **Add explicit "Correct" / "Incorrect" text** alongside the emoji in `Quiz` at `src/App.jsx:1080-1120`. See A11Y-02.

### Larger efforts (a day or more)

13. **Extract the `steps` array and the `phases` array** (`src/App.jsx:19-568`) into a `src/data/curriculum.js` module. This is the single highest-value refactor: it shrinks `App.jsx` by roughly two thirds, unblocks per-module testing, and makes content edits diff-readable. See DEBT-01.
14. **Split `App.jsx` into one file per component** (`Diagram`, `NotesPad`, `RagPlayground`, `ContentBlock`, `Md`, `Quiz`, `ReviewMode`, `SidebarItem`, `AppCore`, `ToastProvider`). The README argues for the single-file architecture as a "feature for embedding"; in practice the project does not embed anywhere and the file is what is making the rest of this list slow to land. See DEBT-01.
15. **Promote `localStorage` access behind a small hook** (`useProgress`, `useNotes`) so the storage schema can evolve safely. The current `STORE_KEY = "agentic-ai-nav-v5"` (line 574) already implies a versioned schema; a hook would centralise that versioning. See DEBT-02.
16. **Add a CI matrix that builds against Node 20 and Node 22**, since the README claims "Node 18+" but Vite 7 requires Node 20.19 or 22.12 minimum. The advertised range is wrong. See DEP-02.

## Honest "Already Good" List

Not every finding is a flaw, and a senior review that does not say so reads as insincere. The following are genuinely well done:

- **Zero runtime crashes on storage failure** (`src/App.jsx:577-586`). Both `loadFromStorageSync` and `saveToStorage` swallow exceptions and fall back to the default state. Quota-exceeded errors will not break the app.
- **Deterministic quiz shuffle** (`src/App.jsx:1032-1044`). The shuffle is seeded from `stepId * 2654435761` so the same question always produces the same option order across sessions. This is a real touch.
- **Memoisation discipline on the leaf components** (`Diagram`, `NotesPad`, `RagPlayground`, `ContentBlock`, `Md`, `Quiz`, `SidebarItem` are all `memo()`-wrapped at their declaration sites). The README's claim of memoisation is accurate.
- **Three-deploy-target story** (Vercel via `vercel.json`, Netlify via `netlify.toml`, plus a documented Cloudflare/GH-Pages path in the README). Each one ships SPA rewrites, which is the easy thing to forget.
- **The `Diagram` component is genuinely impressive**. A hand-rolled React-SVG renderer with Bezier-curved edges and node descriptions is a sensible choice over pulling in d3 or a graph library.

## License Decision

`README.md` (lines 401-425) prints the MIT text inline but no `LICENSE` file exists at the repo root. This audit adds `LICENSE` set to MIT with `Animesh Kumar`, 2026. Owner can swap the year or holder name as needed.

## Detailed Reports

- [code-review.md](code-review.md)
- [security-review.md](security-review.md)
- [performance-review.md](performance-review.md)
- [dependencies.md](dependencies.md)
- [testing-gaps.md](testing-gaps.md)
- [tech-debt-and-refactoring.md](tech-debt-and-refactoring.md)
- [accessibility-and-ux.md](accessibility-and-ux.md)

Severity scale: `critical`, `high`, `medium`, `low`. Effort scale: `small` (under 1 hour), `medium` (1 to 4 hours), `large` (over a day).
