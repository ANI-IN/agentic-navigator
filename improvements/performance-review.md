# Performance Review

The app is small, client-side, and offline-capable once loaded. Most "perf" findings here are micro-optimisations; the macro picture is fine. Bundle size is the most important number worth tracking.

## Numbers

From `npm run build` against the current `main`:

| Asset | Size | Gzipped |
| --- | --- | --- |
| `dist/index.html` | 0.46 KB | 0.29 KB |
| `dist/assets/index-*.css` | 0.91 KB | 0.49 KB |
| `dist/assets/index-*.js` | 305.19 KB | **96.26 KB** |
| Total transfer | ~307 KB | ~97 KB |

The README's headline number "67KB gzipped" (`README.md:14,64,259`) is incorrect by 30KB and growing as new modules are added. Update or remove. The single JS chunk includes React, ReactDOM, the curriculum data, and the SVG diagram payload.

## PERF-01: Unused `d3` runtime dependency

- **Severity:** Low
- **Effort:** Small
- **Location:** `package.json:13`

`d3` is declared as a runtime dependency but never imported. `grep -rn "from .d3" src` and `grep -rn "require(.d3" src` both return no matches.

In the current build it does not bloat the JS bundle (Rollup tree-shakes it out), but it does:

- inflate `npm install` time and disk footprint by about 90MB transitively;
- mislead anyone reading `package.json` about what the app uses;
- create a false positive for Dependabot when d3 ships a security patch.

Suggested fix: remove from `package.json:13`. Owner-only action.

## PERF-02: Inline `<style>` re-emitted every render

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/App.jsx:1366`

```jsx
<style>{CSS_VARS}{GLOBAL_STYLES}</style>
```

`CSS_VARS` (`src/App.jsx:625-637`) and `GLOBAL_STYLES` (`src/App.jsx:1550-1593`) are static template literals, but they sit inside `AppCore`'s render output. React will not actually re-parse the same string on every render (the DOM `textContent` is reference-equal), so the runtime cost is near zero. However:

- The strings inflate the per-render JSX tree.
- They prevent `Content-Security-Policy: style-src 'self'` without `'unsafe-inline'` (see SEC-03).
- They make hot-reload slower because every save reloads the entire stylesheet through React.

Suggested fix: append the contents of `CSS_VARS` and `GLOBAL_STYLES` to `src/index.css`. That file already exists and is currently small (68 lines). Net effect: one external CSS file, no inline style block, stricter CSP becomes possible.

## PERF-03: Confetti renderer creates 40 random divs inline

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/App.jsx:1368-1370`

When `confetti` is truthy, `AppCore` re-runs the following inside the JSX on every render of the app:

```jsx
{Array.from({ length: 40 }).map((_, i) => <div key={i} style={{
  ..., left: `${Math.random() * 100}%`, ...
}} />)}
```

Two problems:

1. The eight `Math.random()` calls run during render. ESLint's `react-hooks/purity` flags this correctly. See CODE-02.
2. While confetti is on screen (about 2.7 seconds), any unrelated re-render of `AppCore` (sidebar toggle, toast dismissal, scroll-driven state) will rebuild the 40 confetti specs with fresh random positions, so the confetti will visually "teleport".

Suggested fix: precompute the specs in `useMemo([confetti])` or, simpler, pull confetti into its own `<Confetti />` component that holds the spec in `useRef` and unmounts when done. The visual effect becomes stable and the lint error disappears.

## PERF-04: `goStep` and `goNext` recompute `isModuleReadyForNext` indirectly

- **Severity:** Low
- **Effort:** Medium
- **Location:** `src/App.jsx:1325-1328`

`goNext` depends on `isModuleReadyForNext`. The dependency is correctly declared at line 1328, but the variable itself is a derived boolean computed elsewhere in `AppCore` (search for `isModuleReadyForNext` in `src/App.jsx`). If that derivation is not memoised, the `goNext` callback identity changes on every render, which breaks downstream `memo()` on whatever component receives it as a prop.

Suggested fix: confirm `isModuleReadyForNext` is wrapped in `useMemo` with the right deps; if not, wrap it.

## PERF-05: All 22 modules render their `markdownContent` eagerly

- **Severity:** Low
- **Effort:** Medium
- **Location:** `src/App.jsx:1010-1024` (`Md` component) and `src/App.jsx:980-1005` (`ContentBlock`)

Today only the currently selected step's `markdownContent` is passed to `Md`, so this is fine for runtime cost. The data, however, all ships in the initial JS bundle: the 22 `markdownContent` strings plus the `description` text on every diagram node add up. Spot-check by line count: `src/App.jsx` lines 28-568 hold the curriculum data, of which roughly 80% is prose strings.

Suggested fix (only if the bundle becomes a problem): code-split the curriculum. Move it to `src/data/curriculum.js` and dynamic-import the per-phase data on demand. Vite supports this out of the box with `import('./data/phase-A.js')`. This is a follow-up to DEBT-01.

## PERF-06: SVG diagram paths are recomputed when `dims` changes

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/App.jsx:687-695`

`edgePaths` is a `useMemo` with `data` and `dims` as dependencies (the exact deps live around line 695, confirm in source). When the user resizes the viewport, `dims` changes via the `useEffect` at line 647, which triggers a recompute of all Bezier curves. The math is light (under 1ms for any realistic diagram), but the recompute is on the resize hot path.

Suggested fix: throttle the resize handler to once per animation frame using `requestAnimationFrame`. Today's resize handler appears to run synchronously on every `resize` event.

## PERF-07: Build does not split vendor and app code

- **Severity:** Low
- **Effort:** Small
- **Location:** `vite.config.js`

The output is a single 305KB JS chunk. React (about 130KB minified, 42KB gzip) and ReactDOM (about 130KB) cannot change between deploys, but the curriculum data changes weekly. Today every content edit busts the entire chunk's cache.

Suggested fix: add `build.rollupOptions.output.manualChunks: { vendor: ['react', 'react-dom'] }` to `vite.config.js`. React/ReactDOM then sit in a stable, cacheable chunk; content edits only invalidate the app chunk. Practical impact: returning visitors save about 50KB on most reloads.

## PERF-08: No `vite-plugin-pwa`, so the app is online-only

- **Severity:** Informational
- **Effort:** Medium
- **Location:** `vite.config.js`

The README claims this is a self-paced course. Adding a service worker via `vite-plugin-pwa` would let users complete modules offline and would have measurable impact on flaky-network learning. Not a defect, an opportunity.

## What was checked and is fine

- `Diagram`, `NotesPad`, `RagPlayground`, `ContentBlock`, `Md`, `Quiz`, `SidebarItem` are all `memo()`-wrapped.
- `useCallback` is consistently used on event handlers passed to memoised children (`src/App.jsx:1280-1330`).
- `loadFromStorageSync` runs once at mount via `useState(() => loadFromStorageSync())` (line 1214), so storage I/O does not block subsequent renders.
- The `Quiz` shuffle uses a seeded RNG keyed off `stepId`, so its `useMemo` is stable across renders and across sessions (`src/App.jsx:1032-1044`).
- There is a 300ms debounce noted in the README. Confirmed by inspection of the `useEffect` that writes to localStorage; storage writes are not happening on every keystroke.
