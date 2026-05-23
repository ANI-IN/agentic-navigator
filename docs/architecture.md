# Architecture

Agentic AI Navigator is a single-page React application. There is no server, no API, no authentication. Everything happens in the browser, and progress is persisted to `localStorage`. This document explains how the pieces fit together and where to look in the code.

## High-level flow

```mermaid
flowchart LR
  user[User<br/>browser] -->|loads| html[index.html]
  html -->|fetches| bundle[Vite-built<br/>JS bundle]
  bundle --> app[App.jsx]
  app -->|wraps| toast[ToastProvider]
  toast -->|hosts| core[AppCore<br/>main shell]
  core -->|renders| content[ContentBlock<br/>per module]
  core -->|sidebar| nav[SidebarItem x N]
  content --> diagram[Diagram<br/>SVG renderer]
  content --> md[Md<br/>markdown renderer]
  content --> quiz[Quiz]
  content --> notes[NotesPad]
  core <-->|read/write| storage[(localStorage)]
  content -.optional.-> rag[RagPlayground]
  core -.optional.-> review[ReviewMode]
```

What the diagram says in words: the browser pulls `index.html`, which loads the Vite bundle, which mounts a tree rooted at `<App />`. `App` is just a `ToastProvider` around `AppCore`. `AppCore` owns all the navigation state and renders the active module's `ContentBlock`, which in turn composes a `Diagram`, `Md` text blocks, a `Quiz`, and a `NotesPad`. Progress and notes are synced to `localStorage` from `AppCore` and `NotesPad` respectively.

## Sequence: answering a quiz question

```mermaid
sequenceDiagram
  actor User
  participant Quiz as Quiz<br/>(memo)
  participant Core as AppCore
  participant Storage as localStorage

  User->>Quiz: clicks an option
  Quiz->>Quiz: setSel(displayIdx)
  Quiz->>Quiz: validate against<br/>shuffledCorrectIndex
  alt correct answer
    Quiz->>Core: onAnswer({ correct: true, idx })
    Core->>Core: prog.xp += 10<br/>prog.streak += 1<br/>prog.completed.push(id)
    Core->>Storage: setItem("agentic-ai-nav-v5", JSON)
    Core->>Core: setConfetti(true) for 2.7s
  else incorrect answer
    Quiz->>Quiz: setShake + setFailedAttempts++
    Quiz->>Core: onAnswer({ correct: false, idx })
    Core->>Core: prog.streak = 0
    Core->>Storage: setItem("agentic-ai-nav-v5", JSON)
  end
  Note over Quiz,Core: After 2 failed attempts,<br/>the hint is revealed.
```

## What lives where

| Concern | File | Lines |
| --- | --- | --- |
| HTML shell, mount point | `index.html` | 1-13 |
| React root | `src/main.jsx` | 1-10 |
| Haptic helper | `src/App.jsx` | 1-14 |
| Phase definitions (6 phases) | `src/App.jsx` | 19-26 |
| Curriculum data (22 modules) | `src/App.jsx` | 28-568 |
| Storage helpers + schema key | `src/App.jsx` | 573-586 |
| ToastProvider + useToast | `src/App.jsx` | 591-620 |
| CSS variables and reset | `src/App.jsx` | 625-637 |
| Diagram SVG renderer | `src/App.jsx` | 642-813 |
| NotesPad | `src/App.jsx` | 818-891 |
| RagPlayground (interactive scenario) | `src/App.jsx` | 896-975 |
| ContentBlock (module shell) | `src/App.jsx` | 980-1005 |
| Md (markdown to HTML) | `src/App.jsx` | 1010-1024 |
| Quiz | `src/App.jsx` | 1029-1134 |
| ReviewMode | `src/App.jsx` | 1139-1182 |
| SidebarItem | `src/App.jsx` | 1187-1208 |
| AppCore (main shell, state hub) | `src/App.jsx` | 1213-1545 |
| Global styles | `src/App.jsx` | 1550-1593 |
| Default export wrapper | `src/App.jsx` | 1596-1597 |
| Vercel SPA + asset cache config | `vercel.json` | 1-13 |
| Netlify SPA redirect + build config | `netlify.toml` | 1-9 |
| Vite config | `vite.config.js` | 1-7 |
| ESLint flat config | `eslint.config.js` | 1-29 |

## State

The app holds two slices of state that survive page reloads.

### Progress slice (`agentic-ai-nav-v5` in localStorage)

Schema (from `defaultState` at `src/App.jsx:573`):

```jsonc
{
  "step": 0,           // 0-indexed position in the steps array
  "completed": [],     // step ids that have passed their quiz
  "xp": 0,             // running XP total
  "answers": {},       // map of stepId -> chosen original index
  "streak": 0,         // current correct-in-a-row streak
  "maxStreak": 0,      // best streak ever
  "started": 1700000000000  // first-visit timestamp
}
```

The `v5` suffix on the key means the schema has been broken (and old keys discarded) four times. A user with `v4` data on their machine will see their progress reset on first load. This is intentional; a future migration helper could lift forward old keys if that ever matters.

### Notes slice (`agentic-notes-<stepId>` in localStorage)

One key per module. Plain string. Written by `NotesPad` (`src/App.jsx:818-891`) with a 300ms debounce. Empty notes delete the key (line 837) so the storage map stays tight.

## Trust boundaries

The app has exactly one trust boundary worth mapping: the line between curriculum data (developer-authored, ships with the bundle) and notes (user-authored, lives only in their browser).

```mermaid
flowchart LR
  subgraph trusted[Developer-authored, ships with bundle]
    A[phases]
    B[steps + markdownContent]
    C[diagram nodes / edges]
    D[quiz options + explanations]
  end
  subgraph user[User-authored, never leaves the browser]
    E[NotesPad contents]
    F[Selected quiz answers]
    G[Progress / XP / streak]
  end
  B -->|fed to dangerouslySetInnerHTML| RUN[Md renderer]
  E -.never fed to Md today.-> RUN
```

Today nothing user-authored is fed through the `Md` renderer (`src/App.jsx:1010-1024`), so the `dangerouslySetInnerHTML` call there is safe. If a future feature ever routes `NotesPad` content into `Md` (or any string the user could influence), the regex-based HTML construction becomes an XSS sink; add a sanitiser first.

## Invariants the design relies on

- **The seeded shuffle is deterministic.** `Quiz` reseeds an LCG with `stepId * 2654435761` (`src/App.jsx:1034`). Same `stepId`, same option order, every time. Refreshing the page does not reshuffle answers, so completed-quiz replay shows the same picks.
- **`isUnlocked(idx)` is the single gate for progression.** `idx === 0 || prog.completed.includes(steps[idx - 1]?.id)` (`src/App.jsx:1280`). The sidebar, the next button, and the keyboard shortcut all defer to this one expression.
- **Storage writes survive quota errors.** Both `saveToStorage` (`src/App.jsx:584-586`) and the notes writes (`src/App.jsx:840`) swallow exceptions. The app never crashes on a full disk, but the user also gets no signal.
- **`STORE_KEY` is bumped when the schema changes.** Old keys are not migrated. This is the only versioning mechanism.

## Build and deploy

```mermaid
flowchart LR
  src[src/*] --> vite[npm run build<br/>Vite + Rollup]
  index[index.html] --> vite
  vite --> dist[dist/<br/>~305KB JS<br/>96KB gzip]
  dist -->|push| vercel[Vercel<br/>via vercel.json]
  dist -->|push| netlify[Netlify<br/>via netlify.toml]
  dist -.alt.-> cf[Cloudflare Pages]
  dist -.alt.-> gh[GitHub Pages]
```

Both Vercel and Netlify configs include an SPA fallback (any path returns `index.html`), so client-side navigation links work. Asset caching is set to one year via `vercel.json:6-12`.
