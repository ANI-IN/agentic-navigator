# Tech Debt and Refactoring Opportunities

The app works. None of the items below are bugs; they are structural choices that will get more expensive the longer they sit.

## DEBT-01: Single-file architecture

- **Severity:** High
- **Effort:** Large
- **Location:** `src/App.jsx:1-1597`

The single biggest piece of work for this codebase. Everything else on this list is downstream of it.

What is in the file today:

| Range | Lines | Concern |
| --- | --- | --- |
| 1-14 | 14 | `triggerHaptic` helper |
| 19-26 | 8 | `phases` array |
| 28-568 | 540 | `steps` array (22 modules of curriculum content) |
| 573-586 | 14 | storage helpers and constants |
| 591-620 | 30 | `ToastProvider` + `useToast` |
| 625-637 | 13 | `CSS_VARS` template literal |
| 642-813 | 172 | `Diagram` SVG renderer |
| 818-891 | 74 | `NotesPad` |
| 896-975 | 80 | `RagPlayground` |
| 980-1005 | 26 | `ContentBlock` |
| 1010-1024 | 15 | `Md` markdown renderer |
| 1029-1134 | 106 | `Quiz` |
| 1139-1182 | 44 | `ReviewMode` |
| 1187-1208 | 22 | `SidebarItem` |
| 1213-1545 | 333 | `AppCore` (the main shell) |
| 1550-1593 | 44 | `GLOBAL_STYLES` template literal |
| 1596-1597 | 2 | default export wrapper |

Suggested decomposition (proposed, not applied yet):

```
src/
  data/
    phases.js                  // 8 lines
    curriculum.js              // about 540 lines, one entry per module
  lib/
    storage.js                 // defaultState, STORE_KEY, load/save helpers
    haptics.js                 // triggerHaptic
    shuffle.js                 // seeded shuffle helper extracted from Quiz
    markdown.js                // Md renderer (eventually with DOMPurify)
  components/
    Toast.jsx                  // ToastProvider, useToast
    Diagram.jsx                // SVG renderer
    NotesPad.jsx
    RagPlayground.jsx
    ContentBlock.jsx
    Quiz.jsx
    ReviewMode.jsx
    SidebarItem.jsx
    AppCore.jsx
  styles/
    global.css                 // CSS_VARS + GLOBAL_STYLES
  App.jsx                      // about 12 lines, just ToastProvider + AppCore
  main.jsx                     // unchanged
```

Per Hard Rule 2 this audit does not move anything; the diff is the owner's call. A worked example of the smallest first step (extracting `phases` and `steps`) is described in CODE-01.

The README markets the single-file shape as a feature for embedding. The codebase has no actual embed consumers; the deploy story is "build with Vite, host the `dist/`". The argument for keeping it does not hold.

## DEBT-02: Inline-styles-only design system

- **Severity:** Low
- **Effort:** Medium
- **Location:** every `style={{ ... }}` in `src/App.jsx`

Roughly 200+ inline-style objects. They reference CSS variables defined in the runtime-injected `<style>` block, which is the cleverest part of the approach: most theming is driven by CSS custom properties, so a future dark/light toggle is feasible by switching the `:root` block.

The cost shows up in three places:

1. **CSP can never be tightened past `style-src 'unsafe-inline'`** until the inline style blocks move into a static CSS file (see SEC-03, PERF-02).
2. **Style reuse is copy-paste.** Cards, buttons, badges are repeated inline rather than extracted to classes. A visual tweak touches 20+ locations.
3. **No tooling can lint the styles.** A typo in a CSS property name fails silently at runtime.

Suggested fix: move the bulk of the styles to `src/styles/global.css` (or PostCSS modules) and use semantic class names for the cards and buttons. The CSS variables can stay; only the JSX changes from `style={{ ... }}` to `className="card"`.

This is a follow-up to DEBT-01: easier to do once the components are split.

## DEBT-03: No type safety

- **Severity:** Low
- **Effort:** Medium
- **Location:** All `.jsx` files

The repo uses JSX, not TSX. `@types/react` and `@types/react-dom` are installed but only for IDE hovers. Module objects in the `steps` array are duck-typed; a missing `keyTakeaways` or a misspelled `correctIndex` blows up at render time.

Cheapest path forward: add `// @ts-check` to `src/App.jsx` and a `jsconfig.json` enabling `checkJs: true`. That gives IDE warnings without the full TypeScript migration.

Heavier path: rename to `.tsx` and let `tsc --noEmit` run in CI.

This is not a high priority while the file is monolithic; defer until DEBT-01 lands.

## DEBT-04: `STORE_KEY = "agentic-ai-nav-v5"` implies a migration history but no migration code

- **Severity:** Low
- **Effort:** Medium
- **Location:** `src/App.jsx:574`

The `v5` suffix suggests the schema has changed five times. Anyone with a `v4` payload in their `localStorage` today will see their progress wiped on next visit because `loadFromStorageSync` only reads `agentic-ai-nav-v5`. That is a deliberate choice (kill old data on schema break) but it is not documented.

Suggested fix: either document the policy in a comment, or add a `migrate(rawV4)` path that lifts old keys forward. For a course app, the wipe-on-break is acceptable; a one-line comment in code makes the intent explicit.

## DEBT-05: 22 hand-tuned diagram coordinate sets

- **Severity:** Informational
- **Effort:** Medium

Each module in `steps` (`src/App.jsx:28-568`) ships a `diagram` object with `nodes` (each with `x`, `y` in 0..1 space) and `edges`. The 22 diagrams contain roughly 130 nodes total, every coordinate hand-placed. That is a real authoring burden for adding new modules and is the most likely place a future contributor will paste a node off-screen.

Optional improvement: a tiny dev-only "diagram preview" page that lets an author drag nodes and copy the resulting JSON into a module. Out of scope for this audit; flagged as the easiest future-DX win for content authors.

## DEBT-06: `idxInPhase` declared but never used (`src/App.jsx:1431`)

- **Severity:** Low
- **Effort:** Small

Dead code. The variable is computed but never referenced. Either remove it or prefix with `_`. Already on the lint baseline as one of the 12 errors.

## DEBT-07: `console.log`-free, but also `logError`-free

- **Severity:** Informational
- **Effort:** Small

Already covered in CODE-08. Mentioned again here because the right place to fix it is when `src/lib/` is introduced.

## What an "Agentic AI Navigator v2" would look like

This section is opinion, not finding. If a v2 were on the table:

- **Source of truth in MDX, not JS.** Module markdown lives in `content/01-the-engine.mdx`, diagrams declared in YAML front-matter or sidecar JSON. Authors edit text files, not JS objects.
- **Per-phase chunks loaded on demand.** Phase A's content is in the initial bundle; Phase B onward dynamic-imported when reached. Bundle drops by about 60% for first paint.
- **Vitest + Playwright in CI.** Every module gets a "renders without crashing" smoke and a "quiz round-trip" e2e.
- **Service worker.** Course content cached for offline study.
- **Internationalisation.** Curriculum strings extracted; the navigator becomes localisable.

None of this is needed today. Documented here because the "what to do next after the refactor" question always comes up.
