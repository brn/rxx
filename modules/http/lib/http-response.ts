// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */


export class HttpResponse<T, E> {
  constructor(
    private _ok: boolean,
    private _status: number,
    private _response: T,
    private _error: E = null) {}


  public get ok() {return this._ok;}


  public get status() {return this._status;}


  public get response() {return this._response;}


  public get error() {return this._error;}
}
