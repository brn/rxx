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

/// <reference path="../_references.d.ts" />
/// <reference path="../declarations.d.ts" />

import {
  Sinon,
  graceful
}                   from '@react-mvi/testing';
import {
  IO_MARK,
  Injector,
  createModule,
  MethodInvocation,
  MethodProxy
}                   from '@react-mvi/core';
import {
  HttpRequest,
  HttpMethod,
  HttpConfig,
  ResponseType,
  HTTP_INTERCEPT,
  HTTP_REQUEST_INTERCEPT
}                   from '../http-request';
import {
  HttpResponse
}                   from '../http-response';
import {
  expect
}                   from 'chai';
import {
  Subject
}                   from 'rxjs/Rx';
import {
  Promise
}                   from '../shims/promise';
import {
  Response
}                   from '../shims/fetch';


describe('HttpRequest', () => {
  let initMultipartResponse;
  let initFormResponse;
  let initPostResponse;
  let initPostErrorResponse;
  let initGetResponse;
  let initGetErrorResponse;

  const parseRequest = (req: string) => {
    const ret = {};
    req.split('&').forEach(v => {
      const splited = v.split('=');
      const v1 = splited[0];
      const v2 = splited[1];
      ret[v1] = v2 === 'false'? false: v2 === 'true'? true: v2;
    });
    return ret;
  }

  const server = {respond() {queue.forEach(({resolve, res}) => resolve(res))}};
  const queue: {resolve(res: Response):void, res: Response}[] = []
  beforeEach(() => {
    initPostResponse = (proceed: boolean) => {
      const injector = new Injector([createModule(config => {
        config.bind('http').to(HttpRequest);
        config.bindInterceptor(HTTP_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            if (proceed) {
              return methodInvocation.proceed();
            }
          }
        });
        config.bindInterceptor(HTTP_REQUEST_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            const [{url, data}] = methodInvocation.getArguments();
            return new Promise(resolve => {
              const res = new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                  'Content-type': 'application/json'
                }
              });
              queue.push({resolve, res});
            });
          }
        });
      })]);
      return injector;
    };

    initPostErrorResponse = (proceed: boolean) => {
      const injector = new Injector([createModule(config => {
        config.bind('http').to(HttpRequest);
        config.bindInterceptor(HTTP_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            if (proceed) {
              return methodInvocation.proceed();
            }
          }
        });
        config.bindInterceptor(HTTP_REQUEST_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            const [{url, data}] = methodInvocation.getArguments();
            return new Promise((_, reject) => queue.push({resolve: reject, res: new Response(JSON.stringify(data), {
              status: 400,
              headers: {
                'Content-type': 'application/json'
              }
            })}));
          }
        });
      })]);
      return injector
    };

    initFormResponse = (proceed: boolean) => {
      const injector = new Injector([createModule(config => {
        config.bind('http').to(HttpRequest);
        config.bindInterceptor(HTTP_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            if (proceed) {
              return methodInvocation.proceed();
            }
          }
        });
        config.bindInterceptor(HTTP_REQUEST_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            const [{url, data}] = methodInvocation.getArguments();
            return new Promise(resolve => queue.push({resolve, res: new Response(JSON.stringify(data), {
              status: 200,
              headers: {
                'Content-type': 'application/json'
              }
            })}));
          }
        });
      })]);
      return injector;
    };
    
    initGetResponse = (proceed: boolean, params?: string) => {
      const injector = new Injector([createModule(config => {
        config.bind('http').to(HttpRequest);
        config.bindInterceptor(HTTP_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            if (proceed) {
              return methodInvocation.proceed();
            }
          }
        });
        config.bindInterceptor(HTTP_REQUEST_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            const [{url, data}] = methodInvocation.getArguments();
            return new Promise(resolve => queue.push({resolve, res: new Response('{"success": true}', {
              status: 200,
              headers: {
                'Content-type': 'application/json'
              }
            })}));
          }
        });
      })]);
      return injector;
    };
    
    initGetErrorResponse = (proceed: boolean) => {
      const injector = new Injector([createModule(config => {
        config.bind('http').to(HttpRequest);
        config.bindInterceptor(HTTP_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            if (proceed) {
              return methodInvocation.proceed();
            }
          }
        });
        config.bindInterceptor(HTTP_REQUEST_INTERCEPT).to(class implements MethodProxy {
          invoke(methodInvocation: MethodInvocation) {
            const [{url, data}] = methodInvocation.getArguments();
            return new Promise((_, reject) => queue.push({resolve: reject, res: new Response('{"success": false}', {
              status: 400,
              headers: {
                'Content-type': 'application/json'
              }
            })}));
          }
        });
      })]);
      return injector;
    };
  });

  afterEach(() => {
    queue.length = 0;
  });


  const waitRequest = (opt, inst, key) => {
    const subject = new Subject();
    inst.subscribe({http: {[key]: subject}});
    subject.next(opt);
  };

  
  describe('HttpRequest#get()', () => {
    it('Send get request(200)', done => {
      const injector = initGetResponse(true);
      const request: HttpRequest = injector.get('http');
      request.response.for('test').subscribe(graceful((v: HttpResponse<{success: boolean}, void>) => {
        expect(v.ok).to.be.eq(true);
        expect(v.status).to.be.eq(200);
        expect(v.response).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', responseType: ResponseType.JSON}, request, 'test');
      server.respond();
    });

    it('Send get request(200, with parameter)', done => {
      const injector = initGetResponse(true, 'test=1');
      const request = injector.get('http');
      request.response.for('test').subscribe(graceful((v: HttpResponse<{success: boolean}, void>) => {
        expect(v.ok).to.be.eq(true);
        expect(v.status).to.be.eq(200);
        expect(v.response).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {test: 1}, responseType: ResponseType.JSON}, request, 'test');
      server.respond();
    });

    it('Send get request (400)', done => {
      const injector = initGetErrorResponse(true);
      const request = injector.get('http');
      request.response.for('test').subscribe(graceful((res: HttpResponse<void, {success: boolean}>) => {
        expect(res.ok).to.be.eq(false);
        expect(res.status).to.be.eq(400);
        expect(res.error).to.be.deep.equal({success: false});
      }, done));
      waitRequest({url: '/test/ng', responseType: ResponseType.JSON}, request, 'test');
      server.respond();
    });
    
    it('Apply interceptor (200)', done => {
      const injector = initGetResponse(true);
      const request = injector.get('http');
      request.response.for('test').subscribe(graceful((res: HttpResponse<{success: boolean}, void>) => {
        expect(res.ok).to.be.eq(true);
        expect(res.status).to.be.eq(200);
        expect(res.response).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', responseType: ResponseType.JSON}, request, 'test');
      server.respond();
    });

    it('Apply interceptor (400)', done => {
      const injector = initGetErrorResponse(true);
      const request = injector.get('http');
      request.response.for('test').subscribe(graceful((res: HttpResponse<void, {success: boolean}>) => {
        expect(res.ok).to.be.eq(false);
        expect(res.status).to.be.eq(400);
        expect(res.error).to.be.deep.equal({success: false});
      }, done));
      waitRequest({url: '/test/ng', responseType: ResponseType.JSON}, request, 'test');
      server.respond();
    });

    it('Apply interceptor and stop process (200)', () => {
      let called = false;
      const injector = initGetResponse(false);
      const request = injector.get('http');
      request.response.for('test').subscribe(res => {called = true});
      waitRequest({url: '/test/ok', responseType: ResponseType.JSON}, request, 'test');
      server.respond();
      expect(called).to.be.false;
    });

    it('Apply interceptor and stop process (400)', () => {
      let called = false;
      const injector = initGetErrorResponse(false);
      const request = injector.get('http');
      request.response.for('test').subscribe(res => {called = true});
      waitRequest({url: '/test/ng', responseType: ResponseType.JSON}, request, 'test');
      server.respond();
      expect(called).to.be.false;
    });
  });

  describe('HttpRequest#post()', () => {
    it('Send post request.(200)', done => {
      const injector = initPostResponse(true);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(graceful((res: HttpResponse<{success: boolean}, void>) => {
        expect(res.ok).to.be.eq(true);
        expect(res.status).to.be.eq(200);
        expect(res.response).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {success: true}, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
    });


    it('Send post request.(200, form)', done => {
      const injector = initFormResponse(true);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(graceful((res: HttpResponse<{success: boolean}, void>) => {
        expect(res.ok).to.be.eq(true);
        expect(res.status).to.be.eq(200);
        expect(res.response).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {success: true}, form: true, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
    });

    it('Send post request.(400)', done => {
      const injector = initPostErrorResponse(true);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(graceful((res: HttpResponse<void, {success: boolean}>) => {
        expect(res.ok).to.be.eq(false);
        expect(res.status).to.be.eq(400);
        expect(res.error).to.be.deep.equal({success: false});
      }, done));
      waitRequest({url: '/test/ng', data: {success: false}, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
    });

    it('Apply interceptor.(200)', done => {
      const injector = initPostResponse(true);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(graceful((res: HttpResponse<{success: boolean}, void>) => {
        expect(res.ok).to.be.eq(true);
        expect(res.status).to.be.eq(200);
        expect(res.response).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {success: true}, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
    });

    it('Apply interceptor.(400)', done => {
      const injector = initPostErrorResponse(true);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(graceful((res: HttpResponse<void, {success: boolean}>) => {
        expect(res.ok).to.be.eq(false);
        expect(res.status).to.be.eq(400);
        expect(res.error).to.be.deep.equal({success: false});
      }, done));
      waitRequest({url: '/test/ng', data: {success: false}, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
    });

    it('Apply interceptor and stop process.(200)', () => {
      let called = false;
      const injector = initPostResponse(false);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(res => {called = true});
      waitRequest({url: '/test/ok', data: {success: true}, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
      expect(called).to.be.false;
    });

    it('Apply interceptor and stop process.(400)', () => {
      let called = false;
      const injector = initPostErrorResponse(false);
      const request = injector.get('http');
      request.response.for('test-post').subscribe(res => {called = true});
      waitRequest({url: '/test/ng', data: {success: true}, method: HttpMethod.POST, responseType: ResponseType.JSON}, request, 'test-post');
      server.respond();
      expect(called).to.be.false;
    });
  });
});
