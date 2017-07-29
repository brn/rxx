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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */


import {
  isDefined,
  HandlerResponse,
  StreamStore,
  StateHandler,
  Advice,
  Advices
} from '@react-mvi/core';
import {
  Observable,
  Subscription,
  ConnectableObservable,
  Subject
} from 'rxjs/Rx';
import {
  HttpResponseImpl,
  HttpUploadProgressImpl
} from './http-response';
import {
  qs
} from './qs';
import {
  HttpConfig,
  HttpMethod,
  HttpResponse,
  ResponseType,
  UploadEventType,
  Fetch,
  HttpHandlerData
} from './types';

const DEFAULT_ERROR_STATUS = 500;

type UploadSubjectType = { type: UploadEventType; event: Event; xhr: XMLHttpRequest };

type UploadPromiseType = Subject<UploadSubjectType>;

type ResponseHandler = (res: Response, ret: any) => void;

/**
 * Http request sender.
 */
export class HttpHandler extends StateHandler {
  private static _maxHistoryLength = 10;

  public static set maxHistoryLength(length: number) {
    this._maxHistoryLength = length;
  }

  public static get maxHistoryLenght() { return this._maxHistoryLength; }


  private history: { key: string; args: HttpConfig }[] = [];

  constructor(a?: Advices) {
    super(a, {
      request: ['get', 'post', 'put', 'delete', 'upload'],
      response: 'getResponse'
    });
  }

  /**
   * Wait for request from observables.
   * @override
   * @param request Observable that send request.
   */
  public subscribe(props: { http: Observable<HttpConfig> }): Subscription {
    const subscription = new Subscription();
    if (props.http) {
      for (const reqKey in props.http) {
        const req = props.http[reqKey];
        subscription.add(req.subscribe((config: HttpConfig) => this.push(reqKey, config)));
      }
      for (const reqKey in props.http) {
        const req = props.http[reqKey];
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
  public push(key: string, args?: any): Promise<any> {
    if (key === 'RETRY') {
      const history = this.history[this.history.length - (typeof args === 'number' ? (args + 1) : 1)];
      if (!history) {
        return new Promise((_, r) => r(new Error('Invlaid retry number specified.')));
      }
      key = history.key;
      args = history.args;
    } else {
      if (this.history.length > HttpHandler._maxHistoryLength) {
        this.history.shift();
      }
      this.history.push({ key, args });
    }

    if (!args) {
      return new Promise((_, r) => r(new Error('Config required.')));
    }

    const config: HttpConfig = args;
    if (!config.reduce) {
      config.reduce = v => v;
    }

    const subjects = this.store.get(key);

    if (config.upload) {
      return this.upload(config).then(subject => {
        this.handleUploadResonse(subjects, subject, config);
      });
    }

    const errorHandler = (err, result) => {
      const response = new HttpResponseImpl(
        false, err && err.status ? err.status : DEFAULT_ERROR_STATUS, {}, null, result);
      subjects.forEach(subject => subject.next(config.reduce({ data: response, state: this.state })));
    };

    const succeededHandler = (response, result) => {
      const headers = this.processHeaders(response);
      const httpResponse = new HttpResponseImpl(
        response.ok, response.status, headers, response.ok ? result : null, response.ok ? null : result);
      subjects.forEach(subject => subject.next(config.reduce({ data: httpResponse, state: this.state })));
    };

    return this.handleResponse(config, succeededHandler, errorHandler);
  }


  private handleUploadResonse(
    subjects: Subject<HttpHandlerData>[],
    subject: UploadPromiseType,
    config: HttpConfig) {
    const sub = subject.subscribe(e => {
      if (e.type !== UploadEventType.PROGRESS) {
        sub.unsubscribe();
        const isComplete = e.type !== UploadEventType.COMPLETE;
        const contentType = e.xhr.getResponseHeader('Content-Type') || '';
        const response = config.responseType === ResponseType.JSON
          || contentType.indexOf('application/json') > -1 ? JSON.parse(e.xhr.responseText) : e.xhr.responseText;
        const headers = e.xhr.getAllResponseHeaders();
        const headerArr = headers.split('\n');
        const headerMap = {};
        headerArr.forEach(e => {
          const [key, value] = e.split(':');
          if (key && value) {
            headerMap[key.trim()] = value.trim();
          }
        });
        subjects.forEach(subject => {
          const httpResponse = new HttpResponseImpl(
            e.type === UploadEventType.COMPLETE,
            e.xhr.status,
            headerMap,
            isComplete ? response : null, isComplete ? null : response);
          subject.next(config.reduce({ data: httpResponse, state: this.state }));
        });
      } else {
        subjects.forEach(subject => {
          const httpResponse = new HttpUploadProgressImpl(e.event as ProgressEvent, e.xhr);
          subject.next(config.reduce({ data: httpResponse, state: this.state }));
        });
      }
    });
  }


  private async handleResponse(
    config: HttpConfig,
    succeededHandler: ResponseHandler,
    errorHandler: ResponseHandler) {
    try {
      const res = await (() => {
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
      })();
      if (!res.ok) {
        throw res;
      }

      // For IE|Edge
      if (!res.url) {
        const u = 'ur' + 'l';
        try {
          res[u] = config.url;
        } catch (e) { }
      }


      const resp = this.getResponse(config.responseType, res);
      if (resp && resp.then) {
        const ret = await resp;
        succeededHandler(res, ret);
      }
    } catch (err) {
      if (err && typeof err.json === 'function') {
        const resp = this.getResponse(config.responseType, err);
        if (resp && resp.then) {
          try {
            const e = await resp;
            errorHandler(err, e);
          } catch (e) { errorHandler(err, e); }
        }
      } else {
        errorHandler(err, err);
      }
    }
  }


  private processHeaders(res: Response): { [key: string]: string } {
    const headers = {};
    res.headers.forEach((v, k) => headers[k] = v);

    return headers;
  }


  protected getFetcher(): Fetch {
    return fetch;
  }


  /**
   * Send GET request.
   * @data url Target url.
   * @data data GET parameters.
   * @returns Promise that return response.
   */
  private get({ url, headers = {}, data = null, mode }: HttpConfig): Promise<Response> {
    return this.getFetcher()(data ? `${url}${qs(data)}` : url, {
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
  private post({ url, headers = {}, data = {} as any, json = true, form = false, mode }: HttpConfig): Promise<Response> {
    return this.getFetcher()(url, {
      headers,
      method: 'POST',
      mode: mode || 'same-origin',
      body: json ? JSON.stringify(data) : form ? qs(data) : (data as any)
    });
  }


  /**
   * Send PUT request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  private put({ url, headers = {}, data = {} as any, json = true, form = false, mode }: HttpConfig): Promise<Response> {
    return this.getFetcher()(url, {
      headers,
      method: 'PUT',
      mode: mode || 'same-origin',
      body: json ? JSON.stringify(data) : form ? qs(data) : (data as any)
    });
  }


  /**
   * Send DELETE request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  private delete<T>({ url, headers = {}, data = {} as any, json = true, form = false, mode }: HttpConfig): Promise<Response> {
    const req = {
      headers,
      method: 'DELETE',
      mode: mode || 'same-origin'
    };

    if (isDefined(data)) {
      (req as any).body = json ? JSON.stringify(data) : form ? qs(data) : data;
    }

    return this.getFetcher()(url, req);
  }


  private upload({ method, url, headers = {}, data = {} as any, mode }: HttpConfig): Promise<UploadPromiseType> {
    const xhr = new XMLHttpRequest();
    const subject = new Subject<UploadSubjectType>();
    const events = {};
    const addEvent = (xhr: EventTarget, type: string, fn: Function, dispose: boolean = false) => {
      events[type] = e => {
        if (dispose) {
          for (const key in events) {
            xhr.removeEventListener(key, events[key]);
          }
        }
        fn(e);
      };
      xhr.addEventListener(type, events[type], false);
    };
    if (xhr.upload) {
      addEvent(xhr.upload, 'progress', e => subject.next({ type: UploadEventType.PROGRESS, event: e, xhr }));
    }
    addEvent(xhr, 'error', e => subject.next({ type: UploadEventType.ERROR, event: e, xhr }), true);
    addEvent(xhr, 'abort', e => subject.next({ type: UploadEventType.ABORT, event: e, xhr }), true);
    addEvent(xhr, 'load', e => {
      if (!xhr.upload) {
        subject.next({ type: UploadEventType.PROGRESS, event: { total: 1, loaded: 1 } as any, xhr });
      }
      subject.next({ type: UploadEventType.COMPLETE, event: e, xhr });
    }, true);
    xhr.open(HttpMethod[method], url, true);
    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }
    xhr.send(data);

    return Promise.resolve(subject);
  }


  /**
   * Get proper response from fetch response body.
   * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
   * @param res Http response.
   * @returns 
   */
  private getResponse(responseType: ResponseType, res: Response): Promise<Blob | FormData | string | ArrayBuffer | Object> {
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
      case ResponseType.STREAM:
        return Promise.resolve(res.body);
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
