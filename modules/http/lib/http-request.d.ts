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
import 'whatwg-fetch';
import { IOResponse, Http, HttpConfig, HttpMethod, ResponseType } from '@react-mvi/core';
import { Filter } from './filters/filter';
import { Observable, Subscription } from 'rxjs/Rx';
export { IOResponse, HttpConfig, HttpMethod, ResponseType };
export { Filter };
/**
 * Http request sender.
 */
export declare class HttpRequest implements Http {
    private filters;
    /**
     * Response.
     */
    private res;
    /**
     * Subject holder.
     */
    private store;
    /**
     * @param filters Filter processoers.
     */
    constructor(filters: Filter[]);
    /**
     * Wait for request from observables.
     * @override
     * @param request Observable that send request.
     */
    wait(request: Observable<HttpConfig>): Subscription;
    /**
     * Dispose all subscriptions.
     * @override
     */
    end(): void;
    /**
     * Return response observable.
     */
    readonly response: IOResponse;
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
    private post({url, headers, data, json, mode});
    /**
     * Send PUT request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    private put({url, headers, data, json, mode});
    /**
     * Send DELETE request.
     * @data url Target url.
     * @data data PUT body.
     * @returns Promise that return response.
     */
    private delete<T>({url, headers, data, json, mode});
    /**
     * Do filtering process.
     * @data err Http Error
     * @data res Http response
     * @data resolve Success handler.
     * @data reject Error handler.
     */
    private applyFilters<T>(config, responsePromise);
    /**
     * Get proper response from fetch response body.
     * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
     * @param res Http response.
     * @returns
     */
    private getResponse<T>(responseType, res);
}
