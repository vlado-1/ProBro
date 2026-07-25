import { IProcessor } from '../IProcessor';
import {
    FieldRow,
    IConfig,
    ITableData,
    IndexRow,
    TableDetails,
} from '../../../view/app/model';

type MockColumn = {
    name: string;
    key: string;
    label: string;
    type: string;
    format: string | null;
};

type MockRow = {
    [key: string]: string | number | boolean | null;
};

type MockTableData = {
    columns: MockColumn[];
    rawData: MockRow[];
    formattedData: MockRow[];
    psc: {
        cpstream: string;
        dateformat: string;
        numformat: string;
        timestamp: string;
    };
    debug: {
        recordsRetrieved: number;
        recordsRetrievalTime: number;
        timeConnect: number;
    };
};

const MOCK_VERSION = {
    dbversion: 'Mock DB Version',
    proversion: 'Mock Pro Version',
};

const MOCK_TABLES = {
    tables: [
        { name: 'customer', tableType: 'UserTable' },
        { name: 'invoice', tableType: 'UserTable' },
    ],
};

const MOCK_COLUMNS: MockColumn[] = [
    { name: 'ROWID', key: 'ROWID', label: 'ROWID', type: 'ROWID', format: null },
    { name: 'RECID', key: 'RECID', label: 'RECID', type: 'RECID', format: null },
    {
        name: 'testCharacter',
        key: 'testCharacter',
        label: 'testCharacter',
        type: 'character',
        format: 'x(10)',
    },
    {
        name: 'testDecimal',
        key: 'testDecimal',
        label: 'testDecimal',
        type: 'decimal',
        format: '->,>>>,>>9.99',
    },
    {
        name: 'testInt',
        key: 'testInt',
        label: 'testInt',
        type: 'integer',
        format: '>>9',
    },
    {
        name: 'testIntPercent',
        key: 'testIntPercent',
        label: 'testIntPercent',
        type: 'integer',
        format: '>>9%',
    },
    {
        name: 'testInt64',
        key: 'testInt64',
        label: 'testInt64',
        type: 'int64',
        format: '>>>>>>>>>>>>>>>>>>9',
    },
    {
        name: 'testRaw',
        key: 'testRaw',
        label: 'testRaw',
        type: 'raw',
        format: 'x(8)',
    },
    {
        name: 'testDate',
        key: 'testDate',
        label: 'testDate',
        type: 'date',
        format: '99/99/9999',
    },
    {
        name: 'testDatetime',
        key: 'testDatetime',
        label: 'testDatetime',
        type: 'datetime',
        format: '99/99/9999 HH:MM:SS',
    },
    {
        name: 'testLogical',
        key: 'testLogical',
        label: 'testLogical',
        type: 'logical',
        format: 'TRUE/FALSE',
    },
];

const MOCK_FIELD_ROWS: FieldRow[] = [
    {
        order: 10,
        name: 'testCharacter',
        type: 'character',
        format: 'x(10)',
        label: 'testCharacter',
        initial: '',
        columnLabel: 'testCharacter',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 20,
        name: 'testDecimal',
        type: 'decimal',
        format: '->,>>>,>>9.99',
        label: 'testDecimal',
        initial: '',
        columnLabel: 'testDecimal',
        mandatory: 'no',
        extent: 0,
        decimals: 2,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 30,
        name: 'testInt',
        type: 'integer',
        format: '>>9',
        label: 'testInt',
        initial: '',
        columnLabel: 'testInt',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 40,
        name: 'testIntPercent',
        type: 'integer',
        format: '>>9%',
        label: 'testIntPercent',
        initial: '',
        columnLabel: 'testIntPercent',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 50,
        name: 'testInt64',
        type: 'int64',
        format: '>>>>>>>>>>>>>>>>>>9',
        label: 'testInt64',
        initial: '',
        columnLabel: 'testInt64',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 60,
        name: 'testRaw',
        type: 'raw',
        format: 'x(8)',
        label: 'testRaw',
        initial: '',
        columnLabel: 'testRaw',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 70,
        name: 'testDate',
        type: 'date',
        format: '99/99/9999',
        label: 'testDate',
        initial: '',
        columnLabel: 'testDate',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 80,
        name: 'testDatetime',
        type: 'datetime',
        format: '99/99/9999 HH:MM:SS',
        label: 'testDatetime',
        initial: '',
        columnLabel: 'testDatetime',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 90,
        name: 'testLogical',
        type: 'logical',
        format: 'TRUE/FALSE',
        label: 'testLogical',
        initial: '',
        columnLabel: 'testLogical',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 100,
        name: 'RECID',
        type: 'character',
        format: 'x(20)',
        label: 'RECID',
        initial: '',
        columnLabel: 'RECID',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
    {
        order: 110,
        name: 'ROWID',
        type: 'character',
        format: 'x(24)',
        label: 'ROWID',
        initial: '',
        columnLabel: 'ROWID',
        mandatory: 'no',
        extent: 0,
        decimals: 0,
        rpos: 0,
        valexp: '',
        valMessage: '',
        helpMsg: '',
        description: '',
        viewAs: '',
    },
];

const MOCK_INDEXES: IndexRow[] = [
    {
        cName: 'customerIdx',
        cFlags: 'P U',
        cFields: 'testCharacter +',
    },
];

const MOCK_RAW_ROWS: MockRow[] = [
    {
        ROWID: '0x0000000000002c01',
        testCharacter: 'record no.1',
        testDecimal: 0.01,
        testInt: 123,
        testIntPercent: 15,
        testInt64: '12345678901234567890',
        testRaw: 'AAMBAQEBAQEBAQEBAQA=',
        testDate: '2023-02-20',
        testDatetime: '2023-02-20T11:11:11.111',
        testLogical: true,
    },
    {
        ROWID: '0x0000000000002c02',
        testCharacter: 'record no.2',
        testDecimal: 0.11,
        testInt: 123,
        testIntPercent: 15,
        testInt64: '12345678901234567890',
        testRaw: 'AAMBAQEBAQEBAQEBAQA=',
        testDate: '2023-02-20',
        testDatetime: '2023-02-20T11:11:11.111',
        testLogical: false,
    },
    {
        ROWID: '0x0000000000002c03',
        testCharacter: 'record no.3',
        testDecimal: 0.22,
        testInt: -123,
        testIntPercent: 15,
        testInt64: '12345678901234567890',
        testRaw: 'AAMBAQEBAQEBAQEBAQA=',
        testDate: '2023-02-20',
        testDatetime: '2023-02-20T11:11:11.111',
        testLogical: true,
    },
    {
        ROWID: '0x0000000000002c04',
        testCharacter: 'record no.4',
        testDecimal: 0.33,
        testInt: 123,
        testIntPercent: 15,
        testInt64: '12345678901234567890',
        testRaw: 'AAMBAQEBAQEBAQEBAQA=',
        testDate: '2023-02-20',
        testDatetime: '2023-02-20T11:11:11.111',
        testLogical: false,
    },
];

const MOCK_PSC = {
    cpstream: 'UTF-8',
    dateformat: 'mdy-1950',
    numformat: '44,46',
    timestamp: '2023/02/20-15:36:36',
};

const MOCK_TABLE_DATA: MockTableData = {
    columns: MOCK_COLUMNS,
    rawData: MOCK_RAW_ROWS,
    formattedData: MOCK_RAW_ROWS.map((row) => {
        return Object.entries(row).reduce<MockRow>((accumulator, [key, value]) => {
            accumulator[key] = typeof value === 'boolean' ? value.toString() : value;
            return accumulator;
        }, {});
    }),
    psc: MOCK_PSC,
    debug: {
        recordsRetrieved: MOCK_RAW_ROWS.length,
        recordsRetrievalTime: 1,
        timeConnect: 1,
    },
};

const MOCK_TABLE_DETAILS: TableDetails = {
    tableName: 'customer',
    fields: MOCK_FIELD_ROWS,
    indexes: MOCK_INDEXES,
    selectedColumns: MOCK_FIELD_ROWS
        .map((field) => field.name)
        .filter((fieldName) => fieldName !== 'RECID' && fieldName !== 'ROWID'),
    debug: {
        start: 'mock',
        startConnect: 'mock',
        end: 'mock',
        endConnect: 'mock',
        time: 1,
        timeConnect: 1,
    },
};

export class MockProcessor implements IProcessor {
    private static instance: MockProcessor | undefined = undefined; // singleton

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getInstance(): MockProcessor {
        if (MockProcessor.instance === undefined) {
            MockProcessor.instance = new MockProcessor();
        }

        return MockProcessor.instance;
    }

    public getDBVersion(): Promise<any> {
        return Promise.resolve(MOCK_VERSION);
    }

    public getTablesList(): Promise<any> {
        return Promise.resolve(MOCK_TABLES);
    }

    public getTableData(
        _config: IConfig | undefined,
        _tableName: string | undefined,
        _inputParams: ITableData | undefined
    ): Promise<any> {
        return Promise.resolve(MOCK_TABLE_DATA);
    }

    public submitTableData(): Promise<any> {
        return Promise.resolve({});
    }

    public getTableDetails(
        _config: IConfig | undefined,
        tableName: string | undefined
    ): Promise<TableDetails> {
        return Promise.resolve({
            ...MOCK_TABLE_DETAILS,
            tableName: tableName ?? MOCK_TABLE_DETAILS.tableName,
        });
    }
}
