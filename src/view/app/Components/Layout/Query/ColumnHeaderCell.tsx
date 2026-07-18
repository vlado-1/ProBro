import { Box, TextField, Typography } from '@mui/material';
import { Fragment, useLayoutEffect, useRef } from 'react';
import SortArrowIcon from '../Common/SortArrorIcon';

interface ColumnHeaderCellProps {
    column: any;
    sortDirection: 'ASC' | 'DESC';
    priority: number;
    onSort: (multiColumnSort: boolean) => void;
    isCellSelected: boolean;
    setCellSelected?: () => void;
    filters: any;
    setFilters: (filters: any) => void;
    configuration: any;
    reloadData?: (batchSize: number) => void;
    manageFocus?: boolean;
}

const ColumnHeaderCell: React.FC<ColumnHeaderCellProps> = ({
    column,
    sortDirection,
    priority,
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

    useLayoutEffect(() => {
        if (!manageFocus) {
            return;
        }

        if (!isCellSelected) {
            return;
        }

        inputRef.current?.focus({ preventScroll: true });
    }, [isCellSelected, manageFocus]);

    const handleClick = (event: React.MouseEvent) => {
        if (event.target !== event.currentTarget) {
            return;
        }
        onSort(event.ctrlKey || event.metaKey);

    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.target !== event.currentTarget) {
            return;
        }
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onSort(event.ctrlKey || event.metaKey);
        }
    };

    const timerRef = useRef<any>(null);
    const handleKeyInputTimeout = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            reloadData && reloadData(configuration.initialBatchSizeLoad);
        }, 500);
    };

    const testKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            reloadData && reloadData(configuration.initialBatchSizeLoad);
        }
    };

    const handleInputKeyDown = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;

        const tempFilters = {
            ...filters,
            columns: {
                ...(filters?.columns || {}),
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
                        sx={{
                            height: '35px',
                            padding: '0',
                            cursor: 'pointer',
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
                        {priority}
                    </Box>
                </Box>
            )}
            <TextField
                variant='standard'
                size='small'
                value={filters?.columns?.[column.key] ?? ''}
                onChange={handleInputKeyDown}
                onKeyDown={testKeyDown}
                onFocus={() => {
                    if (manageFocus) {
                        setCellSelected?.();
                    }
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
