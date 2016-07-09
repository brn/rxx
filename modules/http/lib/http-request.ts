// -*- mode: typescript -*-
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


/// <reference path="./declarations.d.ts"/>

import {
  io,
  IO,
  IOResponse,
  SubjectStore,
  HttpConfig,
  HttpMethod,
  ResponseType,
  param,
  Symbol,
  intercept,
  Disposable
} from '@react-mvi/core';
import {
  Observable,
  Subscription,
  ConnectableObservable
} from 'rxjs/Rx';
import {
  HttpResponse
} from './http-response';
import {
  querystring as qs
} from './shims/query-string';
import {
  Promise
} from './shims/promise';
import {
  fetch,
  Response,
  Fetch
} from './shims/fetch';



export {IOResponse, HttpConfig, HttpMethod, ResponseType};

export const HTTP_INTERCEPT = Symbol('__http_request_intercept__');
export const HTTP_REQUEST_INTERCEPT = Symbol('__http_request_request_intercept__');


/**
 * Http request sender.
 */
@io
export class HttpRequest implements IO {
  /**
   * Response.
   */
  private res: IOResponse;

  /**
   * Subject holder.
   */
  private store: SubjectStore;


  /**
   * @param filters Filter processoers.
   */
  public constructor() {
    this.store = new SubjectStore();
    this.res   = new IOResponse(this.store);
  }


  /**
   * Wait for request from observables.
   * @override
   * @param request Observable that send request.
   */
  public subscribe(props: {[key: string]: any}): Disposable {
    const disp = new Disposable();
    if (props['http']) {
      for (let reqKey in props['http']) {
        const req = props['http'][reqKey];
        disp.addSubscription(req.subscribe((config: HttpConfig) => {
          const subjects = this.store.get(reqKey);
          (() => {
            switch (config.method) {
            case HttpMethod.GET:
              return this.get(config);
            case HttpMethod.POST:
              return this.post(config);
            case HttpMethod.PUT:
              return this.put(config);
            default:
              return this.get(config);
            }
          })()
            .then(res => {
              const handler = result => {
                const response = new HttpResponse(res.ok, res.status, res.ok? result: null, res.ok? null: result);
                subjects.forEach(subject => subject.next(response));
              };
              if (res.ok) {
                this.getResponse(config.responseType, res).then(handler);
              } else {
                this.getResponse(this.getResponseTypeFromHeader(res), res).then(handler);
              }
            }).catch(err => {
              const handler = result => {
                const response = new HttpResponse(false, err && err.status? err.status: 500, null, result);
                subjects.forEach(subject => subject.next(response));
              };
              if (err && typeof err.json === 'function') {
                this.getResponse(config.responseType, err).then(handler);
              } else {
                handler(err);
              }
            });
        }));
      }
      for (let reqKey in props['http']) {
        const req = props['http'][reqKey];
        if (req instanceof ConnectableObservable || typeof req.connect === 'function') {
          req.connect();
        }
      }
    }
    return disp;
  }


  /**
   * Dispose all subscriptions.
   * @override
   */
  public end() {
    this.store.end();
  }


  /**
   * Return response observable.
   */
  public get response() {
    return this.res;
  }


  protected get fetch(): Fetch {
    return fetch;
  }


  /**
   * Send GET request.
   * @data url Target url.
   * @data data GET parameters.
   * @returns Promise that return response.
   */
  @intercept(HTTP_REQUEST_INTERCEPT)
  private get({url, headers = {}, data = null, mode}: HttpConfig): Promise<Response> {
    return this.fetch(data? `${url}?${qs.stringify(data)}`: url, {
      method: 'GET',
      headers,
      mode: mode || 'same-origin'
    });
  }


  /**
   * Send POST request.
   * @data url Target url.
   * @data data POST body.
   * @returns Promise that return response.
   */
  @intercept(HTTP_REQUEST_INTERCEPT)
  private post({url, headers = {}, data = {} as any, json = true, mode}: HttpConfig): Promise<Response> {
    return this.fetch(url, {
      headers,
      method: 'POST',
      mode: mode || 'same-origin',
      body: json? JSON.stringify(data): data
    });
  }


  /**
   * Send PUT request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  @intercept(HTTP_REQUEST_INTERCEPT)
  private put({url, headers = {}, data = {} as any, json = true, mode}: HttpConfig): Promise<Response> {
    return this.fetch(url, {
      headers: headers,
      method: 'PUT',
      mode: mode || 'same-origin',
      body: json? JSON.stringify(data): data
    });
  }


  /**
   * Send DELETE request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  @intercept(HTTP_REQUEST_INTERCEPT)
  private delete<T>({url, headers = {}, data = {} as any, json = true, mode}: HttpConfig): Promise<Response> {
    return this.fetch(url, {
      headers: headers,
      method: 'DELETE',
      mode: mode || 'same-origin',
      body: json? JSON.stringify(data): data
    });
  }


  /**
   * Get proper response from fetch response body.
   * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
   * @param res Http response.
   * @returns 
   */
  @intercept(HTTP_INTERCEPT)
  private getResponse(responseType: ResponseType, res: Response): Promise<Blob|FormData|string|ArrayBuffer|Object> {
    switch (responseType) {
    case ResponseType.ARRAY_BUFFER:
      return res.arrayBuffer();
    case ResponseType.BLOB:
      return res.blob();
    case ResponseType.FORM_DATA:
      return res.formData();
    case ResponseType.JSON:
      return res.json();
    case ResponseType.TEXT:
      return res.text();
    default:
      return res.text();
    }
  }


  private getResponseTypeFromHeader(res: Response) {
    const mime = res.headers.get('content-type');
    if (mime.indexOf('text/plain') > -1) {
      return ResponseType.TEXT;
    }
    if (mime.indexOf('text/json') > -1 || mime.indexOf('application/json') > -1) {
      return ResponseType.JSON;
    }
    if (/^(?:image|audio|video|(?:application\/zip)|(?:application\/octet-stream))/.test(mime)) {
      return ResponseType.BLOB;
    }
    return ResponseType.TEXT;
  }
}
