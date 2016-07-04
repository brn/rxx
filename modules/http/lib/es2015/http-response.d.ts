/**
 * @fileoverview
 * @author Taketoshi Aono
 */
export declare class HttpResponse<T, E> {
    private _ok;
    private _status;
    private _response;
    private _error;
    constructor(_ok: boolean, _status: number, _response: T, _error?: E);
    readonly ok: boolean;
    readonly status: number;
    readonly response: T;
    readonly error: E;
}
