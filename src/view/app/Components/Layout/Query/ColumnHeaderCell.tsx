import { Box, TextField, Typography } from '@mui/material';
import { Fragment, useLayoutEffect, useRef } from 'react';
import SortArrowIcon from '../Common/SortArrorIcon';
import { IFilters } from '@app/common/types';

type ColumnHeader = {
    key: string;
    name: React.ReactNode;
};

type ColumnHeaderConfiguration = {
    initialBatchSizeLoad: number;
    filterAsYouType?: boolean;
};

interface ColumnHeaderCellProps {
    column: ColumnHeader;
    sortDirection: 'ASC' | 'DESC';
    priority: number;
    onSort: (multiColumnSort: boolean) => void;
    isCellSelected: boolean;
    setCellSelected?: () => void;
    filters: IFilters;
    setFilters: (filters: IFilters) => void;
    configuration: ColumnHeaderConfiguration;
    reloadData?: (batchSize: number) => void;
    manageFocus?: boolean;
}

const ColumnHeaderCell: React.FC<ColumnHeaderCellProps> = ({
    column,
    sortDirection,
    onSort,
    isCellSelected,
    setCellSelected,
    filters,
    setFilters,
    configuration,
    reloadData,
    manageFocus = false,
}) => {
    const cellRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const shouldSelectTextOnFocusRef = useRef(true);
    const filterColumns = filters.columns as Record<string, string | undefined>;

    useLayoutEffect(() => {
        if (!manageFocus || !isCellSelected) {
            return;
        }

        inputRef.current?.focus({ preventScroll: true });
    }, [isCellSelected, manageFocus]);

    const handleClick = (event: React.MouseEvent) => {
        onSort(event.ctrlKey || event.metaKey);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onSort(event.ctrlKey || event.metaKey);
        }
    };

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleKeyInputTimeout = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            reloadData?.(configuration.initialBatchSizeLoad);
        }, 500);
    };

    const testKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            reloadData?.(configuration.initialBatchSizeLoad);
        }
    };

    const handleInputKeyDown = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        shouldSelectTextOnFocusRef.current = false;

        const tempFilters: IFilters = {
            ...filters,
            columns: {
                ...(filters.columns as Record<string, string | undefined>),
                [column.key]: value,
            },
        };

        setFilters(tempFilters);

        if (configuration.filterAsYouType === true) {
            handleKeyInputTimeout();
        }
    };

    return (
        <Fragment>
            {filters.enabled && (
                <Box>
                    <Box
                        ref={cellRef}
                        tabIndex={-1}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                        display='flex'
                        alignItems='center'
                        width='100%'
                        sx={{
                            minHeight: '35px',
                            padding: '0',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Typography
                            fontSize={'0.8rem'}
                            fontWeight={'bold'}
                            flexGrow={1}
                        >
                            {column.name}
                        </Typography>
                        <SortArrowIcon sortDirection={sortDirection} />
                    </Box>
                </Box>
            )}
            <TextField
                variant='standard'
                size='small'
                value={filterColumns[column.key] ?? ''}
                onChange={handleInputKeyDown}
                onKeyDown={testKeyDown}
                onFocus={(event) => {
                    if (manageFocus) {
                        setCellSelected?.();
                    }

                    if (
                        event.currentTarget.value &&
                        shouldSelectTextOnFocusRef.current
                    ) {
                        event.currentTarget.select();
                        shouldSelectTextOnFocusRef.current = false;
                    }
                }}
                onBlur={() => {
                    shouldSelectTextOnFocusRef.current = true;
                }}
                inputRef={inputRef}
                fullWidth={true}
                InputProps={{ disableUnderline: true }}
                sx={{
                    '& .MuiInputBase-input': {
                        fontSize: '0.8rem',
                        padding: '4px',
                        backgroundColor: 'var(--vscode-input-background, #3c3c3c)',
                        color: 'var(--vscode-input-foreground, #cccccc)',
                    },
                }}
            />
        </Fragment>
    );
};

export default ColumnHeaderCell;
