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
  isDefined,
  IOResponse,
  SubjectStore,
  param,
  Symbol,
  intercept,
  Outlet
} from '@react-mvi/core';
import {
  Observable,
  Subscription,
  ConnectableObservable
} from 'rxjs/Rx';
import {
  HttpResponseImpl
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
import {
  HttpConfig,
  HttpMethod,
  HttpResponse,
  ResponseType
} from './types';


export const HTTP_RESPONSE_INTERCEPT = Symbol('__http_request_intercept__');
export const HTTP_REQUEST_INTERCEPT = Symbol('__http_request_request_intercept__');

const typeMatcher = /\[object ([^\]]+)\]/

/**
 * Http request sender.
 */
@io
export class HttpRequest extends Outlet {
  /**
   * Wait for request from observables.
   * @override
   * @param request Observable that send request.
   */
  public subscribe(props: {[key: string]: any}): Subscription {
    const subscription = new Subscription();
    if (props['http']) {
      for (let reqKey in props['http']) {
        const req = props['http'][reqKey];
        subscription.add(req.subscribe((config: HttpConfig) => this.push(reqKey, config)));
      }
      for (let reqKey in props['http']) {
        const req = props['http'][reqKey];
        if (req instanceof ConnectableObservable || typeof req.connect === 'function') {
          req.connect();
        }
      }
    }
    return subscription;
  }


  /**
   * @inheritDoc
   */
  public push(key: string, args?: any) {
    if (!args) {
      throw new Error('Config required.');
    }

    const config: HttpConfig = args;

    const subjects = this.store.get(key);
    (() => {
      switch (config.method) {
      case HttpMethod.GET:
        return this.get(config);
      case HttpMethod.POST:
        return this.post(config);
      case HttpMethod.PUT:
        return this.put(config);
      case HttpMethod.DELETE:
        return this.delete(config);
      default:
        return this.get(config);
      }
    })()
      .then(res => {
        const handler = result => {
          const headers = this.processHeaders(res);
          const response = new HttpResponseImpl(res.ok, res.status, headers, res.ok? result: null, res.ok? null: result);
          subjects.forEach(subject => subject.next(response));
        };
        if (res.ok) {
          this.getResponse(config.responseType, res).then(handler);
        } else {
          this.getResponse(this.getResponseTypeFromHeader(res), res).then(handler);
        }
      }).catch(err => {
        const handler = result => {
          const response = new HttpResponseImpl(false, err && err.status? err.status: 500, {}, null, result);
          subjects.forEach(subject => subject.next(response));
        };
        if (err && typeof err.json === 'function') {
          this.getResponse(config.responseType, err).then(handler);
        } else {
          handler(err);
        }
      });
  }


  /**
   * @inheritDoc
   */
  public callback(key: string, value?: any) {return (args?: any) => this.push(key, isDefined(value)? value: args)}


  private processHeaders(res: Response): {[key: string]: string} {
    const headers = {};
    res.headers.forEach((v, k) => headers[k] = v);
    return headers;
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
  private post({url, headers = {}, data = {} as any, json = true, form = false, mode}: HttpConfig): Promise<Response> {
    return this.fetch(url, {
      headers,
      method: 'POST',
      mode: mode || 'same-origin',
      body: json? JSON.stringify(data): form? this.serialize(data): data
    });
  }


  /**
   * Send PUT request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  @intercept(HTTP_REQUEST_INTERCEPT)
  private put({url, headers = {}, data = {} as any, json = true, form = false, mode}: HttpConfig): Promise<Response> {
    return this.fetch(url, {
      headers: headers,
      method: 'PUT',
      mode: mode || 'same-origin',
      body: json? JSON.stringify(data): form? this.serialize(data): data
    });
  }


  /**
   * Send DELETE request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  @intercept(HTTP_REQUEST_INTERCEPT)
  private delete<T>({url, headers = {}, data = {} as any, json = true, form = false, mode}: HttpConfig): Promise<Response> {
    const req = {
      headers: headers,
      method: 'DELETE',
      mode: mode || 'same-origin'
    };
    if (isDefined(data)) {
      req['body'] = json? JSON.stringify(data): form? this.serialize(data): data;
    }
    return this.fetch(url, req);
  }


  /**
   * Get proper response from fetch response body.
   * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
   * @param res Http response.
   * @returns 
   */
  @intercept(HTTP_RESPONSE_INTERCEPT)
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


  private serialize(data: any): string {
    const ret = [];
    this.doSerialize(data, ret);
    return ret.join('&');
  }


  private doSerialize(data: any, resultCollection: string[], parentKey: string = ''): void {
    const type = this.getType(data);
    if (type === 'Object') {
      for (let key in data) {
        const valueType = this.getType(data[key]);
        const keyValue = `${parentKey? parentKey + '.': ''}${key}`;
        if (valueType === 'String' ||
            valueType === 'Number' ||
            valueType === 'RegExp' ||
            valueType === 'Boolean') {
          resultCollection.push(`${keyValue}=${String(data[key])}`);
        } else if (valueType === 'Date') {
          resultCollection.push(`${keyValue}=${+(data[key])}`);
        } else if (valueType === 'Object') {
          this.doSerialize(data[key], resultCollection, key);
        } else if (valueType === 'Array') {
          this.doSerialize(data[key], resultCollection, key);
        }
      }
    } else if (type === 'Array') {
      for (let i = 0, len = data.length; i < len; i++) {
        resultCollection.push(`${parentKey}[i]=${data[i]}`);
      }
    }
  }


  private getType(value): string {
    return Object.prototype.toString.call(value).match(typeMatcher)[1]
  }
}
