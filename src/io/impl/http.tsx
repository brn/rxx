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


import 'whatwg-fetch';
import {Promise}    from 'es6-promise';
import * as qs      from 'query-string';
import * as Cookies from 'js-cookie';
import * as _       from 'lodash';
import {
  Subject,
  Observable
}                   from 'rx';
import {Filter}     from '../../filters/filter'
import {
  param,
  inject
}                   from '../../di/inject';
import {
  IOResponse,
  SubjectStore,
  Http,
  HttpConfig,
  HttpMethod,
  ResponseType
}                   from '../io';

export {IOResponse, HttpConfig, HttpMethod, ResponseType};



/**
 * Http request sender.
 */
export class HttpRquest implements Http {

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
  public constructor(@param(/.+Filter/) private filters: Filter[]) {
    this.store = new SubjectStore();
    this.res   = new IOResponse(this.store);
  }


  /**
   * Wait for request from observables.
   * @override
   * @param request Observable that send request.
   */
  public wait(request: Observable<HttpConfig>): Rx.IDisposable {
    return request.subscribe(config => {
      const subjects = this.store.get(config.key);
      this.applyFilters(config, (() => {
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
      })()).then(res => {
        subjects.forEach(subject => subject.onNext(res));
      }).catch(err => {
        subjects.forEach(subject => subject.onError(err));
      });
    });
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


  /**
   * Send GET request.
   * @data url Target url.
   * @data data GET parameters.
   * @returns Promise that return response.
   */
  private get({url, headers = {}, data = null, mode}: HttpConfig): Promise<Response> {
    return fetch(data? `${url}?${qs.stringify(data)}`: url, {
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
  private post({url, headers = {}, data = {} as any, json = true, mode}: HttpConfig): Promise<Response> {
    return fetch(url, {
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
  private put({url, headers = {}, data = {} as any, json = true, mode}: HttpConfig): Promise<Response> {
    return fetch(url, {
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
  private delete<T>({url, headers = {}, data = {} as any, json = true, mode}: HttpConfig): Promise<Response> {
    return fetch(url, {
      headers: headers,
      method: 'DELETE',
      mode: mode || 'same-origin',
      body: json? JSON.stringify(data): data
    });
  }


  /**
   * Do filtering process.
   * @data err Http Error
   * @data res Http response
   * @data resolve Success handler.
   * @data reject Error handler.
   */
  private applyFilters<T>(config: HttpConfig, responsePromise: Promise<any>) {
    return responsePromise.then(res => {
      return this.getResponse<T>(config.responseType, res).then(res => ({err: null, res}));
    }, (err) => {
      return this.getResponse(config.responseType, err).then(err => ({err, res: null}));
    }).then(filteredResult => {
      return new Promise((resolve, reject) => {
        _.every(this.filters, filter => {
          try {
            filteredResult = filter.filter(filteredResult);
          } finally {
            return filteredResult;
          }
        });

        if (!!filteredResult) {
          if (!filteredResult.err) {
            return resolve(filteredResult.res);
          }
          reject(filteredResult.err);
        }
      });
    });
  }


  /**
   * Get proper response from fetch response body.
   * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
   * @param res Http response.
   * @returns 
   */
  private getResponse<T>(responseType: ResponseType, res: Response): Promise<Blob|FormData|string|ArrayBuffer|T> {
    switch (responseType) {
    case ResponseType.ARRAY_BUFFER:
      return res.arrayBuffer();
    case ResponseType.BLOB:
      return res.blob();
    case ResponseType.FORM_DATA:
      return res.formData();
    case ResponseType.JSON:
      return res.json<T>();
    case ResponseType.TEXT:
      return res.text();
    default:
      return res.text();
    }
  }
}
