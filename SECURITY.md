# Security Policy

## Reporting a vulnerability

If you find a security issue in Agentic AI Navigator, please **do not open a public GitHub issue**. Instead:

1. Open a private security advisory: https://github.com/ANI-IN/agentic-navigator/security/advisories/new
2. Or contact the maintainer directly through their GitHub profile.

Include:

- A description of the issue.
- Steps to reproduce, with a minimal proof-of-concept if you have one.
- The affected commit or release.
- Your assessment of impact (information disclosure, XSS, etc.).

You can expect an acknowledgement within 7 days. Fix timelines depend on severity; high or critical issues are usually patched within 14 days.

## Supported versions

This project is a static SPA without versioned releases today. The only "supported version" is the current `main` branch. There is no LTS line.

## Known risk areas

- **`src/App.jsx:1010-1024`** uses `dangerouslySetInnerHTML` fed by a regex-built HTML string. Today the only inputs come from the developer-authored `steps` array (same file, lines 28-568), so this is safe. **Any future feature that routes user-supplied or remote-fetched text through `Md` would create an XSS sink.** Add a sanitiser (e.g. `DOMPurify`) before that change.
- **Content-Security-Policy** headers are configured on the Vercel and Netlify deploys (`vercel.json`, `netlify.toml`). They currently allow `unsafe-inline` on `style-src` because `src/App.jsx` injects a runtime `<style>` block; move those styles to a static stylesheet to tighten further.
- **`localStorage`** stores progress and notes unencrypted. Any other script on the same origin can read both. This is fine for the current standalone deploy; flagged for any future intranet embed.

## What is explicitly out of scope

- The contents of `node_modules/`. Dependency advisories are tracked via `npm audit` in CI.
- Vendor browser bugs.
- Social engineering against the maintainer.

## Hardening checklist for self-hosters

If you deploy this app on your own infrastructure:

1. Serve over HTTPS only.
2. Reuse the headers in `vercel.json` / `netlify.toml` (CSP, HSTS, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy).
3. Keep dependencies fresh: `npm outdated` should be empty before each deploy.
4. Do not extend the app to fetch curriculum content from a URL without sanitising the response.

## Acknowledgements

Researchers who report a valid vulnerability and follow the disclosure process above will be credited in the `CHANGELOG.md` entry that includes the fix, unless they ask to remain anonymous.
