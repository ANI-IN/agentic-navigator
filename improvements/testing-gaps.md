# Testing Gaps

The repo has **zero automated tests** and **no test framework configured** in `package.json`. The README does not claim otherwise. This report documents what is exposed by the absence and the lowest-risk path to coverage.

## TEST-01: No test framework

- **Severity:** High
- **Effort:** Medium

There is no `vitest`, `jest`, `@testing-library/react`, or `playwright` in `package.json`. There is no `tests/` or `__tests__/` directory. `npm run test` does not exist as a script.

Suggested framework: **Vitest** plus **@testing-library/react** plus **jsdom**. Reasons: Vitest reuses Vite's config, runs about ten times faster than Jest on this project, has a watch UI that matches Vite's DX, and ships TypeScript / JSX support out of the box. Bundle and CI cost are negligible because everything is `devDependencies`.

Suggested install:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `package.json`:

```jsonc
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

Add a `vitest.config.js` (or extend `vite.config.js`) with `environment: 'jsdom'`. Then create `src/test-setup.js` importing `@testing-library/jest-dom`.

## What to test, in priority order

The single-file `src/App.jsx` makes testing harder than it should be (see DEBT-01). The list below is ordered by risk versus effort given the current shape.

### 1. Storage round-trip (highest value, lowest coupling)

- **Code under test:** `loadFromStorageSync` and `saveToStorage` (`src/App.jsx:573-586`)
- **Why:** Storage is the only place state crosses a boundary. A bug here loses user progress.
- **What to assert:**
  - `loadFromStorageSync()` returns `defaultState` when `localStorage` is empty.
  - `loadFromStorageSync()` returns merged state when partial state is stored.
  - `loadFromStorageSync()` falls back to `defaultState` when JSON is malformed (today the catch swallows the error; a test pins that contract).
  - `saveToStorage(s)` writes a JSON-serialisable string and does not throw on quota exceeded (stub `setItem` to throw).
- **Blocker today:** Both functions are not exported. They become testable once they move into `src/lib/storage.js` (see DEBT-01 in `tech-debt-and-refactoring.md`).

### 2. Quiz shuffle determinism

- **Code under test:** the `useMemo` block in `Quiz` (`src/App.jsx:1032-1044`)
- **Why:** The README highlights determinism as a feature. A regression here would silently reorder answers per session and break completed-quiz replay.
- **What to assert:**
  - For a given `stepId`, the same `(shuffledOptions, shuffledCorrectIndex, originalIndexMap)` is produced across calls.
  - `originalIndexMap[shuffledCorrectIndex] === act.correctIndex`.
  - For `stepId = 0`, the shuffle is still deterministic (regression test against the seed math).
- **Blocker today:** The shuffle is inlined inside the `Quiz` component body. Either render `<Quiz>` in jsdom and read DOM order, or extract `shuffleOptions(act, stepId)` into a pure helper.

### 3. Module-gating logic

- **Code under test:** `isUnlocked` (`src/App.jsx:1280`)
- **Why:** The whole curriculum progression rests on this one line. An off-by-one means either every module is unlocked, or none past the first are.
- **What to assert:**
  - Index 0 is always unlocked.
  - Index `n` is unlocked iff `steps[n-1].id` is in `prog.completed`.
  - Behaviour when `steps[n-1]` does not exist (off-the-end guard).

### 4. Markdown renderer output shape

- **Code under test:** `Md` (`src/App.jsx:1010-1024`)
- **Why:** SEC-01 and CODE-06 both point to it. A snapshot test pins the current contract so any future change to the regex pipeline is visible in code review.
- **What to assert:**
  - Headings render with the expected `class`.
  - Bold + italic + inline code render correctly.
  - HTML-special characters in the input are not escaped today (regression test pins that, so any later sanitiser change is intentional).
- **Blocker today:** `Md` is not exported; same fix as #1.

### 5. Smoke render

- **Code under test:** `<App />`
- **Why:** Just confirms the bundle renders something without crashing. Catches "broke the build" regressions.
- **What to assert:**
  - `<App />` renders without throwing.
  - The first module's title is in the DOM.

## What is not worth testing now

- The animated SVG `Diagram` positions. The math is hand-tuned; pinning pixel coordinates in tests would block any future style adjustment.
- The toast animation timings. They are CSS, not logic.
- The Vercel and Netlify config files. They are statically reviewed, not unit-testable.

## Coverage targets

Once the lift in DEBT-01 lands, realistic targets are:

| Area | Target line coverage |
| --- | --- |
| `src/lib/storage.js` | 100% |
| `src/lib/shuffle.js` | 100% |
| `src/lib/markdown.js` | 95% |
| `src/components/Quiz.jsx` | 80% |
| `src/components/ContentBlock.jsx` | 60% |
| Everything else | best effort |

Aggregate target for `vitest run --coverage`: **70% lines / 60% branches**. The README is content-heavy and visual; chasing higher coverage would not buy proportional safety.

## Manual QA checklist

Until automation lands, the checklist below should run on every change that touches `src/App.jsx`. Five minutes, covers the regressions most likely to ship:

1. Fresh load with empty `localStorage`. Module 1 visible, no errors in console.
2. Answer module 1 quiz correctly. Confetti fires. Module 2 unlocks.
3. Answer module 1 quiz incorrectly twice. Shake animation runs. Hint becomes available.
4. Refresh the page. Module 2 is still unlocked.
5. Open the notes pad, write text, navigate away, come back. Notes persist.
6. Export notes via the "Export" button. The downloaded markdown file contains the notes.
7. Click "Reset Progress" and confirm. Storage is cleared, module 1 is the only unlocked module.
8. Resize the viewport to 360px wide. Layout reflows correctly, diagrams stay legible.

This checklist is also in `docs/getting-started.md` so a new contributor can run it without context.
