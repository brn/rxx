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
  Advices,
} from '@react-mvi/worker';
import { Observable, Subscription, ConnectableObservable, Subject } from 'rxjs';
import { HttpResponseImpl, HttpUploadProgressImpl } from './http-response';
import { qs } from './qs';
import {
  HttpConfig,
  HttpMethod,
  HttpResponse,
  ResponseType,
  UploadEventType,
  Fetch,
  HttpHandlerData,
} from './types';

const DEFAULT_ERROR_STATUS = 500;

type UploadSubjectType = {
  type: UploadEventType;
  event: Event;
  xhr: XMLHttpRequest;
};

type UploadPromiseType = Subject<UploadSubjectType>;

type ResponseHandler = (res: Response, ret: any) => void;

/**
 * Http request sender.
 */
export class HttpHandler extends StateHandler {
  public static displayName = 'HttpHandler';

  private static _maxHistoryLength = 10;

  public static set maxHistoryLength(length: number) {
    this._maxHistoryLength = length;
  }

  public static get maxHistoryLenght() {
    return this._maxHistoryLength;
  }

  private history: { key: string; args: HttpConfig }[] = [];

  constructor(a?: Advices) {
    super(a, {
      request: ['get', 'post', 'put', 'delete', 'upload', 'patch'],
      response: 'notifyResponse',
      uploading: 'notifyUploading',
    });
  }

  public clone() {
    return new HttpHandler(this.advices);
  }

  /**
   * Wait for request from observables.
   * @override
   * @param request Observable that send request.
   */
  public subscribe(props: {
    http:
      | Observable<
          | { type: string; request: HttpConfig }
          | { type: string; request: HttpConfig }[]
        >
      | {
          [key: string]:
            | Observable<HttpConfig>
            | ConnectableObservable<HttpConfig>;
        };
  }): Subscription {
    const subscription = new Subscription();
    if (props.http) {
      if (props.http instanceof Observable) {
        subscription.add(
          props.http.subscribe(
            args => {
              if (Array.isArray(args)) {
                args.forEach(({ type, request }) => this.push(type, request));
              } else {
                this.push(args.type, args.request);
              }
            },
            error => console.error(error),
          ),
        );
      } else {
        for (const reqKey in props.http) {
          const req = props.http[reqKey];
          subscription.add(
            req.subscribe(
              (config: HttpConfig) => this.push(reqKey, config),
              error => console.error(error),
            ),
          );
        }
        for (const reqKey in props.http) {
          const req = props.http[reqKey];
          if (req instanceof ConnectableObservable && req['connect']) {
            req.connect();
          }
        }
      }
    }

    return subscription;
  }

  /**
   * @inheritDoc
   */
  public async push(key: string, args?: any): Promise<any> {
    if (key === 'RETRY') {
      const history = this.history[
        this.history.length - (typeof args === 'number' ? args + 1 : 1)
      ];
      if (!history) {
        return new Promise((_, r) =>
          r(new Error('Invlaid retry number specified.')),
        );
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
    const subjectsOK = this.store.get(key).concat(this.store.get(`${key}-ok`));
    const subjectsNG = this.store.get(key).concat(this.store.get(`${key}-ng`));
    const subjectsProgress = this.store
      .get(key)
      .concat(this.store.get(`${key}-uploading`));

    const errorHandler = (config, err, result) => {
      const httpResponse = new HttpResponseImpl(
        false,
        err && err.status ? err.status : DEFAULT_ERROR_STATUS,
        {},
        null,
        result,
      );
      const ret = config.reduce(httpResponse, this.state);
      this.notifyResponse(config, `${key}-ng`, httpResponse, ret, subjectsNG);
    };

    const succeededHandler = (config, response, result) => {
      const headers = this.processHeaders(response);
      const httpResponse = new HttpResponseImpl(
        response.ok,
        response.status,
        headers,
        response.ok ? result : null,
        response.ok ? null : result,
      );
      const ret = config.reduce(httpResponse, this.state);
      this.notifyResponse(config, `${key}-ok`, httpResponse, ret, subjectsOK);
    };

    if (!config.reduce) {
      config.reduce = v => v;
    }

    if (config.upload) {
      return this.upload(config, key).then(subject => {
        this.handleUploadResonse(
          subjectsOK,
          subjectsNG,
          subjectsProgress,
          subject,
          config,
          key,
        );
      });
    }

    await this.handleResponse(
      config,
      key,
      (res, ret) => succeededHandler(config, res, ret),
      (e, ret) => errorHandler(config, e, ret),
    );
  }

  private handleUploadResonse(
    subjectsOK: Subject<HttpHandlerData>[],
    subjectsNG: Subject<HttpHandlerData>[],
    subjectsUploading: Subject<HttpHandlerData>[],
    subject: UploadPromiseType,
    config: HttpConfig,
    key: string,
  ) {
    const sub = subject.subscribe(
      e => {
        if (e.type !== UploadEventType.PROGRESS) {
          sub.unsubscribe();
          const isComplete = e.type === UploadEventType.COMPLETE;
          const contentType = e.xhr.getResponseHeader('Content-Type') || '';
          const response =
            config.responseType === ResponseType.JSON ||
            contentType.indexOf('application/json') > -1
              ? JSON.parse(e.xhr.responseText)
              : e.xhr.responseText;
          const headers = e.xhr.getAllResponseHeaders();
          const headerArr = headers.split('\n');
          const headerMap = {};
          headerArr.forEach(e => {
            const [key, value] = e.split(':');
            if (key && value) {
              headerMap[key.trim()] = value.trim();
            }
          });
          const httpResponse = new HttpResponseImpl(
            e.type === UploadEventType.COMPLETE,
            e.xhr.status,
            headerMap,
            isComplete ? response : null,
            isComplete ? null : response,
          );
          const ret = config.reduce!(httpResponse, this.state);
          this.notifyResponse(
            config,
            e.type === UploadEventType.COMPLETE ? `${key}-ok` : `${key}-ng`,
            httpResponse,
            ret,
            isComplete ? subjectsOK : subjectsNG,
          );
        } else {
          const httpResponse = new HttpUploadProgressImpl(
            e.event as ProgressEvent,
            e.xhr,
          );
          this.notifyUploading(
            config,
            `${key}-uploading`,
            httpResponse,
            subjectsUploading,
          );
        }
      },
      error => console.error(error),
    );
  }

  private notifyUploading(
    config: HttpConfig,
    key: string,
    progress: HttpUploadProgressImpl,
    subjects: Subject<any>[],
  ) {
    subjects.forEach(subject =>
      subject.next({ data: progress, state: this.state }),
    );
    this.subject && this.subject.notify({ type: key, payload: progress });
  }

  private notifyResponse(
    config: HttpConfig,
    key: string,
    httpResponse: HttpResponse<any, any>,
    results: any,
    subjects: Subject<any>[],
  ) {
    subjects.forEach(subject =>
      subject.next({ data: results, state: this.state }),
    );
    this.subject && this.subject.notify({ type: key, payload: results });
  }

  private async handleResponse(
    config: HttpConfig,
    key: string,
    succeededHandler: ResponseHandler,
    errorHandler: ResponseHandler,
  ) {
    try {
      const res = await (() => {
        switch (config.method) {
          case HttpMethod.GET:
            return this.get(config, key);
          case HttpMethod.POST:
            return this.post(config, key);
          case HttpMethod.PUT:
            return this.put(config, key);
          case HttpMethod.PATCH:
            return this.patch(config, key);
          case HttpMethod.DELETE:
            return this.delete(config, key);
          default:
            return this.get(config, key);
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
        } catch (e) {}
      }

      const resp = this.getResponse(config, key, config.responseType!, res);
      if (resp && resp.then) {
        const ret = await resp;
        succeededHandler(res, ret);
      }
    } catch (err) {
      if (err && typeof err.json === 'function') {
        const resp = this.getResponse(
          config,
          key,
          this.getResponseTypeFromHeader(err),
          err,
        );
        if (resp && resp.then) {
          try {
            const e = await resp;
            errorHandler(err, e);
          } catch (e) {
            errorHandler(err, e);
          }
        }
      } else {
        errorHandler(err, err);
      }
    }
  }

  private processHeaders(res: Response): { [key: string]: string } {
    const headers = {};
    res.headers.forEach((v, k) => (headers[k] = v));

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
  private get(
    { url, headers = {}, data, mode }: HttpConfig,
    key: string,
  ): Promise<Response> {
    return this.getFetcher()(
      data ? `${url as string}${qs(data)}` : (url as string),
      {
        method: 'GET',
        headers,
        mode: mode || 'same-origin',
      },
    );
  }

  /**
   * Send POST request.
   * @data url Target url.
   * @data data POST body.
   * @returns Promise that return response.
   */
  private post(
    {
      url,
      headers = {},
      data = {} as any,
      json = true,
      form = false,
      mode,
    }: HttpConfig,
    key: string,
  ): Promise<Response> {
    return this.getFetcher()(url as string, {
      headers,
      method: 'POST',
      mode: mode || 'same-origin',
      body: json ? JSON.stringify(data) : form ? qs(data) : (data as any),
    });
  }

  /**
   * Send PUT request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  private put(
    {
      url,
      headers = {},
      data = {} as any,
      json = true,
      form = false,
      mode,
    }: HttpConfig,
    key: string,
  ): Promise<Response> {
    return this.getFetcher()(url as string, {
      headers,
      method: 'PUT',
      mode: mode || 'same-origin',
      body: json ? JSON.stringify(data) : form ? qs(data) : (data as any),
    });
  }

  /**
   * Send PATCH request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  private patch(
    {
      url,
      headers = {},
      data = {} as any,
      json = true,
      form = false,
      mode,
    }: HttpConfig,
    key: string,
  ): Promise<Response> {
    return this.getFetcher()(url as string, {
      headers,
      method: 'PATCH',
      mode: mode || 'same-origin',
      body: json ? JSON.stringify(data) : form ? qs(data) : (data as any),
    });
  }

  /**
   * Send DELETE request.
   * @data url Target url.
   * @data data PUT body.
   * @returns Promise that return response.
   */
  private delete<T>(
    {
      url,
      headers = {},
      data = {} as any,
      json = true,
      form = false,
      mode,
    }: HttpConfig,
    key: string,
  ): Promise<Response> {
    const req = {
      headers,
      method: 'DELETE',
      mode: mode || 'same-origin',
    };

    if (isDefined(data)) {
      (req as any).body = json ? JSON.stringify(data) : form ? qs(data) : data;
    }

    return this.getFetcher()(url as string, req);
  }

  private upload(
    { method, url, headers = {}, data = {} as any, mode }: HttpConfig,
    key: string,
  ): Promise<UploadPromiseType> {
    const xhr = new XMLHttpRequest();
    const subject = new Subject<UploadSubjectType>();
    const events = {};
    const addEvent = (
      xhr: EventTarget,
      type: string,
      fn: Function,
      dispose: boolean = false,
    ) => {
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
      addEvent(xhr.upload, 'progress', e =>
        subject.next({ type: UploadEventType.PROGRESS, event: e, xhr }),
      );
    }
    addEvent(
      xhr,
      'error',
      e => subject.next({ type: UploadEventType.ERROR, event: e, xhr }),
      true,
    );
    addEvent(
      xhr,
      'abort',
      e => subject.next({ type: UploadEventType.ABORT, event: e, xhr }),
      true,
    );
    addEvent(
      xhr,
      'load',
      e => {
        if (!xhr.upload) {
          subject.next({
            type: UploadEventType.PROGRESS,
            event: { total: 1, loaded: 1 } as any,
            xhr,
          });
        }
        subject.next({ type: UploadEventType.COMPLETE, event: e, xhr });
      },
      true,
    );
    xhr.open(HttpMethod[method!], url as string, true);
    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }
    xhr.send(data as any);

    return Promise.resolve(subject);
  }

  /**
   * Get proper response from fetch response body.
   * @param responseType The type of response. ex. ARRAY_BUFFER, BLOB, etc...
   * @param res Http response.
   * @returns
   */
  private getResponse(
    config: HttpConfig,
    key: string,
    responseType: ResponseType,
    res: Response,
  ): Promise<Blob | FormData | string | ArrayBuffer | Object> {
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
        return Promise.resolve(res.body!);
      default:
        return res.text();
    }
  }

  private getResponseTypeFromHeader(res: Response) {
    const mime = res.headers.get('content-type');
    if (!mime || mime.indexOf('text/plain') > -1) {
      return ResponseType.TEXT;
    }
    if (
      mime.indexOf('text/json') > -1 ||
      mime.indexOf('application/json') > -1
    ) {
      return ResponseType.JSON;
    }
    if (
      /^(?:image|audio|video|(?:application\/zip)|(?:application\/octet-stream))/.test(
        mime,
      )
    ) {
      return ResponseType.BLOB;
    }

    return ResponseType.TEXT;
  }
}
