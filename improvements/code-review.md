# Code Review

Evidence-based findings against the current `main` branch. Each entry cites file and line range. Nothing in this report is implemented; it is advisory.

## CODE-01: Monolithic `src/App.jsx` (1597 lines)

- **Severity:** High
- **Effort:** Large
- **Location:** `src/App.jsx:1-1597`

The entire app lives in one file. That file contains: the haptics helper (lines 1-14), all 22 module objects (`steps`, lines 28-568), state persistence helpers (lines 573-586), `ToastProvider` (lines 593-618), inline CSS strings (lines 625-637 and 1550-1593), and eight memoised components plus `AppCore` (lines 642-1545).

Why it matters:

- The file is the only real blocker on writing unit tests. Vitest can mock React hooks, but to test the `Quiz` shuffle in isolation you have to import a 1597-line module, which forces the entire `steps` array, the `Diagram` SVG paths, and `localStorage` calls to load at test time.
- Diff review is slow. A one-line change to a quiz answer requires reviewers to scroll past 1500 unrelated lines to find it.
- The README explicitly markets the single-file architecture as a feature ("Development Guidelines: Keep the single-file architecture, it enables easy sharing and embedding", `README.md:390`). In practice the file is not embedded anywhere; the deploy story is "build with Vite and serve `dist/`".

Suggested fix (proposed, not applied):

1. Move `phases` and `steps` to `src/data/curriculum.js`. Drops about 540 lines.
2. Move each `memo()`-wrapped component to its own file under `src/components/`. The natural seams are already drawn by the block-comment dividers in the file.
3. Move `CSS_VARS` and `GLOBAL_STYLES` to `src/index.css` (which already exists at 68 lines) or a sibling `src/styles/global.css`.
4. Keep `App.jsx` as a thin shell that renders `<ToastProvider><AppCore /></ToastProvider>`.

Estimated final size: `App.jsx` shrinks to under 50 lines; the other 1547 lines move into 8 to 10 files under 200 lines each.

## CODE-02: Lint baseline is failing (12 errors)

- **Severity:** Medium
- **Effort:** Small

`npm run lint` exits 1 today. Counts by rule:

| Rule | Count | Location |
| --- | --- | --- |
| `react-hooks/purity` | 8 | `src/App.jsx:1369` (the eight `Math.random()` calls in the confetti renderer) |
| `react-hooks/purity` | 3 | additional `Math.random()` references in the same file, run `npm run lint` to see exact lines |
| `no-unused-vars` | 1 | `src/App.jsx:1431` (`idxInPhase` declared but never used) |

The new eslint flat config (`eslint.config.js`) opted into `reactHooks.configs.flat.recommended`, which now includes the `react-hooks/purity` rule. The confetti renderer at `src/App.jsx:1369` builds an array of 40 random-positioned divs inline during render, which the rule correctly flags.

Suggested fix (proposed, not applied):

```jsx
// Replace this (src/App.jsx:1368-1370):
{confetti && <div ...>
  {Array.from({ length: 40 }).map((_, i) => <div key={i} style={{ ..., left: `${Math.random() * 100}%`, ... }} />)}
</div>}

// With a memoised array generated when confetti turns on:
const confettiSpecs = useMemo(() => {
  if (!confetti) return null;
  return Array.from({ length: 40 }, (_, i) => ({
    key: i,
    left: Math.random() * 100,
    size: 5 + Math.random() * 7,
    duration: 1.2 + Math.random() * 1.5,
    delay: Math.random() * 0.4,
    round: Math.random() > 0.5,
  }));
}, [confetti]);
```

The 8 purity errors all collapse to one `useMemo` recalc that runs only when confetti toggles. For `idxInPhase` at line 1431, either remove the variable or prefix it with `_` since the eslint config already allows `varsIgnorePattern: '^[A-Z_]'`.

A patch file is not provided per the audit add-on settings, but the change is mechanical.

## CODE-03: Committed Finder duplicate files

- **Severity:** Low
- **Effort:** Small
- **Location:** Repo root

Five files appear to be macOS Finder "Duplicate" output checked in by accident:

```
index copy.html
package copy.json
package-lock copy.json
README copy.md
vite.config copy.js
```

`package copy.json` is materially different from `package.json`: it lists `agentic-ai-navigator` instead of `agent-app`, declares React 18.3 instead of 19.2, and has no `lint` script. That suggests it predates the rename and the React 19 upgrade. `README copy.md` is 1324 bytes against the canonical 14889 and reads like an early draft.

Nothing in the build references these copies. `eslint.config.js` ignores `dist/` but not these duplicates, so they actually run through lint on every check (`npx eslint .` walks them).

Suggested fix: delete the five files. Owner-only action per Hard Rule 2.

## CODE-04: `README.md` claims do not match the code

- **Severity:** Medium
- **Effort:** Small
- **Locations:** `README.md` vs `package.json` and `src/App.jsx`

| Claim in `README.md` | Reality |
| --- | --- |
| "15 modules across 5 phases" (line 34) | 22 modules across 6 phases. See `src/App.jsx:19-26` for the phase definitions and `src/App.jsx:28-568` for the step objects. |
| "React 18.3" (line 12, line 242) | React 19.2.0 per `package.json:14`. |
| "Vite 6.0" (line 13, line 242) | Vite 7.3.1 per `package.json:26`. |
| "67KB gzipped" (line 14, line 64, line 259) | 96.26KB gzip for `dist/assets/index-*.js`, per `npm run build` output. Bundle has grown with content additions. |
| "Node 18+" prerequisite (line 133) | Vite 7 requires Node 20.19 or 22.12 minimum. Node 18 will not work. |
| Project name "agentic-ai-navigator" in clone instructions (line 140) | The git remote is `agentic-navigator`; `package.json` calls the package `agent-app`. Three different names. |

The accurate-text version of all of the above lives in `docs/README.proposed.md` in this PR.

## CODE-05: `index.html` still ships the Vite template

- **Severity:** Low
- **Effort:** Small
- **Location:** `index.html:5,7`

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
...
<title>agent-app</title>
```

The browser tab reads "agent-app". No description meta tag, no Open Graph tags, no canonical URL. For a public learning tool this is a noticeable polish gap.

Suggested fix: set `<title>Agentic AI Navigator</title>`, add `<meta name="description">`, add Open Graph and Twitter card tags, ship a real favicon under `public/`.

## CODE-06: The `Md` regex pipeline is whitespace-fragile

- **Severity:** Low
- **Effort:** Medium
- **Location:** `src/App.jsx:1010-1024`

The `Md` component runs eight `String.prototype.replace` calls in sequence to convert markdown to HTML, then wraps the whole thing in `<p class="md-p">`. It works for the current curriculum content because the content was authored against this exact subset, but:

- Triple-newline `\n\n\n` is converted to a single `</p><p class="md-p">` boundary, not two, so any deliberate vertical spacing collapses (line 1020).
- An ordered-list marker (`1. foo`) immediately followed by another paragraph stays inside the same `<p>` because step 1020 runs before the OL rule at line 1018. The order of rules matters and is not documented.
- The rules do not escape HTML in the input first. A future content author who pastes `2 < 3` into a `markdownContent` string will get a broken DOM. Today no module does this, but it is a sharp edge.

Suggested fix: replace the regex pipeline with `marked` (about 11KB gzip) plus `DOMPurify` (about 22KB), or, since the markdown source is entirely developer-controlled, keep `Md` but escape `<`, `>`, `&` first and document the rule order.

This is also a precondition for SEC-01.

## CODE-07: `vite.config.js` does not match `vite.config copy.js`

- **Severity:** Informational
- **Effort:** Small
- **Location:** `vite.config.js`, `vite.config copy.js`

Both files declare `plugins: [react()]` and nothing else. The "copy" version differs only in a comment. Worth noting that the production bundle ships with all of React 19 plus the full curriculum payload as a single 305KB JS file. A future tuning lever would be `build.rollupOptions.output.manualChunks` to split the steps array into a separately-cached chunk; not actionable until the data is extracted per CODE-01.

## CODE-08: Console statements appear to be absent (good), but no logger contract exists

- **Severity:** Informational
- **Effort:** Small

`grep -n "console\." src/App.jsx` returns no matches. That is genuinely good; the app does not pollute the browser console. However, several `try { ... } catch { /* ... */ }` blocks silently swallow errors (lines 12, 580, 585, 836, 839, 846, 849). If something goes wrong with `localStorage` or the audio APIs, the user sees no signal. Recommend introducing a small `logError(scope, err)` helper that at minimum calls `console.warn` in development, gated by `import.meta.env.DEV`.
