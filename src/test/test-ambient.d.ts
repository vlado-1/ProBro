declare module 'minimatch' {
    export interface IOptions {
        [key: string]: any;
    }

    export interface IMinimatch {
        [key: string]: any;
    }

    export function minimatch(
        path: string,
        pattern: string,
        options?: IOptions
    ): boolean;

    export default minimatch;
}

declare module '@jest/globals' {
    export const expect: any;
    export const jest: any;
    export const test: any;
    export const describe: any;
    export const it: any;
    export const beforeAll: any;
    export const afterAll: any;
    export const beforeEach: any;
    export const afterEach: any;
}