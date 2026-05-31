Title: Plan: Add client-side filter to Indexes Explorer
Date: 2026-05-31

Context:
The Indexes Explorer currently displays indexes via DataGrid but does not provide column header filters like Fields Explorer.

Proposal:
- Implement a client-side filter (same UX as Fields Explorer) so users can type into header inputs and narrow index rows locally.

Benefits:
- Quick to implement (~30-60 lines change in `indexes.tsx` and small header renderer wiring).
- No backend changes required; low risk.
- Consistent UX with Fields Explorer.

Implementation steps:
1. Add `filters` state and `filtersRef` in `src/view/app/Indexes/indexes.tsx`.
2. Add `filteredRows` state and a `useEffect` that recomputes `filteredRows` from `rows` and `filters` (case-insensitive substring match), mirroring the Fields logic.
3. Modify the column definitions (in `column.json` or inline) to add a `headerRenderer` that returns `ColumnHeaderCell` and pass `filters`, `setFilters` (or `updateFilters`), `isCellSelected`, and `setCellSelected`.
4. Use `filteredRows` as the data source for `DataGrid`.
5. Manual verification: open Indexes view, type into header filters, confirm rows narrow correctly.

Optional enhancements:
- Debounced reload behavior or `filterAsYouType` configuration.
- Memoize `ColumnHeaderCell` to reduce re-rendering churn if performance issues appear.
- If dataset grows large, consider server-side filtering later.

Estimated effort: 1–2 hours including verification and a short discovery note.
