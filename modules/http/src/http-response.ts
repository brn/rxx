// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import {
  HttpResponse
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
