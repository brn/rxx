/**
 * @fileoverview
 * @author Taketoshi Aono
 */



/**
 * The methods of the Http request.
 */
export enum HttpMethod {
  GET = 1,
  POST,
  PUT,
  DELETE
}


/**
 * Response type of the Http request.
 */
export enum ResponseType {
  JSON = 1,
  BLOB,
  ARRAY_BUFFER,
  FORM_DATA,
  TEXT
}


/**
 * Type for Http request options.
 */
export interface HttpConfig {
  url: string;
  method?: HttpMethod;
  headers?: any;
  mode?: 'cors'|'same-origin'|'no-cors';
  json?: boolean;
  data?: string|Blob|FormData,
   form?: boolean;
  responseType?: ResponseType
  sendToken?: boolean
};



export interface HttpResponse<T, E> {
  ok: boolean;
  headers: {[key: string]: string};
  status: number;
  response: T;
  error: E;
}


export function ____$_react_mvi_module_reference_bug_fix__dummy_$____() {}
