Title: Fix: Fields header filter crash and filtering applied
Date: 2026-05-31

Context:
A runtime TypeError and non-functional column filters in the Fields Explorer were caused by missing runtime guards and the filter state not being applied to the displayed rows.

Learning:
- Cause: The header renderer sometimes did not receive optional callback props (`setCellSelected`, `reloadData`), causing TypeErrors when handlers called them unguarded.
- Cause: Updating `filters` did not automatically apply the filter values to `filteredRows`, so the grid never showed filtered results.
- Fixes implemented:
  - Made `setCellSelected` optional in `src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx` and guarded all calls.
  - Guarded `reloadData` calls when not provided by the parent.
  - Passed the `updateFilters` wrapper from `src/view/app/Fields/fields.tsx` (keeps `filtersRef` in sync) to the header renderer instead of raw `setFilters`.
  - Added a `useEffect` in `src/view/app/Fields/fields.tsx` that recalculates `filteredRows` whenever `rows` or `filters` change; the effect performs case-insensitive substring matching for active column filters.
- UX note: Controlled `TextField` + debounced reloads avoid focus/caret loss on re-renders.

Fields vs Query (separation):
- The Fields Explorer (`src/view/app/Fields/fields.tsx`) uses client-side filtering: header inputs update a local `filters` state and a `useEffect` computes `filteredRows` from the in-memory `rows`. Filtering is applied immediately in the UI without round-trips to the extension host or database.
- The Query view (`src/view/app/Query/query.tsx`) uses server-backed filtering: it keeps `filtersRef` and passes filters to `makeQuery(...)`, so the backend/processor applies the filter and returns matching rows. The UI forwards filter parameters to the extension host rather than filtering locally.
- Impact: Because the two features use separate state and different data flows (client vs server), changes in Fields filtering do not affect Query filtering. They are functionally independent.

Notes about Index Explorer filter:
- The Indexes Explorer (`src/view/app/Indexes/indexes.tsx`) currently lacks a filter UI. Adding a client-side filter there is low-effort and low-risk: replicate the `filters` + `filteredRows` pattern from Fields and use `ColumnHeaderCell` as the `headerRenderer` for index columns. This keeps filtering local to the Indexes view and avoids backend changes.
- If you prefer server-side filtering for Indexes (apply at DB/extension host), the work is larger: add messages to request filtered index lists from the extension host and implement server handlers that accept the same `filters` shape.

Evidence:
- Files changed during this interaction:
  - src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx
  - src/view/app/Fields/fields.tsx
- Related discovery file: discoveries/2026-05-30-filter-fix.md
- Console logs observed during debugging: repeated `fields columns update : {id: '1', action: 7, columns: Array(0)}` then corrected to Array(1) after fixes.

Actions:
- Add a unit test for `MockProcessor` to validate BEGINS (prefix) filtering behavior.
- Add a runtime log toggle in configuration to enable verbose webview logs for debugging.
- Consider memoizing `ColumnHeaderCell` if re-render churn remains a UX problem.

Files referenced:
- src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx
- src/view/app/Fields/fields.tsx

Actions taken (summary):
- Fixed runtime guards and selection initialization.
- Implemented filter application logic so header inputs now narrow displayed rows.
- Created `discoveries/notes/` and `discoveries/investigations/` directories for future entries.
