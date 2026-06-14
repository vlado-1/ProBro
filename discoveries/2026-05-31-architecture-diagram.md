# ProBro One-Page Architecture Diagram

Date: 2026-05-31

Context: This diagram summarizes the main runtime parts of the `src` folder and the message/data flow between the VS Code extension host, tree views, React webviews, and OpenEdge access layer.

## Diagram

```mermaid
flowchart LR
    subgraph VSCode[VS Code Host]
        PKG[package.json\ncommands, views, settings]
        EXT[src/extension.ts\nactivation + provider wiring]
        STATE[ExtensionContext\nglobalState/workspaceState]
    end

    subgraph Explorer[Explorer + Panels]
        DBTREE[Database / Table Tree Providers\nsrc/treeview/*Provider.ts]
        TABLENODE[TableNode / CustomViewNode]
        FIELDSP[FieldsViewProvider]
        INDEXSP[IndexesViewProvider]
        QUERYP[QueryEditor\nwebview panel]
    end

    subgraph Webviews[React Webviews]
        BRIDGE[src/view/app/utils/vscode.ts\nacquireVsCodeApi wrapper]
        FIELDSUI[Fields UI\nsrc/view/app/Fields/*]
        INDEXUI[Indexes UI\nsrc/view/app/Indexes/*]
        QUERYUI[Query UI\nsrc/view/app/Query/*]
        HEADERUI[ColumnHeaderCell\nfilter + sort + focus logic]
        MODEL[src/view/app/model.ts\nshared types/enums]
    end

    subgraph DataLayer[Repository / Processing Layer]
        PROCFACT[ProcessorFactory]
        DBPROC[DbProcessor / MockProcessor / legacy DatabaseProcessor]
        CLIENTFACT[ClientFactory]
        LOCAL[LocalClient + Helper]
        REMOTE[RemoteClient + Storage + Helper]
    end

    subgraph OpenEdge[OpenEdge / Database Side]
        OE[OpenEdge command execution\nget_tables / get_table_details / get_table_data / submit_table_data]
        DB[(OpenEdge Databases)]
        OEPROJ[openedge-project.json\nconnection import]
    end

    PKG --> EXT
    EXT --> STATE
    EXT --> DBTREE
    EXT --> FIELDSP
    EXT --> INDEXSP
    EXT --> QUERYP
    EXT --> OEPROJ

    DBTREE --> TABLENODE
    DBTREE -->|selection| FIELDSP
    DBTREE -->|selection| INDEXSP
    DBTREE -->|double click / command| QUERYP
    TABLENODE --> STATE

    FIELDSP -->|postMessage data| FIELDSUI
    INDEXSP -->|postMessage data| INDEXUI
    QUERYP -->|postMessage data/customView| QUERYUI

    FIELDSUI --> BRIDGE
    INDEXUI --> BRIDGE
    QUERYUI --> BRIDGE
    HEADERUI --> FIELDSUI
    HEADERUI --> INDEXUI
    MODEL --> FIELDSP
    MODEL --> INDEXSP
    MODEL --> QUERYP
    MODEL --> FIELDSUI
    MODEL --> INDEXUI
    MODEL --> QUERYUI

    BRIDGE -->|commands| FIELDSP
    BRIDGE -->|commands| INDEXSP
    BRIDGE -->|commands| QUERYP

    DBTREE -->|displayData/get list| PROCFACT
    QUERYP -->|query/export/submit| PROCFACT
    PROCFACT --> DBPROC
    DBPROC --> CLIENTFACT
    CLIENTFACT --> LOCAL
    CLIENTFACT --> REMOTE
    LOCAL --> OE
    REMOTE --> OE
    OE --> DB
    OEPROJ --> EXT
    OEPROJ --> STATE

    STATE --> DBTREE
    STATE --> QUERYP
```

## Reading Guide

1. Start at `package.json` and `src/extension.ts` to understand what VS Code contributes and activates.
2. Follow `src/treeview/TablesListProvider.ts` to see how table selection loads and pushes data into Fields and Indexes webviews.
3. Read `src/webview/PanelViewProvider.ts` and `src/webview/QueryEditor.ts` to understand extension-host to webview messaging.
4. Read `src/view/app/model.ts` before deeper UI work because it defines the command and data contracts used on both sides.
5. Follow `src/repo/processor/ProcessorFactory.ts` into `src/repo/processor/database/DbProcessor.ts` and `src/repo/client/*` to see where database requests are actually executed.

## Core Ideas

- The extension host owns VS Code integration, state, commands, and provider registration.
- Tree providers decide what database/table node is active and trigger data loading.
- Webviews are separate browser contexts running React, and they only talk to the extension through message passing.
- Shared models in `src/view/app/model.ts` are the contract boundary between the extension code and the React code.
- The processor/client layer isolates database communication details from UI and VS Code concerns.