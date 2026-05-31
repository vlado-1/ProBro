# 2026-05-31 — Header tab / focus UX fix

Summary
- Problem: Tabbing between column header filters in the Fields and Indexes explorers moved focus to the next header header cell but the caret was not placed inside the input, so users could not start typing immediately.
- Cause: react-data-grid internal focus handling interfered with the browser's native focus/caret placement; focusing an input could be briefly overridden by the grid, so the caret wasn't visible.
- Fix: Made header inputs directly tabbable and implemented a robust focus+select strategy:
  - Header container made non-tabbable and clicking the header focuses the input.
  - Header input (`TextField`) marked with `data-header-column="<key>"` so handlers can discover header inputs.
  - Added an input-level `onKeyDown` handler for Tab to move focus to the next header input and a document-level keydown fallback to catch Tab when necessary.
  - After focusing an input, run a small delayed `.select()` (10ms) to ensure the caret is visible even if the grid briefly steals focus.

Files changed
- `src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx` — main header logic, focus/selection helper, removed debug logs.
- `src/view/app/Fields/fields.tsx` — wrapped `DataGrid` with a div that handles Tab navigation when grid steals focus; removed debug logs.
- `src/view/app/Indexes/indexes.tsx` — same as `Fields`.

Verification steps
1. Build/watch and reload the extension (`npm run watch`, Developer: Reload Window).
2. Open Fields or Indexes explorer webview.
3. Focus a header input, press `Tab` — caret should appear in the next header input and its text should be selected.
4. Check webview DevTools `document.activeElement.getAttribute('data-header-column')` to confirm focus.

Notes and next steps
- I removed temporary console logging used during debugging — no debug logs remain.
- The `data-header-column` attribute is intentional and used by the Tab handlers; keep it.
- If react-data-grid is updated later or if focus regressions appear on different browsers/VS Code versions, consider switching to react-data-grid's explicit focus APIs (if available) or submitting a small upstream change.

Authored by GitHub Copilot (assistant).