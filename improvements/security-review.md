# Security Review

The app is a static, fully client-side React SPA. No server, no backend, no user authentication, no API keys in the bundle. The threat surface is small. The findings below cover what does exist.

## SEC-01: `dangerouslySetInnerHTML` fed by a regex-built HTML string

- **Severity:** High
- **Effort:** Medium
- **Location:** `src/App.jsx:1010-1024`

The `Md` component constructs HTML by chaining eight regex replacements over the input string, then renders the result with `dangerouslySetInnerHTML`:

```jsx
const Md = memo(function Md({ text }) {
  const html = useMemo(() => {
    let s = text.trim();
    s = s.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    // ... seven more .replace() calls ...
    return `<p class="md-p">${s}</p>`;
  }, [text]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});
```

**Today's risk: low.** The only callers pass `step.markdownContent` from the hardcoded `steps` array in the same file (`src/App.jsx:28-568`), and the curriculum is not user-editable. There is no path for an attacker to inject a string into `Md`.

**Tomorrow's risk: high.** Three plausible future changes that would make this exploitable:

1. A "user-contributed module" feature that lets visitors author markdownContent.
2. A "load curriculum from a URL" feature, even from a friendly endpoint.
3. A future contributor reusing `Md` to render an LLM response, a quiz explanation entered at runtime, or any note from `NotesPad` (`src/App.jsx:818-891`). `NotesPad` already stores user-supplied strings; if someone wires that through `Md` later, the regex-built HTML is the attack vector.

Because the existing pipeline does not HTML-escape `<`, `>`, `&` before applying the markdown rules, any of those changes immediately yields an XSS sink.

Suggested fix (proposed, not applied):

- Short-term: keep `Md`, but add a first replacement that escapes `&`, `<`, `>` in the raw `text` before the markdown rules run. Document the contract: "only safe for trusted, developer-authored strings".
- Medium-term: swap to `marked` + `DOMPurify` so that any future caller is safe by default. Bundle cost is about 33KB gzip on top of the current 96KB.

## SEC-02: `index.html` ships defaults

- **Severity:** Low
- **Effort:** Small
- **Location:** `index.html`

`<title>agent-app</title>` and `<link rel="icon" href="/vite.svg" />` indicate the file was never updated from the Vite scaffold. No `Content-Security-Policy` `<meta>` tag, no `referrer` meta, no `viewport` integrity hardening. None of this is a vulnerability in itself, but it is the first place a deployment-hardening reviewer looks.

Suggested fix: see `docs/README.proposed.md` "Deployment" section for a worked example.

## SEC-03: No security headers on the deployment configs

- **Severity:** Medium
- **Effort:** Small
- **Location:** `vercel.json:1-13`, `netlify.toml:1-9`

`vercel.json` sets a `Cache-Control` on `/assets/*` (good) but no other headers. `netlify.toml` configures a SPA redirect and the build command, no headers at all. The browser falls back to defaults, which means:

- No `Content-Security-Policy`, so a future XSS via SEC-01 would have full reach (inline scripts, exfil to anywhere).
- No `Referrer-Policy`, so navigating away from a deep-linked module leaks the path to third-party sites.
- No `X-Content-Type-Options: nosniff`, so a misconfigured upload (if a `public/` upload feature is ever added) could be sniffed as HTML.
- No `Permissions-Policy`, so the page silently has access to every powerful API the browser supports.

Suggested headers (proposed, not applied). For `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

Note: the `'unsafe-inline'` on `style-src` is required by the current code because `src/App.jsx` injects `<style>{CSS_VARS}{GLOBAL_STYLES}</style>` at runtime (line 1366). Removing that requires moving the styles into a separate CSS file (see PERF-02 in `performance-review.md`).

For Netlify, add an `[[headers]]` block to `netlify.toml`.

## SEC-04: localStorage usage is unauthenticated and unscoped

- **Severity:** Informational
- **Effort:** N/A (by design)
- **Location:** `src/App.jsx:573-586,824-851,1241-1242`

The app stores progress under `agentic-ai-nav-v5` and per-step notes under `agentic-notes-{stepId}`. Any other script running on the same origin can read or modify both. Today only the app's own JS runs on the origin, so this is fine. Worth flagging only because a future "embed the navigator on the company intranet" deployment would share an origin with whatever else is on that intranet.

No fix recommended unless that deployment shape happens.

## SEC-05: No subresource integrity on the Google Fonts links

- **Severity:** Low
- **Effort:** Small
- **Location:** None visible in `index.html`, but `src/App.jsx:629-636` references `Instrument Sans` and `JetBrains Mono` as CSS font-family values

If the fonts are loaded from Google Fonts (which the README's Acknowledgements section suggests), it happens implicitly via CSS rather than via a `<link rel="stylesheet">` in `index.html`. That means the fonts are not actually being loaded by the current code; the CSS fallback `system-ui` is what users see. Either acknowledge this in the README or add `<link rel="preconnect">` and `<link rel="stylesheet">` to `index.html` with `crossorigin="anonymous"` and `integrity="..."` SRI hashes.

Today's user impact: the README claims a specific font is used, the rendered page uses `system-ui`. Not a security risk; a documentation-accuracy issue (also covered in CODE-04).

## SEC-06: Secret-scanning sweep of the existing repo

Per Hard Rule 5 the existing repo was scanned for committed secrets. Patterns checked (with file paths only, not values):

- `sk-[A-Za-z0-9]{20,}` (OpenAI-style): no matches.
- `AKIA[0-9A-Z]{16}` (AWS access key id): no matches.
- `ghp_[A-Za-z0-9]{20,}` (GitHub personal access token): no matches.
- `xoxb-`, `xoxp-` (Slack tokens): no matches.
- `-----BEGIN .* PRIVATE KEY-----`: no matches.

The repo appears clean of committed secrets. The audit did not look inside `node_modules/` (recreated from `package.json`) or `.git/objects/` (history-only).

## SEC-07: No `.gitignore` line for `.env*`

- **Severity:** Low (defence in depth)
- **Effort:** Small
- **Location:** `.gitignore`

The existing `.gitignore` (file is 25 lines) covers `node_modules`, `dist`, `.vscode`, `.idea`, `.DS_Store`, and `*.local`. It does not exclude `.env`, `.env.local`, `*.pem`, or `*.key`. The app does not currently read any env vars (it is fully client-side), so there is no `.env` to leak. But the moment a contributor adds Vite env vars (`VITE_*`), the `.gitignore` will need to catch the resulting file.

Suggested fix: append a `.env*` block to `.gitignore`. Owner-only action.

A reference `.env.example` is not added in this PR because the app reads no environment variables today.

## SEC-08: No automated dependency scanning

- **Severity:** Low
- **Effort:** Small
- **Location:** No `.github/workflows/` exists

The repo has no `npm audit` or Dependabot or Renovate configuration. The two runtime dependencies are React 19 and ReactDOM 19; both are pinned to a caret range, so `npm install` will pick up patch updates. There is no automated signal if a new critical CVE drops in a transitive dependency.

The CI workflow added by this PR at `.github/workflows/ci.yml` includes a `npm audit --audit-level=high` step. Owner can later swap to GitHub Dependabot via Settings, or add a Renovate config.
