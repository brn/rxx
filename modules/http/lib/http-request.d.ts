/**
 * The MIT License (MIT)
 * Copyright (c) Taketoshi Aono
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
import { Outlet } from '@react-mvi/core';
import { Subscription } from 'rxjs/Rx';
export declare const HTTP_RESPONSE_INTERCEPT: symbol;
export declare const HTTP_REQUEST_INTERCEPT: symbol;
export interface Fetch {
    (input: RequestInfo, init?: RequestInit): Promise<Response>;
}
/**
 * Http request sender.
 */
export declare class HttpRequest extends Outlet {
    private history;
    /**
     * Wait for request from observables.
     * @override
     * @param request Observable that send request.
     */
    subscribe(props: {
        [key: string]: any;
    }): Subscription;
    /**
     * @inheritDoc
     */
    push(key: string, args?: any): Promise<any>;
    /**
     * @inheritDoc
     */
    callback(key: string, value?: any): (args?: any) => Promise<any>;
    private processHeaders(res);
    protected getFetcher(): Fetch;
    /**
     * Send GET request.
     * @data url Target url.
     * @data data GET parameters.
     * @returns Promise that return response.
     */
    private get({url, headers, data, mode});
    /**
     * Send POST request.
     * @data url Target url.
     * @data data POST body.
     * @returns Promise that return response.
     */
    private post({url, headers, data, json, form, mode});
    /**
     * Send PUT request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    private put({url, headers, data, json, form, mode});
    /**
     * Send DELETE request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    private delete<T>({url, headers, data, json, form, mode});
    private upload({method, url, headers, data, mode});
    /**
     * Get proper response from fetch response body.
     * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
     * @param res Http response.
     * @returns
     */
    private getResponse(responseType, res);
    private getResponseTypeFromHeader(res);
    private serialize(data);
    private doSerialize(data, resultCollection, parentKey?);
    private getType(value);
}
