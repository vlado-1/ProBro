import { Box, TextField, Typography } from '@mui/material';
import { Fragment, useRef, useEffect } from 'react';
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
}) => {

    const cellRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = (event: React.MouseEvent) => {
        onSort(event.ctrlKey || event.metaKey);

    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onSort(event.ctrlKey || event.metaKey);
        }
    };

    const timerRef = useRef<any>(null);
    const focusAndSelect = (el?: HTMLInputElement | null) => {
        try {
            (el || inputRef.current)?.focus();
        } catch (err) {
            console.error('ColumnHeaderCell: focus error', err, column?.key);
        }
        setTimeout(() => {
            try {
                (el || inputRef.current)?.select();
            } catch (err) {
                console.error('ColumnHeaderCell: select error', err, column?.key);
            }
        }, 10);
    };
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
            setCellSelected && setCellSelected();
        }
        if (event.key === 'Tab') {
            try {
                const inputs = Array.from(document.querySelectorAll('[data-header-column]')) as HTMLElement[];
                if (inputs.length === 0) { return; }
                const active = event.target as HTMLElement | null;
                const idx = active ? inputs.indexOf(active) : -1;
                const forward = !event.shiftKey;
                const next = forward ? idx + 1 : idx - 1;
                if (next >= 0 && next < inputs.length) {
                    event.preventDefault();
                    inputs[next].focus();
                    setTimeout(() => {
                        try {
                            (inputs[next] as HTMLInputElement).select();
                        } catch (err) {
                            console.error('ColumnHeaderCell: delayed select error', err, column?.key);
                        }
                    }, 10);
                }
            } catch (err) {
                console.error('ColumnHeaderCell: input Tab handler error', err, column?.key);
            }
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

    useEffect(() => {
        const onDocKeyDown = (ev: KeyboardEvent) => {
            if (ev.key !== 'Tab') { return; }
            const target = ev.target as HTMLElement | null;
            if (!target) { return; }
            if (!target.hasAttribute || !target.hasAttribute('data-header-column')) { return; }
            try {
                const inputs = Array.from(document.querySelectorAll('[data-header-column]')) as HTMLElement[];
                const idx = inputs.indexOf(target as HTMLElement);
                if (idx === -1) { return; }
                const forward = !ev.shiftKey;
                const next = forward ? idx + 1 : idx - 1;
                if (next >= 0 && next < inputs.length) {
                    ev.preventDefault();
                    (inputs[next] as HTMLElement).focus();
                    setTimeout(() => {
                        try {
                            (inputs[next] as HTMLInputElement).select();
                        } catch (err) {
                            console.error('ColumnHeaderCell: delayed select error', err);
                        }
                    }, 10);
                }
            } catch (err) {
                console.error('ColumnHeaderCell: doc Tab handler error', err);
            }
        };
        document.addEventListener('keydown', onDocKeyDown, true);
        return () => document.removeEventListener('keydown', onDocKeyDown, true);
    }, []);
    return (
        <Fragment>
            {filters.enabled && (
                <Box>
                    <Box
                        ref={cellRef}
                        tabIndex={-1}
                        onClick={(event: React.MouseEvent) => {
                            setCellSelected && setCellSelected();
                            try {
                                focusAndSelect();
                            } catch (err) {
                                console.error('ColumnHeaderCell: error focusing input on header click', err, column?.key);
                            }
                            handleClick(event);
                        }}
                        onKeyDown={handleKeyDown}
                        display='flex'
                        alignItems='center'
                        sx={{
                            height: '35px',
                            padding: '0',
                            cursor: 'pointer',
                            '&:focus': {
                                outline: '2px solid rgba(100,150,250,0.6)',
                                borderRadius: '3px',
                            },
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
                fullWidth={true}
                autoFocus={isCellSelected}
                inputRef={inputRef}
                inputProps={{ 'data-header-column': column.key }}
                tabIndex={0}
                onFocus={() => {
                    setCellSelected && setCellSelected();
                    // select input contents to allow immediate typing/replacement when tabbing in
                    try {
                        inputRef.current?.select();
                    } catch (err) {
                        console.error('ColumnHeaderCell: error selecting input contents', err, column?.key);
                    }
                }}
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
