# Contributing

Thanks for considering a contribution. The fastest path to a merged PR is below.

## Quick start

```bash
git clone https://github.com/ANI-IN/agentic-navigator.git
cd agentic-navigator
npm install
npm run dev
```

See `docs/getting-started.md` for the long version, including the manual QA checklist.

## Ground rules

- **Node 20.19+ or 22.12+.** Vite 7 will not start on Node 18.
- **One logical change per PR.** Splitting a refactor from a feature makes review faster.
- **No new runtime dependencies without discussion.** The project ships React and ReactDOM only. New packages add bundle weight and supply-chain surface.
- **Lint must not get worse.** Today `npm run lint` reports 12 errors in `src/App.jsx`. PRs should bring that number down (or at least not up).
- **No secrets in commits.** There are no API keys today and there should not be any tomorrow.

## What is in scope

- Curriculum content: new modules, corrections to existing modules, better diagrams.
- Accessibility improvements (see `improvements/accessibility-and-ux.md`).
- Performance and bundle-size work (see `improvements/performance-review.md`).
- Refactors that break `src/App.jsx` into smaller modules (see `improvements/tech-debt-and-refactoring.md` DEBT-01 for the proposed shape).
- Tests, once a test framework is added (see `improvements/testing-gaps.md`).
- Documentation improvements.

## What is out of scope

- A backend. The app is intentionally client-side; progress lives in `localStorage` only.
- A CMS. Curriculum lives in `src/App.jsx` as data; that is a deliberate choice for now.
- Translations. The infrastructure does not exist yet. Tracked as a follow-up.
- New deployment targets beyond Vercel, Netlify, Cloudflare Pages, and GitHub Pages.

## Branching and commits

- Branch from `main`. Use descriptive names like `feat/add-mcp-module` or `fix/quiz-shuffle`.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `build:`, `perf:`.
- Keep commit messages short and specific. The PR description is for context.

## Code style

- JSX, not TSX (for now).
- 2-space indentation.
- Function components plus hooks. No class components.
- Wrap leaf components in `React.memo` if they take stable props. Wrap event handlers passed to memoised children in `useCallback`.
- Inline styles are fine today (the project uses them throughout), but new big pieces of styling should live in `src/index.css` or a sibling stylesheet.
- ARIA labelling is mandatory on every interactive element. Look at how the existing components do it before adding new ones.

## Adding a module

Open `src/App.jsx`, find the `steps` array (lines 28-568), and copy the last entry. A complete module needs:

- `id`, `phase`, `title`, `conceptName`, `icon`
- `markdownContent` (subset of markdown: `###`, `####`, `**bold**`, `*italic*`, backtick code, `-` lists, `1.` ordered lists)
- `keyTakeaways` array
- `diagram` with `nodes` and `edges`, each node positioned with `x` and `y` in 0..1 space
- `activity` with `question`, `options` (4), `correctIndex` (0-based, points into the original `options` array), `explanation`, optional `hint`

If the new module crosses into a new phase, update the `phases` array (lines 19-26) and adjust the `range` of the previous phase.

Validate by running through the manual QA checklist in `docs/getting-started.md`.

## Filing a bug

Open a GitHub issue using `.github/ISSUE_TEMPLATE/bug_report.md`. Include the browser, device, exact steps, expected vs actual behaviour, and a screenshot or screen recording if relevant.

## Filing a feature request

Open a GitHub issue using `.github/ISSUE_TEMPLATE/feature_request.md`. Include the problem you are trying to solve, not just the solution. Many feature requests turn out to be content gaps in the curriculum, which are easier and faster to ship.

## Reviewing

If you have commit access, the review checklist is:

1. Does the PR follow the branching and commit rules?
2. Does `npm run lint` exit with no more errors than `main`?
3. Does `npm run build` succeed?
4. Did the contributor run the manual QA checklist?
5. Are there new dependencies? If yes, are they justified in the PR description?
6. Does the change update or break any of the findings in `improvements/`?

## Where to find more context

- `README.md` (after this PR lands, the corrected version).
- `docs/architecture.md` for the system overview.
- `docs/getting-started.md` for local setup.
- `improvements/IMPROVEMENT_PLAN.md` for the audit findings and the prioritized roadmap.
- `SECURITY.md` for the security disclosure path.
- `CODE_OF_CONDUCT.md` for community expectations.
