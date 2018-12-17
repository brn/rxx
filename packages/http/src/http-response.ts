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

import { ResponseObjectType, HttpResponse, HttpUploadProgress } from './types';

export class HttpResponseImpl<T, E> implements HttpResponse<T, E> {
  public type = ResponseObjectType.RESPONSE;

  constructor(
    private _ok: boolean,
    private _status: number,
    private _headers: { [key: string]: string },
    private _response: T,
    private _error: E | null = null,
  ) {}

  public get ok() {
    return this._ok;
  }

  public get headers() {
    return this._headers;
  }

  public get status() {
    return this._status;
  }

  public get response() {
    return this._response;
  }

  public get error() {
    return this._error;
  }
}

export class HttpUploadProgressImpl implements HttpUploadProgress {
  public type = ResponseObjectType.UPLOAD_PROGRESS;

  public constructor(
    private event: ProgressEvent,
    private xhr: XMLHttpRequest,
  ) {}

  public get percent() {
    return this.event.loaded / this.event.total;
  }

  public get total() {
    return this.event.total;
  }

  public get loaded() {
    return this.event.loaded;
  }

  public cancel() {
    this.xhr.abort();
  }
}
