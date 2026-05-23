# Dependencies Review

Snapshot taken against `package.json` at `main` (commit `28e3aed`). The dependency surface is intentionally tiny: 2 runtime, 9 dev.

## Runtime Dependencies

| Package | Declared | Latest stable | Status | Notes |
| --- | --- | --- | --- | --- |
| `react` | `^19.2.0` | 19.x | OK | Pinned to caret, picks up minor and patch. |
| `react-dom` | `^19.2.0` | 19.x | OK | Should always match `react`. |
| `d3` | `^7.9.0` | 7.x | **Unused, remove** | See DEP-01. |

## Dev Dependencies

| Package | Declared | Status | Notes |
| --- | --- | --- | --- |
| `@eslint/js` | `^9.39.1` | OK | ESLint 9 flat config baseline. |
| `eslint` | `^9.39.1` | OK | Matches `@eslint/js`. |
| `eslint-plugin-react-hooks` | `^7.0.1` | OK | This is the version that enables the `react-hooks/purity` rule that is failing today (see CODE-02). |
| `eslint-plugin-react-refresh` | `^0.4.24` | OK | Recommended for Vite + React. |
| `globals` | `^16.5.0` | OK | |
| `@types/react` | `^19.2.7` | OK | Type declarations only, no runtime. |
| `@types/react-dom` | `^19.2.3` | OK | |
| `@vitejs/plugin-react` | `^5.1.1` | OK | |
| `vite` | `^7.3.1` | OK | Requires Node 20.19 or 22.12 minimum, see DEP-03. |

## DEP-01: `d3` is declared but never imported

- **Severity:** Low
- **Effort:** Small
- **Location:** `package.json:13`

`grep -rn "d3" src public` returns no matches outside of strings inside the `steps` array (where "d3" appears as a node id in one diagram). The package is dead weight. Disk footprint: roughly 90MB transitively in `node_modules`. Bundle impact: zero, because Rollup tree-shakes it.

Suggested fix: `npm uninstall d3` and let the lockfile update.

## DEP-02: No automated dependency hygiene in CI

- **Severity:** Medium
- **Effort:** Small
- **Location:** No `.github/workflows/` exists today

There is no:

- `npm audit` step in CI;
- Dependabot configuration;
- Renovate configuration;
- lockfile freshness check (e.g. `npm ci` plus a follow-up `git diff --exit-code` on `package-lock.json`).

A new dependency CVE will not surface until someone runs `npm audit` manually.

This PR's `.github/workflows/ci.yml` adds an `npm audit --audit-level=high` step that fails the build on high or critical advisories. To get the higher-cadence signal of Dependabot, owner enables it in Settings > Code security > Dependabot alerts.

## DEP-03: README documents the wrong Node version

- **Severity:** Medium
- **Effort:** Small
- **Locations:** `README.md:133`, `package.json` (no `engines` field)

`README.md:133` says "Node.js 18+ (LTS recommended)". Vite 7 dropped Node 18 support and requires Node 20.19.x or Node 22.12.x or later. A contributor on Node 18 will see `npm install` succeed and `npm run dev` fail with a confusing error.

Suggested fix (proposed, not applied):

1. Update `README.md` (or, since the existing README is immutable per Hard Rule 2, see `docs/README.proposed.md` which already documents the correct Node range).
2. Add an `"engines": { "node": ">=20.19.0" }` block to `package.json`. This makes `npm install` warn (and `npm install --engine-strict` fail) on the wrong runtime.

## DEP-04: Two lockfiles checked in

- **Severity:** Low
- **Effort:** Small
- **Location:** `package-lock.json` (canonical, 115838 bytes) and `package-lock copy.json` (older, 59612 bytes)

Same issue as CODE-03. The "copy" lockfile diverges from the current dependency graph; if a contributor's editor or build script ever picks the wrong one, `npm` will reinstall from a stale dependency tree. Delete the copy.

## DEP-05: No `audit` or `outdated` script in `package.json`

- **Severity:** Informational
- **Effort:** Small
- **Location:** `package.json:6-11`

The current scripts block is `dev`, `build`, `lint`, `preview`. Adding `"audit": "npm audit --audit-level=high"` and `"outdated": "npm outdated"` gives contributors a one-word command to surface dependency drift between releases.

## DEP-06: `d3` aside, no other transitive risk surfaces today

Manual sweep of the resolved dependency tree (`npm ls --all`) shows no:

- packages flagged by `npm audit` at high or critical;
- known-deprecated packages;
- packages without a license declared.

If `d3` is removed, the dev-deps-only `@types/d3` would also disappear from the transitive graph. The graph then collapses to React + Vite + ESLint, all of which are healthy upstreams.

## Inventory of all production dependencies actually used

Useful for future audits. From `grep -rEon "from \"[a-z]" src`:

- `react` (hooks API): `src/App.jsx:1`, `src/main.jsx:1`
- `react-dom/client`: `src/main.jsx:2`

That is it. The entire SPA is two `import` statements deep on the runtime side. The 305KB bundle therefore consists almost entirely of React + ReactDOM + the curriculum data.
