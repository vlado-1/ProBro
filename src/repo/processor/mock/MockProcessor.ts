import { IProcessor } from '../IProcessor';

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

    getDBVersion(config: any): Promise<any> {
        const debug = this.createDebug();
        return Promise.resolve({ dbversion: 'MockDB 1.0', proversion: 'MockProcessor 1.0', debug });
    }

    getTablesList(config: any): Promise<any> {
        const debug = this.createDebug();
        return Promise.resolve({ tables: [{ name: 'MOCK_TABLE', tableType: 'UserTable' }], debug });
    }

    getTableData(config: any, tableName: string | undefined, inputParams: any): Promise<any> {
        const debug = this.createDebug();
        if (!config || !tableName || !inputParams) {
            return Promise.resolve({ columns: [], data: [], debug });
        }

        const columns = [
            { name: 'ROWID', key: 'ROWID', label: 'ROWID', type: 'ROWID', format: null },
            { name: 'name', key: 'name', label: 'Name', type: 'character', format: 'x(50)' },
            { name: 'amount', key: 'amount', label: 'Amount', type: 'decimal', format: '->,>>>,>>9.99' },
            { name: 'created', key: 'created', label: 'Created', type: 'datetime', format: '99/99/9999 HH:MM:SS' },
            { name: 'active', key: 'active', label: 'Active', type: 'logical', format: 'TRUE/FALSE' },
        ];

        const data = [
            { ROWID: '0x0001', name: 'Mock record 1', amount: 12.34, created: '2023-01-01T10:00:00.000', active: true },
            { ROWID: '0x0002', name: 'Mock record 2', amount: 56.78, created: '2023-01-02T11:00:00.000', active: false },
        ];

        return Promise.resolve({ columns, data, debug });
    }

    submitTableData(config: any, tableName: string | undefined, inputParams: any): Promise<any> {
        const debug = this.createDebug();
        if (!config || !tableName || !inputParams) {
            return Promise.resolve({ columns: [], data: [], debug });
        }

        // Simulate submit success by returning the submitted rows back
        const columns = [
            { name: 'ROWID', key: 'ROWID', label: 'ROWID', type: 'ROWID', format: null },
            { name: 'name', key: 'name', label: 'Name', type: 'character', format: 'x(50)' },
        ];

        const data = (inputParams && inputParams.data) || [];

        return Promise.resolve({ columns, data, debug });
    }

    getTableDetails(config: any, tableName: string | undefined): Promise<any> {
        const debug = this.createDebug();
        if (!config || !tableName) {
            return Promise.resolve({ fields: [], indexes: [], tableName: tableName ?? '', debug });
        }

        const fields = [
            {
                order: 1,
                name: 'ROWID',
                type: 'ROWID',
                format: '',
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
            {
                order: 2,
                name: 'name',
                type: 'character',
                format: 'x(50)',
                label: 'Name',
                initial: '',
                columnLabel: 'Name',
                mandatory: 'no',
                extent: 50,
                decimals: 0,
                rpos: 0,
                valexp: '',
                valMessage: '',
                helpMsg: '',
                description: '',
                viewAs: '',
            },
        ];

        const indexes = [
            { cName: 'IDX_ROWID', cFlags: '', cFields: 'ROWID' },
        ];

        return Promise.resolve({ fields, indexes, tableNamse: tableName ?? '', debug });
    }

    private createDebug() {
        const now = new Date();
        return {
            start: now.toISOString(),
            startConnect: now.toISOString(),
            end: now.toISOString(),
            endConnect: now.toISOString(),
            time: 1,
            timeConnect: 1,
        };
    }
}
