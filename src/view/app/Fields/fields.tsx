import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';

import { FieldRow, CommandAction, TableDetails, ICommand } from '../model';
import DataGrid from 'react-data-grid';
import type { SortColumn } from 'react-data-grid';
import { Logger } from '../../../common/Logger';

import * as columnName from './column.json';
import { OEDataTypePrimitive } from '@utils/oe/oeDataTypeEnum';
import { getVSCodeAPI, getVSCodeConfiguration } from '@utils/vscode';
import { HighlightFieldsCommand } from '@src/common/commands/fieldsCommands';
import ColumnHeaderCell from '@app/Components/Layout/Query/ColumnHeaderCell';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
    const [rows, setRows] = useState([]);
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
    const updateFilters = (filters: { columns: object; enabled: boolean }) => {
        filtersRef.current = filters;
        setFilters(filters);
    };

    // Apply filters to rows when filters or rows change
    useEffect(() => {
        if (!filters || !filters.enabled) {
            setFilteredRows(rows);
            return;
        }
        const cols = filters.columns || {};
        const filtered = rows.filter((row) => {
            return Object.keys(cols).every((key) => {
                const filterValue = (cols as any)[key];
                if (filterValue === undefined || filterValue === null || filterValue === '') {
                    return true;
                }
                const cellValue = (row as any)[key];
                if (cellValue === undefined || cellValue === null) {return false;}
                const cellStr = String(cellValue).toLowerCase();
                const filterStr = String(filterValue).toLowerCase().trim();
                return cellStr.startsWith(filterStr);
            });
        });
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

    columnName.columns.forEach((column) => {
        column['headerRenderer'] = function (props) {
            return (
                <ColumnHeaderCell
                    column={props.column}
                    sortDirection={props.sortDirection}
                    priority={props.priority}
                    onSort={props.onSort}
                    isCellSelected={props.isCellSelected}
                    setCellSelected={props.setCellSelected}
                    filters={filters}
                    setFilters={updateFilters}
                    configuration={configuration} 
                />
            );
        };
    });

    const gridDivRef = useRef<HTMLDivElement | null>(null);

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

                        if (message.data.selectedColumns === undefined || message.data.selectedColumns.length === 0) {
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
                                    message.data.selectedColumns.includes(
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
                .filter((row) => selectedRows.has(row.order))
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
        // show loading/placeholder immediately
        setDataLoaded(true);
        vscode.postMessage(obj);
    };

    const clearFilters = () => {
        updateFilters({
            columns: {},
            enabled: true,
        });
        refresh();
    };

    const ClearColumn: any = {
        key: 'clear',
        name: '',
        width: 28,
        minWidth: 28,
        maxWidth: 28,
        headerRenderer: () => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: filters.enabled ? '70px' : '100%', padding: 0, margin: 0, boxSizing: 'border-box', width: '100%' }}>
                <IconButton
                    aria-label='Clear filters'
                    title='Clear filters'
                    onClick={clearFilters}
                    size='small'
                    sx={{ width: 18, height: 18, padding: 0, color: 'var(--vscode-input-foreground, #cccccc)', minWidth: 18 }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </div>
        ),
        formatter: () => null,
        sortable: false,
        resizable: false,
    };

    const SelectColumnCustom: any = {
        key: 'select',
        name: '',
        width: 28,
        minWidth: 28,
        maxWidth: 28,
        headerRenderer: () => {
            const allSelected = rows && rows.length > 0 && selectedRows && rows.every((r: FieldRow) => selectedRows.has(r.order));
            const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                    setSelectedRows(new Set(rows.map((r: FieldRow) => r.order)));
                } else {
                    setSelectedRows(new Set());
                }
            };
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: filters.enabled ? '70px' : '100%', padding: 0, margin: 0, width: '100%' }}>
                    <input style={{ margin: 0, transform: 'scale(0.9)' }} type='checkbox' aria-label='Select all' checked={!!allSelected} onChange={toggleAll} />
                </div>
            );
        },
        formatter: (p: any) => {
            const row: FieldRow = p.row;
            const checked = selectedRows && selectedRows.has(row.order);
            const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const next = new Set(selectedRows || []);
                if (e.target.checked) {
                    next.add(row.order);
                } else {
                    next.delete(row.order);
                }
                setSelectedRows(next);
            };
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0, margin: 0 }}>
                    <input style={{ margin: 0, transform: 'scale(0.9)' }} type='checkbox' checked={!!checked} onChange={onChange} />
                </div>
            );
        },
        sortable: false,
        resizable: false,
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
                <div
                    ref={gridDivRef as any}
                    onKeyDown={(e) => {
                        try {
                            if ((e as React.KeyboardEvent).key === 'Tab') {
                                const root = gridDivRef.current as HTMLDivElement | null;
                                if (!root) { return; }
                                const focusables = Array.from(root.querySelectorAll('input, textarea, [tabindex]'))
                                    .filter((el: any) => {
                                        const ti = el.tabIndex;
                                        return ti >= 0 && (el.offsetParent !== null);
                                    }) as HTMLElement[];
                                if (focusables.length === 0) { return; }
                                const active = document.activeElement as HTMLElement | null;
                                const idx = focusables.indexOf(active as HTMLElement);
                                // if not inside focusables but inside grid, focus first
                                if (idx === -1 && root.contains(active)) {
                                    focusables[0].focus();
                                    (e as React.KeyboardEvent).preventDefault();
                                    return;
                                }
                                // move to next
                                const forward = !(e as React.KeyboardEvent).shiftKey;
                                if (idx === -1) { return; }
                                const next = forward ? idx + 1 : idx - 1;
                                if (next >= 0 && next < focusables.length) {
                                    focusables[next].focus();
                                    (e as React.KeyboardEvent).preventDefault();
                                }
                            }
                        } catch (err) {
                            console.error('Fields: grid Tab handler error', err);
                        }
                    }}
                >
                    <DataGrid
                        columns={[ClearColumn, SelectColumnCustom, ...columnName.columns]}
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
