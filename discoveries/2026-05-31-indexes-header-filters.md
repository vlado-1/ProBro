Title: Learning: Indexes & Fields header filters implemented
Date: 2026-05-31

Context:
The Indexes Explorer lacked header filters; Fields Explorer had filters with a different behavior. Implemented client-side header filters to match Fields UX and improved consistency.

Learning:
- Implemented client-side header filters for `Indexes` mirroring the `Fields` UX.
- Filters are computed client-side and stored in `filters` + `filteredRows` state, avoiding backend changes.
- Changed matching behavior to trimmed, case-insensitive "starts with" matching for predictable filtering across multiple characters.
- Memoized column definitions (`columnsWithHeader`) to avoid mutating imported `column.json` and to preserve header input focus/state.
- Added sensible CSS fallbacks for input background/foreground to ensure typed text is visible in webview themes.

Evidence:
- `src/view/app/Indexes/indexes.tsx` — added `filters`, `filteredRows`, `columnsWithHeader`, and initialization logic.
- `src/view/app/Fields/fields.tsx` — updated filter predicate to use `startsWith`.
- `src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx` — input styling fallbacks and wiring used by both views.
- Discovery note (plan): `discoveries/notes/2026-05-31-index-filter-plan.md`.

Actions:
- Verify interactively in the Indexes and Fields views to confirm filter behavior and visibility.
- Optional: add a user setting to choose `includes` vs `startsWith` behavior (e.g., `filterMode: "startsWith"|"includes"`).
- Optional: debounce filter-as-you-type behavior or add a `filterAsYouType` configuration (already referenced in `ColumnHeaderCell`).

