/**
 * @fileoverview
 * @author Taketoshi Aono
 */
import { HttpResponse, HttpUploadProgress } from './types';
export declare class HttpResponseImpl<T, E> implements HttpResponse<T, E> {
    private _ok;
    private _status;
    private _headers;
    private _response;
    private _error;
    constructor(_ok: boolean, _status: number, _headers: {
        [key: string]: string;
    }, _response: T, _error?: E);
    readonly ok: boolean;
    readonly headers: {
        [key: string]: string;
    };
    readonly status: number;
    readonly response: T;
    readonly error: E;
}
export declare class HttpUploadProgressImpl implements HttpUploadProgress {
    private event;
    private xhr;
    constructor(event: ProgressEvent, xhr: XMLHttpRequest);
    readonly percent: number;
    readonly total: number;
    readonly loaded: number;
    cancel(): void;
}
