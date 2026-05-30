Title: Fix: Query header filters lost focus and mock mismatch
Date: 2026-05-30

Context:
A runtime crash and subsequent UX bug were caused by inconsistent processor response shapes and filter handling. The extension's mock processor returned a different payload shape and the header filter input lost focus after the first character.

Learning:
- The webview expects processor responses shaped like OE: `{ columns, rawData, formattedData, debug }` — mismatches cause runtime errors in the React app.
- React state updates are asynchronous; mutating the `filters` object in-place prevents React from seeing changes and can lead to stale state sent to the backend.
- Controlled inputs are required for stable caret/focus behavior when parent re-renders occur; using `defaultValue` with external re-renders caused caret loss after the first keystroke.
- Using a `ref` for the canonical filters object (`filtersRef.current`) lets code synchronously reference the latest filter values when issuing immediate queries.

Evidence:
- Files changed during the fix:
  - `src/repo/processor/mock/MockProcessor.ts` — changed to return OE-shaped payloads (`rawData`, `formattedData`) and to use case-insensitive prefix (BEGINS) matching for filters.
  - `src/webview/QueryEditor.ts` — normalized processor responses before posting to the webview; ensured `data` has `rawData` and `formattedData`.
  - `src/view/app/Query/query.tsx` — added `filtersRef` usage and removed mutations; ensured `makeQuery` uses `filtersRef.current` to avoid stale state.
  - `src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx` — made the filter `TextField` controlled, debounced reloads via `useRef`, and moved `setCellSelected()` to focus handler.
- Relevant runtime logs (examples): search and replace in logs showed `MockProcessor.getTableData - returning rows= ...` and `setFilters` traces during debugging.

Actions / Follow-ups:
- (Recommended) Add a small unit test for `MockProcessor` to verify BEGINS (prefix) filtering behavior.
- Add a runtime diagnostic toggle (setting) to enable verbose logs without editing code — useful for future debugging.
- Consider making `ColumnHeaderCell` memoized if performance or re-rendering still causes minor UX issues.

Questions for the user:
- Do you want me to add the unit test for `MockProcessor` now, or add a runtime log toggle first?

Files referenced:
- [src/repo/processor/mock/MockProcessor.ts](src/repo/processor/mock/MockProcessor.ts)
- [src/webview/QueryEditor.ts](src/webview/QueryEditor.ts)
- [src/view/app/Query/query.tsx](src/view/app/Query/query.tsx)
- [src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx](src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx)

Actions taken (summary):
- Normalized outgoing webview messages to use OE-shaped `data`.
- Updated mock to emulate OE `BEGINS` (case-insensitive) behavior.
- Fixed filter input focus by making it a controlled component and debouncing reloads.
- Removed temporary debug logs after verification.
