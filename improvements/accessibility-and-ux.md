# Accessibility and UX Review

The app already does several things right that most teaching tools skip: `role="radiogroup"` on the quiz, `role="progressbar"` on the XP bar, `aria-live="polite"` on toasts, focus-visible outlines, keyboard shortcuts for next/previous module. The findings below are gaps on top of that baseline, not from-scratch problems.

## A11Y-01: Focus is not moved when changing modules

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/App.jsx:1313-1323` (`goStep`, `goNext`, `goPrev`)

When the user clicks "Next" or a sidebar item, `prog.step` changes and the new module renders, but focus stays on whichever button was clicked. Sighted users have a visible viewport cue. Screen-reader users do not, and have to re-navigate from the top of the new module to find the heading.

Suggested fix (proposed, not applied):

1. Add `const mainRef = useRef(null);` near the top of `AppCore`.
2. Pass `ref={mainRef}` and `tabIndex={-1}` to the main content `<section>` (around `src/App.jsx:1490+`, the element that wraps `ContentBlock`).
3. In `goStep`, after the state update, call `mainRef.current?.focus()` inside a `useEffect` keyed on `prog.step`. Wrapping in `requestAnimationFrame` ensures the new module is in the DOM before focus moves.

This is a 12-line change and pays back immediately for keyboard and screen-reader users.

## A11Y-02: Quiz feedback relies on emoji and colour

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/App.jsx:1080-1120` (the quiz feedback block inside `Quiz`)

After the user submits an answer the feedback shows a green or red background and a celebration or thinking emoji. No text label says "Correct" or "Incorrect". For a user with red-green colour blindness, or a screen reader user, the only signal is the explanation paragraph, which buries the lede.

Suggested fix (proposed, not applied):

```jsx
{submitted && (
  <div role="status" aria-live="polite">
    <strong>{isCorrect ? "Correct." : "Incorrect."}</strong> {act.explanation}
  </div>
)}
```

The `role="status"` plus `aria-live="polite"` announces the verdict immediately when the feedback appears. Today there is `role="alert"` on the toasts but the quiz feedback block has no live region.

## A11Y-03: SVG diagrams expose detail only through tooltips

- **Severity:** Medium
- **Effort:** Medium
- **Location:** `src/App.jsx:642-813` (`Diagram` component)

Every diagram is rendered as an inline `<svg role="img" aria-label="...">`. The `aria-label` is short (the module's `conceptName`). The deep `description` text on each node (the prose at `src/App.jsx:36-40, 59-64, ...`) lives only in interactive tooltips that appear on hover or click, and the tooltip text is not exposed as a `<desc>` or in an accessible name.

For a screen-reader user, the diagram is one short label and nothing else. The text under "key takeaways" partly fills the gap but is not a node-by-node walkthrough.

Suggested fix (proposed, not applied):

1. Add a `<title>` and a `<desc>` element as the first children of the `<svg>`. The `<desc>` contains a prose walkthrough of the nodes in order, concatenated from the per-node `description`.
2. For each node `<g>`, set `aria-label` to the node's `label` + the first sentence of its `description`.
3. Below each diagram in `ContentBlock`, render a `<details><summary>Diagram description</summary>...</details>` so sighted keyboard users can also read the walk-through if they want.

This is the most labour-intensive item in this report because the prose has to be assembled per node, but it makes the diagrams genuinely accessible rather than nominally accessible.

## A11Y-04: Keyboard shortcut documentation is missing

- **Severity:** Low
- **Effort:** Small
- **Location:** `README.md:74` mentions `N` and `P` shortcuts

The README says `N` advances and `P` goes back. There is no on-screen hint, no `?` overlay, no `aria-keyshortcuts` attribute on the next/prev buttons. Power users will not discover the shortcuts; screen-reader users will not know they exist.

Suggested fix: add `aria-keyshortcuts="n"` to the Next button, `aria-keyshortcuts="p"` to the Previous button, and a help-text line under the header.

## A11Y-05: Reset modal traps focus but does not return focus on close

- **Severity:** Low
- **Effort:** Small
- **Location:** `src/App.jsx:1374-1386` (the reset confirmation modal)

When the modal opens, focus does not move into it. When the modal closes, focus does not return to the button that opened it. Both are standard expectations for modal dialogs.

Suggested fix: store `document.activeElement` when the modal opens, move focus to the first button inside, and restore the saved element on close. Or, more simply, swap the manual modal for the native `<dialog>` element, which handles both for free.

## A11Y-06: `clamp()` typography is good but very small at min

- **Severity:** Low
- **Effort:** Small
- **Location:** various `fontSize: "clamp(9px, 2vw, 10px)"` and similar in `src/App.jsx`

The README highlights `clamp()` typography. A few of the `clamp()` floors are below 12px (`src/App.jsx:1394` for example, `clamp(9px, 2vw, 10px)`). 9px is well below the recommended minimum for body text on mobile.

Suggested fix: bump the floors to 12px for any text the user will read, leaving 10px only for badge or chip text.

## A11Y-07: `lang="en"` is set, but no `lang` is set on `<html>` for translated content

- **Severity:** Informational

The curriculum is English-only today. Flagged so that the future internationalisation work (DEBT) does not forget to set `lang` per language.

## What is genuinely good (the praise)

- `aria-current="step"` on the active sidebar item.
- `aria-expanded` on the sidebar toggle.
- `aria-checked` and `role="radio"` on the quiz options.
- `aria-hidden="true"` on the confetti div, decorative gradients, and emoji.
- `prefers-reduced-motion` is not respected today; flagged below as A11Y-08 (the only gap that the audit did not catch in the praise list).

## A11Y-08: `prefers-reduced-motion` not respected

- **Severity:** Medium
- **Effort:** Small
- **Location:** `src/App.jsx:1550-1593` (`GLOBAL_STYLES`)

The CSS defines several animations (`fade-up`, `shake`, `confetti-drop`, `toast-in`, etc.). None of them is wrapped in `@media (prefers-reduced-motion: reduce) { ... }` overrides. For users with vestibular sensitivity, the confetti is the worst offender.

Suggested fix: append a media-query block to `GLOBAL_STYLES`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Small change, large impact for the affected users.
