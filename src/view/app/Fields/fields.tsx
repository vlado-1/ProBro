import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { Box, TextField } from '@mui/material';

import { FieldRow, CommandAction, TableDetails, ICommand } from '../model';
import DataGrid, { SelectColumn } from 'react-data-grid';
import type { SortColumn } from 'react-data-grid';
import { Logger } from '../../../common/Logger';

import * as columnName from './column.json';
import { OEDataTypePrimitive } from '@utils/oe/oeDataTypeEnum';
import { getVSCodeAPI, getVSCodeConfiguration } from '@utils/vscode';
import { HighlightFieldsCommand } from '@src/common/commands/fieldsCommands';
import { ColumnHeaderCell, ColumnHeaderCellProps } from '@app/Components/Layout/Query/ColumnHeaderCell';

interface FieldsExplorerEvent {
    id: string;
    command: 'data';
    data: TableDetails;
}

type Comparator = (a: FieldRow, b: FieldRow) => number;
function getComparator(sortColumn: string): Comparator {
    switch (sortColumn) {
        case 'order':
        case 'extent':
        case 'decimals':
        case 'rpos':
            return (a, b) => {
                return a[sortColumn] - b[sortColumn];
            };
        case 'name':
        case 'type':
        case 'format':
        case 'label':
        case 'mandatory':
        case 'initial':
        case 'columnLabel':
        case 'valexp':
        case 'valMessage':
        case 'helpMsg':
        case 'description':
        case 'viewAs':
            return (a, b) => {
                const valueA = a[sortColumn] || '';
                const valueB = b[sortColumn] || '';
                return valueA.localeCompare(valueB);
            };
        default:
            throw new Error(`unsupported sortColumn: "${sortColumn}"`);
    }
}

function rowKeyGetter(row: FieldRow) {
    return row.order;
}

function Fields() {
    const [rows, setRows] = useState<FieldRow[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>();
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [filteredRows, setFilteredRows] = useState(rows);
    const [tableName, setTableName] = useState<string>('');

    const vscode = getVSCodeAPI();
    const configuration = getVSCodeConfiguration();
    const logger = new Logger(configuration.logging.react);

    const [filters, setFilters] = useState({
        columns: {},
        enabled: true,
    });
    const filtersRef = useRef(filters);
    const updateFilters = (filtersParam: { columns: object; enabled: boolean }) => {
        filtersRef.current = filtersParam;
        setFilters(filtersParam);
    };

    // Apply column filters to rows
    useEffect(() => {
        const colsFilters = filters.columns || {};
        const activeKeys = Object.keys(colsFilters).filter((k) => {
            const v = (colsFilters as any)[k];
            return v !== undefined && v !== null && String(v).trim() !== '';
        });

        if (activeKeys.length === 0) {
            setFilteredRows(rows);
            return;
        }

        const filtered = rows.filter((row: any) =>
            activeKeys.every((key) => {
                const filterValue = String((colsFilters as any)[key]).toLowerCase();
                const cell = row[key];
                if (cell === undefined || cell === null) {return false;}
                return String(cell).toLowerCase().includes(filterValue);
            })
        );

        setFilteredRows(filtered);
    }, [rows, filters]);

    const windowRezise = () => {
        setWindowHeight(window.innerHeight);
    };

    window.addEventListener(
        'contextmenu',
        (e) => {
            e.stopImmediatePropagation();
        },
        true
    );

    useEffect(() => {
        window.addEventListener('resize', windowRezise);
        return () => {
            window.removeEventListener('resize', windowRezise);
        };
    }, []);

    const sortedRows = useMemo((): readonly FieldRow[] => {
        if (sortColumns.length === 0) {
            return filteredRows;
        }

        return [...filteredRows].sort((a, b) => {
            for (const sort of sortColumns) {
                const comparator = getComparator(sort.columnKey);
                const compResult = comparator(a, b);
                if (compResult !== 0) {
                    return sort.direction === 'ASC' ? compResult : -compResult;
                }
            }
            return 0;
        });
    }, [filteredRows, sortColumns]);

    columnName.columns.forEach((column: any) => {
        column['headerRenderer'] = function (props: ColumnHeaderCellProps) {
            return (
                <ColumnHeaderCell
                    column={props.column}
                    sortDirection={props.sortDirection}
                    priority={props.priority}
                    onSort={props.onSort}
                    isCellSelected={props.isCellSelected}
                    setCellSelected={props.setCellSelected}
                    filters={filters}
                    setFilters={setFilters}
                    configuration={configuration} 
                />
            );
        };
    });

    useLayoutEffect(() => {
        window.addEventListener(
            'message',
            (event: MessageEvent<FieldsExplorerEvent>) => {
                const message = event.data;
                logger.log('fields explorer data', message);
                switch (message.command) {
                    case 'data':
                        message.data.fields.forEach((field) => {
                            if (
                                field.mandatory !== null &&
                                typeof field.mandatory === 'boolean'
                            ) {
                                field.mandatory = field.mandatory
                                    ? 'yes'
                                    : 'no';
                            }
                        });
                        setTableName(message.data.tableName);
                        setRows(message.data.fields);
                        setFilteredRows(message.data.fields);
                        setDataLoaded(true);
                        updateFilters({
                            columns: {},
                            enabled: true,
                        });

                        if (message.data.selectedColumns?.length === 0 && message.data.selectedColumns === undefined) {
                            setSelectedRows(
                                (): ReadonlySet<number> =>
                                    new Set(
                                        message.data.fields.map(
                                            (field: FieldRow) => {
                                                console.log('field!!!', field);
                                                if (
                                                    field.name ===
                                                        OEDataTypePrimitive.Rowid ||
                                                    field.name ===
                                                        OEDataTypePrimitive.Recid
                                                ) {
                                                    return -1;
                                                }
                                                return field.order;
                                            }
                                        )
                                    )
                            );
                        } else {
                            const selected = message.data.fields.filter(
                                (row: { name: string }) =>
                                    message.data.selectedColumns?.includes(
                                        row.name
                                    )
                            );
                            setSelectedRows(
                                (): ReadonlySet<number> =>
                                    new Set(
                                        selected.map(
                                            (row: { order: number }) =>
                                                row.order
                                        )
                                    )
                            );
                        }
                        break;
                }
            }
        );
    }, []);

    useEffect(() => {
        const obj: ICommand = {
            id: '1',
            action: CommandAction.UpdateColumns,
            columns: rows
                .filter((row) => selectedRows?.has(row.order))
                .map((row) => row.name),
        };
        logger.log('fields columns update', obj);
        vscode.postMessage(obj);
    });

    const refresh = () => {
        const obj: ICommand = {
            id: '2',
            action: CommandAction.RefreshTableData,
        };
        logger.log('Refresh Table Data', obj);
        vscode.postMessage(obj);
    };

    const onRowDoubleClick = (row: FieldRow) => {
        const obj: HighlightFieldsCommand = {
            id: 'highlightColumn',
            action: CommandAction.FieldsHighlightColumn,
            column: row.name,
            tableName: tableName,
        };
        logger.log('highlight column', obj);
        vscode.postMessage(obj);
    };

    return (
        <div>
            {!dataLoaded ? (
                <button className='refreshButton' onClick={refresh}>
                    Refresh
                </button>
            ) : rows.length > 0 ? (
                <div>
                    <Box sx={{ padding: '6px 8px' }}>
                        <TextField
                            size='small'
                            label='Filter columns by name'
                            variant='standard'
                            value={(filters.columns as any)?.name || ''}
                            onChange={(e) =>
                                updateFilters({
                                    ...filters,
                                    columns: {
                                        ...(filters.columns as any),
                                        name: e.target.value,
                                    },
                                })
                            }
                        />
                    </Box>
                    <DataGrid
                        columns={[SelectColumn, ...columnName.columns]}
                        rows={sortedRows}
                        defaultColumnOptions={{
                            sortable: true,
                            resizable: true,
                        }}
                        selectedRows={selectedRows}
                        headerRowHeight={filters.enabled ? 70 : undefined}
                        onSelectedRowsChange={setSelectedRows}
                        rowKeyGetter={rowKeyGetter}
                        onRowsChange={setRows}
                        sortColumns={sortColumns}
                        onSortColumnsChange={setSortColumns}
                        style={{ height: windowHeight }}
                        onRowDoubleClick={onRowDoubleClick}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default Fields;
