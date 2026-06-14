# Learning Map For Understanding `src`

Date: 2026-05-31

Context: I reviewed the main extension entrypoint, webview providers, tree providers, processor/client abstractions, and representative React UI files to identify the minimum set of concepts needed to understand how ProBro works end to end.

Learning:
- Learn the VS Code extension model first: activation, contributed commands/views, `TreeDataProvider`, `WebviewViewProvider`, `WebviewPanel`, and `ExtensionContext` persistence. This is the backbone of how ProBro boots, renders explorer panes, and stores state.
- Learn the extension-to-webview communication model next: typed message contracts, `postMessage`, `onDidReceiveMessage`, content security policy, and how bundled React apps are hosted inside VS Code webviews.
- Learn the React UI patterns used here: hooks (`useState`, `useEffect`, `useMemo`, `useRef`), controlled inputs, keyboard/focus handling, and third-party UI libraries such as MUI and `react-data-grid`.
- Learn the data-access abstraction layer: factory + singleton patterns, processor/client separation, local vs remote connection handling, and how OpenEdge requests are encoded and executed.
- Learn the OpenEdge domain concepts that the extension exposes: databases, tables, fields, indexes, selected columns, filters, query parameters, and how cached table metadata is shared between tree views and webviews.

Evidence:
- `src/extension.ts` wires activation, registers tree and webview providers, reads `openedge-project.json`, and manages global/workspace state.
- `package.json` defines contributed commands, activity bar views, webview panels, and extension configuration such as ports, logging, mock processor usage, and grid behavior.
- `src/webview/PanelViewProvider.ts` shows how a React bundle is embedded into a webview and how refresh commands move from the UI back into extension code.
- `src/webview/QueryEditor.ts` shows the richer query webview flow: receiving UI commands, calling processors, normalizing results, and sending data back to the browser side.
- `src/view/app/model.ts` is the shared contract layer. Understanding these types and enums makes the rest of the code much easier to follow.
- `src/view/app/utils/vscode.ts` shows the browser-side wrapper over `acquireVsCodeApi`, which is the core bridge between the React app and VS Code.
- `src/treeview/TablesListProvider.ts` shows how tree selection drives field/index webview updates and how table details are cached.
- `src/treeview/CustomViewProvider.ts` shows persisted custom views in `globalState` and how saved UI state is mapped back into tree nodes.
- `src/repo/processor/ProcessorFactory.ts`, `src/repo/processor/database/DbProcessor.ts`, and `src/repo/client/ClientFactory.ts` show the main architectural seam between UI logic and database/OpenEdge communication.
- `src/view/app/Components/Layout/Query/ColumnHeaderCell.tsx` and `src/view/app/Indexes/indexes.tsx` show the main frontend complexity in this repo: grid filtering, sorting, keyboard navigation, focus management, and controlled state.

Actions:
- Study in this order: 1) `package.json`, 2) `src/extension.ts`, 3) `src/view/app/model.ts`, 4) `src/webview/PanelViewProvider.ts` and `src/webview/QueryEditor.ts`, 5) `src/treeview/*Provider.ts`, 6) `src/repo/client/*` and `src/repo/processor/*`, 7) `src/view/app/**/*`.
- Read the VS Code API docs for `TreeDataProvider`, `WebviewViewProvider`, `WebviewPanel`, `commands.registerCommand`, and `ExtensionContext` before going deeper into implementation details.
- Review React topics that matter for this codebase specifically: controlled form inputs, effect cleanup, refs, memoization, and DOM focus/keyboard event handling.
- Review the OpenEdge/ABL concepts used by the repo so the domain names in processors, clients, and views are meaningful instead of just syntax to follow.
- After the conceptual pass, trace one full user flow: select a table in the tree, watch `TablesListProvider.displayData`, follow the message into the fields/indexes webview, then trace one query from `QueryEditor` down into `DbProcessor`.