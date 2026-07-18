import { UIEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import DataGrid, {
    SortColumn,
    CopyEvent,
    DataGridHandle,
    HeaderRendererProps,
} from 'react-data-grid';
import { Box } from '@mui/material';
import { IFilters } from '@app/common/types';
import ColumnHeaderCell from './ColumnHeaderCell';

interface QueryFormTableProps {
    queryGridRef: React.RefObject<DataGridHandle>;
    selected: any[];
    sortColumns: SortColumn[];
    handleScroll: (event: UIEvent<HTMLDivElement>) => void;
    onSortClick: (inputSortColumns: SortColumn[]) => void;
    filters: IFilters;
    selectedRows: Set<string>;
    setSelectedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
    rowKeyGetter: (row: any) => string;
    readRecord: (row: any) => void;
    handleCopy: (event: CopyEvent<any>) => void;
    windowHeight: number;
    setRowHeight: () => number;
    configuration: any;
    rows: any[];
    reloadData: (loaded: number) => void;
    setFilters: (data: IFilters) => void;
}

type QueryHeaderRendererProps = {
    setCellSelected?: () => void;
} & HeaderRendererProps<unknown, unknown>;

const QueryFormTable: React.FC<QueryFormTableProps> = ({
    queryGridRef,
    selected,
    sortColumns,
    handleScroll,
    onSortClick,
    filters,
    selectedRows,
    setSelectedRows,
    rowKeyGetter,
    readRecord,
    handleCopy,
    windowHeight,
    setRowHeight,
    configuration,
    rows,
    reloadData,
    setFilters,
}) => {
    const filtersRef = useRef(filters);
    const reloadDataRef = useRef(reloadData);
    const configurationRef = useRef(configuration);
    const setFiltersRef = useCallback(
        (data: IFilters) => {
            filtersRef.current = data;
            setFilters(data);
        },
        [setFilters]
    );

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    useEffect(() => {
        reloadDataRef.current = reloadData;
    }, [reloadData]);

    useEffect(() => {
        configurationRef.current = configuration;
    }, [configuration]);

    const handleReloadData = useCallback((loaded: number) => {
        reloadDataRef.current(loaded);
    }, []);

    function renderHeaderCell(props: QueryHeaderRendererProps): JSX.Element {
        const { column, sortDirection, priority, onSort, isCellSelected, setCellSelected } = props;
        return (
            <ColumnHeaderCell
                column={column}
                sortDirection={sortDirection}
                priority={priority}
                onSort={onSort}
                isCellSelected={isCellSelected}
                setCellSelected={setCellSelected}
                filters={filtersRef.current}
                setFilters={setFiltersRef}
                configuration={configurationRef.current}
                reloadData={handleReloadData}
                manageFocus={true}
            />
        );
    }

    const adjustedColumns = useMemo(
        () =>
            selected.map((column, index) => {
                if (index === 0) {
                    return column;
                }

                return {
                    ...column,
                    headerRenderer: renderHeaderCell,
                };
            }),
        [selected]
    );
    const calculateHeight = () => {
        const rowCount = rows.length;
        const cellHeight = getCellHeight();
        const startingHeight = 85;
        const calculatedHeight = startingHeight + rowCount * cellHeight;
        return calculatedHeight;
    };

    const getCellHeight = () => {
        if (configuration.gridTextSize === 'Large') {
            return 40;
        } else if (configuration.gridTextSize === 'Medium') {
            return 30;
        } else if (configuration.gridTextSize === 'Small') {
            return 20;
        }
        return 30;
    };

    return (
        <Box>
            <DataGrid
                ref={queryGridRef}
                columns={adjustedColumns}
                rows={rows}
                defaultColumnOptions={{
                    sortable: true,
                    resizable: true,
                }}
                sortColumns={sortColumns}
                onScroll={handleScroll}
                onSortColumnsChange={onSortClick}
                className={filters.enabled ? 'filter-cell' : ''}
                headerRowHeight={filters.enabled ? 70 : undefined}
                style={{
                    height: calculateHeight(),
                    overflow: 'auto',
                    minHeight: 105,
                    maxHeight: windowHeight - 120,
                    whiteSpace: 'pre',
                }}
                selectedRows={selectedRows}
                onSelectedRowsChange={setSelectedRows}
                rowKeyGetter={rowKeyGetter}
                onRowDoubleClick={readRecord}
                onCopy={handleCopy}
                rowHeight={setRowHeight}
            ></DataGrid>
        </Box>
    );
};

export default QueryFormTable;
