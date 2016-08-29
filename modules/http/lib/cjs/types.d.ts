/**
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * The methods of the Http request.
 */
export declare enum HttpMethod {
    GET = 1,
    POST = 2,
    PUT = 3,
    DELETE = 4,
}
/**
 * Response type of the Http request.
 */
export declare enum ResponseType {
    JSON = 1,
    BLOB = 2,
    ARRAY_BUFFER = 3,
    FORM_DATA = 4,
    TEXT = 5,
}
/**
 * Type for Http request options.
 */
export interface HttpConfig {
    url: string;
    method?: HttpMethod;
    headers?: any;
    mode?: 'cors' | 'same-origin' | 'no-cors';
    json?: boolean;
    data?: string | Blob | FormData;
    form?: boolean;
    responseType?: ResponseType;
    sendToken?: boolean;
}
export interface HttpResponse<T, E> {
    ok: boolean;
    headers: {
        [key: string]: string;
    };
    status: number;
    response: T;
    error: E;
}
export declare function ____$_react_mvi_module_reference_bug_fix__dummy_$____(): void;
