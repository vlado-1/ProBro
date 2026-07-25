import * as vscode from 'vscode';
import { QueryEditor } from './QueryEditor';
import { CommandAction, ICommand } from '../view/app/model';
import { PanelViewProvider } from './PanelViewProvider';
import { Logger } from '../common/Logger';
import { updateSelectedColumnsCache } from '../repo/utils/cache';
import { HighlightFieldsCommand } from '../common/commands/fieldsCommands';

export class FieldsViewProvider extends PanelViewProvider {
    private queryEditors: QueryEditor[] = [];

    private logger = new Logger(
        this.configuration.get('logging.node') ?? false
    );

    public addQueryEditor(queryEditor: QueryEditor) {
        this.queryEditors.push(queryEditor);
    }

    public removeQueryEditor(queryEditor: QueryEditor) {
        this.queryEditors = this.queryEditors.filter(
            (query) => query !== queryEditor
        );
    }

    public notifyQueryEditors() {
        const selectedTableKey = this.tableNode?.getFullName(true);

        for (const queryEditor of this.queryEditors) {
            if (
                selectedTableKey
                    ? queryEditor.getTableFullName(true) === selectedTableKey
                    : queryEditor.tableName === this.tableNode?.tableName
            ) {
                queryEditor.updateFields();
            }
        }
    }

    /**
     * Highlights the QueryEditors column
     * @param {HighlightFieldsCommand} command command object
     */
    public async highlightQueryEditorsColumn(command: HighlightFieldsCommand) {
        const selectedTableKey = this.tableNode?.getFullName(true);

        let firstEditor = selectedTableKey
            ? this.queryEditors.find(
                (val) => val.getTableFullName(true) === selectedTableKey
            )
            : this.queryEditors.find(
                (val) => val.tableName === command.tableName
            );

        if (!firstEditor && command.openQueryIfNotOpen) {
            await vscode.commands.executeCommand(
                'pro-bro.fieldsOpenQuery',
                command.column
            );
            firstEditor = selectedTableKey
                ? this.queryEditors.find(
                    (val) => val.getTableFullName(true) === selectedTableKey
                )
                : this.queryEditors.find(
                    (val) => val.tableName === command.tableName
                );
        }

        firstEditor?.panel?.reveal();
        firstEditor?.focusColumn(command.column);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView
    ): void | Thenable<void> {
        super.resolveWebviewView(webviewView);

        this._view?.webview.onDidReceiveMessage((command: ICommand) => {
            this.logger.log('Command:', command);
            switch (command.action) {
                case CommandAction.UpdateColumns:
                    if (command.columns?.length === 0) {
                        break;
                    }

                    if (this.tableNode?.cache) {
                        this.tableNode.cache.selectedColumns = command.columns;
                    }

                    updateSelectedColumnsCache(
                        this.tableNode,
                        command.columns ?? []
                    );

                    this.logger.log(
                        'this.tableNode.cache.selectedColumns:',
                        command.columns
                    );
                    this.notifyQueryEditors();
                    break;
                case CommandAction.FieldsHighlightColumn:
                    void this.highlightQueryEditorsColumn(
                        command as HighlightFieldsCommand
                    );
                    break;
            }
        });
    }
}
