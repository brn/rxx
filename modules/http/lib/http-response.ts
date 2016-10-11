// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import {
  HttpResponse,
  HttpUploadProgress
} from './types';


export class HttpResponseImpl<T, E> implements HttpResponse<T, E> {
  constructor(
    private _ok: boolean,
    private _status: number,
    private _headers: {[key: string]: string},
    private _response: T,
    private _error: E = null) {}


  public get ok() {return this._ok;}


  public get headers() {return this._headers;}


  public get status() {return this._status;}


  public get response() {return this._response;}


  public get error() {return this._error;}
}



export class HttpUploadProgressImpl implements HttpUploadProgress {
  public constructor(private event: ProgressEvent, private xhr: XMLHttpRequest) {}


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
