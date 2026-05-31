import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { CommandAction, IndexRow } from '../model';
import DataGrid from 'react-data-grid';
import type { SortColumn } from 'react-data-grid';
import * as columnName from './column.json';
import ColumnHeaderCell from '@app/Components/Layout/Query/ColumnHeaderCell';
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
        vscode.postMessage(obj);
    };

    return (
        <div>
            {!dataLoaded ? (
                <button className='refreshButton' onClick={refresh}>
                    Refresh
                </button>
            ) : rows.length > 0 ? (
                <DataGrid
                    columns={columnsWithHeader}
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
            ) : null}
        </div>
    );
}

export default Indexes;
