/**
 * Exit async function gracefully.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} The function that is notify error to mocha.
 */
export declare const graceful: ((cb: (...args: any[]) => void, done: (e?: Error) => void, optCallback?: (e?: any) => void) => any) & {
    run: (cb: (e?: any) => void, done: (e?: Error) => void, optCallback?: (e?: any) => void) => any;
};
/**
 * Create function that exit async test case.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case.
 */
export declare const nothing: (done: (e?: Error) => void, optCallback?: (e?: any) => void) => () => void;
/**
 * Create function that exit test case if error thrown.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case if error thrown.
 */
export declare const stopOnError: ((cb: (...args: any[]) => void, done: (e?: Error) => void, optCallback?: (e?: any) => void) => any) & {
    run(cb: (e?: any) => void, done: (e?: any) => void, optCallback?: (e?: any) => void): any;
};
export declare class Joiner {
    private time;
    private cb;
    private current;
    constructor(time: any, cb: any);
    notify(): void;
}
