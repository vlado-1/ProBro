import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { CommandAction, IndexRow } from '../model';
import DataGrid from 'react-data-grid';
import type { SortColumn } from 'react-data-grid';
import * as columnName from './column.json';
import ColumnHeaderCell from '@app/Components/Layout/Query/ColumnHeaderCell';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Logger } from '../../../common/Logger';
import { getVSCodeAPI, getVSCodeConfiguration } from '@utils/vscode';

type Comparator = (a: IndexRow, b: IndexRow) => number;
function getComparator(sortColumn: string): Comparator {
    switch (sortColumn) {
        case 'cName':
        case 'cFlags':
        case 'cFields':
            return (a, b) => {
                return a[sortColumn].localeCompare(b[sortColumn]);
            };
        default:
            throw new Error(`unsupported sortColumn: "${sortColumn}"`);
    }
}

function rowKeyGetter(row: IndexRow) {
    return row.cName;
}

function Indexes() {
    const [rows, setRows] = useState<IndexRow[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
        () => new Set()
    );
    const [filteredRows, setFilteredRows] = useState<IndexRow[]>([]);
    const [filters, setFilters] = useState({
        columns: {},
        enabled: true,
    });
    const filtersRef = useRef(filters);
    const updateFilters = (filtersObj: { columns: object; enabled: boolean }) => {
        filtersRef.current = filtersObj;
        setFilters(filtersObj);
    };
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);
    const vscode = getVSCodeAPI();
    const configuration = getVSCodeConfiguration();
    const logger = new Logger(configuration.logging.react);

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

    React.useEffect(() => {
        window.addEventListener('resize', windowRezise);

        return () => {
            window.removeEventListener('resize', windowRezise);
        };
    }, []);

    const sortedRows = useMemo((): readonly IndexRow[] => {
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

    // Memoize columns with headerRenderer to avoid mutating the imported columns
    const columnsWithHeader = useMemo(() => {
        return columnName.columns.map((column: any) => ({
            ...column,
            headerRenderer: function (props: any) {
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
            },
        }));
    }, [filters, configuration]);

    const gridDivRef = useRef<HTMLDivElement | null>(null);

    // Apply filters to rows when filters or rows change
    useEffect(() => {
        if (!filters || !filters.enabled) {
            setFilteredRows(rows);
            return;
        }
        const cols = (filters as any).columns || {};
        const filtered = rows.filter((row) => {
            return Object.keys(cols).every((key) => {
                const filterValue = (cols as any)[key];
                if (filterValue === undefined || filterValue === null || filterValue === '') {
                    return true;
                }
                const cellValue = (row as any)[key];
                if (cellValue === undefined || cellValue === null) { return false; }
                const cellStr = String(cellValue).toLowerCase();
                const filterStr = String(filterValue).toLowerCase().trim();
                return cellStr.startsWith(filterStr);
            });
        });
        setFilteredRows(filtered);
    }, [rows, filters]);

    React.useLayoutEffect(() => {
        window.addEventListener('message', (event) => {
            const message = event.data;
            logger.log('indexes explorer data', message);
            switch (message.command) {
                case 'data':
                    setRows(message.data.indexes);
                    setFilteredRows(message.data.indexes);
                    updateFilters({
                        columns: {},
                        enabled: true,
                    });
                    setDataLoaded(true);
            }
        });
    });

    const refresh = () => {
        const obj = {
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
            const allSelected = rows && rows.length > 0 && selectedRows && rows.every((r: IndexRow) => selectedRows.has(r.cName));
            const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                    setSelectedRows(new Set(rows.map((r: IndexRow) => r.cName)));
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
            const row: IndexRow = p.row;
            const checked = selectedRows && selectedRows.has(row.cName);
            const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const next = new Set(selectedRows || []);
                if (e.target.checked) {
                    next.add(row.cName);
                } else {
                    next.delete(row.cName);
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
                                    .filter((el: any) => el.tabIndex >= 0 && (el.offsetParent !== null)) as HTMLElement[];
                                if (focusables.length === 0) { return; }
                                const active = document.activeElement as HTMLElement | null;
                                const idx = focusables.indexOf(active as HTMLElement);
                                if (idx === -1 && root.contains(active)) {
                                    focusables[0].focus();
                                    (e as React.KeyboardEvent).preventDefault();
                                    return;
                                }
                                const forward = !(e as React.KeyboardEvent).shiftKey;
                                if (idx === -1) { return; }
                                const next = forward ? idx + 1 : idx - 1;
                                if (next >= 0 && next < focusables.length) {
                                    focusables[next].focus();
                                    (e as React.KeyboardEvent).preventDefault();
                                }
                            }
                        } catch (err) {
                            console.error('Indexes: grid Tab handler error', err);
                        }
                    }}
                >
                    <DataGrid
                        columns={[ClearColumn, SelectColumnCustom, ...columnsWithHeader]}
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
                    />
                </div>
            ) : null}
        </div>
    );
}

export default Indexes;
