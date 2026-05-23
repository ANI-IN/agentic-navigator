# Getting Started

This guide takes a fresh machine to a running local copy of Agentic AI Navigator. No accounts, no API keys, no environment variables.

## Prerequisites

- **Node.js 20.19+ or 22.12+** (Vite 7 requirement). Verify with `node --version`.
- **npm 9+** (ships with Node 20). Verify with `npm --version`.
- A modern browser. Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

> Heads-up: the existing `README.md` says "Node 18+". That is incorrect for Vite 7. Use Node 20.19 or later, or Vite will refuse to start.

## Clone and install

```bash
git clone https://github.com/ANI-IN/agentic-navigator.git
cd agentic-navigator
npm install
```

`npm install` pulls about 195 packages. Only `react` and `react-dom` are runtime dependencies; everything else is dev tooling.

## Run the dev server

```bash
npm run dev
```

Vite starts at `http://localhost:5173`. The dev server has hot module reload; saving `src/App.jsx` updates the browser in roughly 100ms.

## Build and preview the production bundle

```bash
npm run build      # outputs dist/, about 305KB JS / 96KB gzip
npm run preview    # serves dist/ on http://localhost:4173
```

`preview` is what Vercel and Netlify simulate at deploy time. Use it for last-mile smoke testing.

## Lint

```bash
npm run lint
```

Today this exits 0 with no errors. Keep it that way; PRs that introduce lint errors should be fixed before merge.

## Manual QA checklist

If you change anything in `src/App.jsx`, run through the following before opening a PR. Five minutes, catches most regressions:

1. Fresh load with empty `localStorage`. Module 1 is visible. No console errors.
2. Answer module 1's quiz correctly. Confetti animation plays. Module 2 unlocks.
3. Open the notes pad on module 2, type something, navigate to module 3, navigate back. The note is still there.
4. Click "Export Notes" in the header. A markdown file downloads. Open it; it contains the note from step 3.
5. Reload the page. Progress, XP, and notes persist.
6. Click "Reset Progress" and confirm. Storage clears. Module 1 is the only unlocked module again.
7. Resize the browser to 360px wide. The layout reflows. Diagrams stay readable.
8. Use keyboard only: press `N` to advance, `P` to go back, `Tab` to move between buttons.

## File layout to know about

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | The entire app, 1597 lines. Start here. |
| `src/main.jsx` | React mount point. Rarely edited. |
| `index.html` | HTML shell. Rarely edited. |
| `package.json` | Dependencies and scripts. |
| `vite.config.js` | Vite configuration. |
| `vercel.json` / `netlify.toml` | Deploy-target configs. |

## Where to look when adding a module

In `src/App.jsx`:

- `phases` (lines 19-26) defines the six phase buckets.
- `steps` (lines 28-568) is the module array. Each entry needs `id`, `phase`, `title`, `conceptName`, `icon`, `markdownContent`, `keyTakeaways`, `diagram`, and `activity`. The shape is documented in the existing `README.md` "Customization" section (lines 296-323).

For a worked example, copy module 22 (the last entry in `steps`), increment the `id`, and adjust the phase `range` in `phases`.

## Where to look when reporting a bug

- `SECURITY.md` for the known risk areas and the security disclosure path.
- Open a new GitHub issue using the bug template at `.github/ISSUE_TEMPLATE/bug_report.md`.
