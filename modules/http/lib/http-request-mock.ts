/**
 * @fileoverview IOのモッククラス定義
 * @author Taketoshi Aono
 */

import {
  Promise
} from './shims/promise';
import {
  IO,
  IOResponse,
  SubjectStore
} from '@react-mvi/core';
import {
  HttpRequest
} from './http-request';
import {
  RequestInit,
  Response
} from './shims/fetch';


/**
 * Config for HttpRequestMock.
 * If when undefined property was passed, return sended parameter as is.
 */
export type HttpMockArgs = {
  /**
   * Specify get method return value.
   */
  get?: (uri: string, req: RequestInit) => Response;

  /**
   * Specify post method return value.
   */
  post?: (uri: string, req: RequestInit) => Response;

  /**
   * Specify put method return value.
   */
  put?: (uri: string, req: RequestInit) => Response;

  /**
   * Specify delete method return value.
   */
  delete?: (uri: string, req: RequestInit) => Response;
}


/**
 * Mock class for HttpRequest.
 */
export class HttpRequestMock extends HttpRequest {
  private fetchFunction;


  /**
   * @param methods Definitions of each method return value.
   */
  public constructor(private methods: HttpMockArgs) {
    super();
    this.fetchFunction = (url: string, request: RequestInit) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const method = this.methods[(request.method || 'get').toLowerCase()];
          if (typeof method === 'function') {
            const fn = method as (uri: string, req: RequestInit, param?: any) => Response;
            try {
              return resolve(fn(url, request));
            } catch(e) {
              return reject(e);
            }
          }
          resolve(new Response(request.body, {status: 200, statusText: 'OK'}));
        }, 100);
      });
    };
  }


  /**
   * Return whatwgFetch function mock.
   */
  protected get fetch() {
    return this.fetchFunction;
  }
}
