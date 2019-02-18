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
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

import { graceful } from '@hyper/testing';
import { MethodInvocation } from '@hyper/core';
import { HttpHandler } from '../http-handler';
import { HttpMethod, HttpConfig, ResponseType, HttpResponse } from '../types';
import { HttpResponseImpl } from '../http-response';
import { expect } from 'chai';
import { Subject } from 'rxjs';

describe('HttpHandler', () => {
  let initFormResponse: (proceed: boolean) => HttpHandler;
  let initPostResponse: (proceed: boolean) => HttpHandler;
  let initPostErrorResponse: (proceed: boolean) => HttpHandler;
  let initGetResponse: (proceed: boolean, params?: string) => HttpHandler;
  let initGetErrorResponse: (proceed: boolean) => HttpHandler;

  const STATUS = { OK: 200, BAD_REQUEST: 400 };

  const parseRequest = (req: string) => {
    const ret = {};
    req.split('&').forEach(v => {
      const splited = v.split('=');
      const v1 = splited[0];
      const v2 = splited[1];
      ret[v1] = v2 === 'false' ? false : v2 === 'true' ? true : v2;
    });

    return ret;
  };

  const server = {
    async respond() {
      if (queue.length === 0) {
        return new Promise(resolve => {
          setTimeout(async () => {
            await server.respond();
            resolve();
          }, 10);
        });
      }
      const ret = queue.slice();
      queue.length = 0;
      return new Promise(resolve => {
        setTimeout(() => {
          ret.forEach(({ resolve, res }) => resolve(res));
          resolve();
        }, 500);
      });
    },
  };
  const queue: { resolve(res: Response): void; res: Response }[] = [];
  beforeEach(() => {
    initPostResponse = (proceed: boolean) => {
      return new HttpHandler({
        response(methodInvocation: MethodInvocation) {
          if (proceed) {
            return methodInvocation.proceed();
          }
        },
        request(methodInvocation: MethodInvocation) {
          const [{ url, data }] = methodInvocation.getArguments();

          return new Promise(resolve => {
            const res = new Response(JSON.stringify(data), {
              status: STATUS.OK,
              headers: {
                'Content-type': 'application/json',
              },
            });
            queue.push({ resolve, res });
          });
        },
      });
    };

    initPostErrorResponse = (proceed: boolean) => {
      return new HttpHandler({
        response(methodInvocation: MethodInvocation) {
          if (proceed) {
            return methodInvocation.proceed();
          }
        },
        request(methodInvocation: MethodInvocation) {
          const [{ url, data }] = methodInvocation.getArguments();

          return new Promise((_, reject) =>
            queue.push({
              resolve: reject,
              res: new Response(JSON.stringify(data), {
                status: STATUS.BAD_REQUEST,
                headers: {
                  'Content-type': 'application/json',
                },
              }),
            }),
          );
        },
      });
    };

    initFormResponse = (proceed: boolean) => {
      return new HttpHandler({
        response(methodInvocation: MethodInvocation) {
          if (proceed) {
            return methodInvocation.proceed();
          }
        },
        request(methodInvocation: MethodInvocation) {
          const [{ url, data }] = methodInvocation.getArguments();

          return new Promise(resolve =>
            queue.push({
              resolve,
              res: new Response(JSON.stringify(data), {
                status: STATUS.OK,
                headers: {
                  'Content-type': 'application/json',
                },
              }),
            }),
          );
        },
      });
    };

    initGetResponse = (proceed: boolean, params?: string) => {
      return new HttpHandler({
        response(methodInvocation: MethodInvocation) {
          if (proceed) {
            return methodInvocation.proceed();
          }
        },
        request(methodInvocation: MethodInvocation) {
          const [{ url, data }] = methodInvocation.getArguments();
          return new Promise(resolve =>
            queue.push({
              resolve,
              res: new Response('{"success": true}', {
                status: STATUS.OK,
                headers: {
                  'Content-type': 'application/json',
                },
              }),
            }),
          );
        },
      });
    };

    initGetErrorResponse = (proceed: boolean) => {
      return new HttpHandler({
        response(methodInvocation: MethodInvocation) {
          if (proceed) {
            return methodInvocation.proceed();
          }
        },
        request(methodInvocation: MethodInvocation) {
          const [{ url, data }] = methodInvocation.getArguments();

          return new Promise((_, reject) =>
            queue.push({
              resolve: reject,
              res: new Response('{"success": false}', {
                status: STATUS.BAD_REQUEST,
                headers: {
                  'Content-type': 'application/json',
                },
              }),
            }),
          );
        },
      });
    };
  });

  afterEach(() => {
    queue.length = 0;
  });

  const waitRequest = (opt, inst, key) => {
    const subject = new Subject();
    inst.subscribe({ http: { [key]: subject } });
    subject.next(opt);
  };

  describe('HttpHandler#get()', () => {
    it('Send get request(200)', done => {
      const handler = initGetResponse(true);
      handler.response.for('test').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<{ success: boolean }, void> }) => {
            expect(data.ok).to.be.eq(true);
            expect(data.status).to.be.eq(STATUS.OK);
            expect(data.response).to.be.deep.equal({ success: true });
          },
          done,
        ),
      );
      waitRequest(
        { url: '/test/ok', responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
    });

    it('Send get request(200, with parameter)', done => {
      const handler = initGetResponse(true, 'test=1');
      handler.response.for('test').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<{ success: boolean }, void> }) => {
            expect(data.ok).to.be.eq(true);
            expect(data.status).to.be.eq(STATUS.OK);
            expect(data.response).to.be.deep.equal({ success: true });
          },
          done,
        ),
      );
      waitRequest(
        { url: '/test/ok', data: { test: 1 }, responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
    });

    it('Send get request (400)', done => {
      const handler = initGetErrorResponse(true);
      handler.response.for('test').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<void, { success: boolean }> }) => {
            expect(data.ok).to.be.eq(false);
            expect(data.status).to.be.eq(STATUS.BAD_REQUEST);
            expect(data.error).to.be.deep.equal({ success: false });
          },
          done,
        ),
      );
      waitRequest(
        { url: '/test/ng', responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
    });

    it('Apply interceptor (200)', done => {
      const handler = initGetResponse(true);
      handler.response.for('test').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<{ success: boolean }, void> }) => {
            expect(data.ok).to.be.eq(true);
            expect(data.status).to.be.eq(STATUS.OK);
            expect(data.response).to.be.deep.equal({ success: true });
          },
          done,
        ),
      );
      waitRequest(
        { url: '/test/ok', responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
    });

    it('Apply interceptor (400)', done => {
      const handler = initGetErrorResponse(true);
      handler.response.for('test').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<void, { success: boolean }> }) => {
            expect(data.ok).to.be.eq(false);
            expect(data.status).to.be.eq(STATUS.BAD_REQUEST);
            expect(data.error).to.be.deep.equal({ success: false });
          },
          done,
        ),
      );
      waitRequest(
        { url: '/test/ng', responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
    });

    it('Apply interceptor and stop process (200)', () => {
      let called = false;
      const handler = initGetResponse(false);
      handler.response.for('test').subscribe(res => {
        called = true;
      });
      waitRequest(
        { url: '/test/ok', responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
      expect(called).to.be.eq(false);
    });

    it('Apply interceptor and stop process (400)', () => {
      let called = false;
      const handler = initGetErrorResponse(false);
      handler.response.for('test').subscribe(res => {
        called = true;
      });
      waitRequest(
        { url: '/test/ng', responseType: ResponseType.JSON },
        handler,
        'test',
      );
      server.respond();
      expect(called).to.be.eq(false);
    });
  });

  describe('HttpHandler#post()', () => {
    it('Send post request.(200)', done => {
      const handler = initPostResponse(true);
      handler.response.for('test-post').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<{ success: boolean }, void> }) => {
            expect(data.ok).to.be.eq(true);
            expect(data.status).to.be.eq(STATUS.OK);
            expect(data.response).to.be.deep.equal({ success: true });
          },
          done,
        ),
      );
      waitRequest(
        {
          url: '/test/ok',
          data: { success: true },
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
    });

    it('Send post request.(200, form)', done => {
      const handler = initFormResponse(true);
      handler.response.for('test-post').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<{ success: boolean }, void> }) => {
            expect(data.ok).to.be.eq(true);
            expect(data.status).to.be.eq(STATUS.OK);
            expect(data.response).to.be.deep.equal({ success: true });
          },
          done,
        ),
      );
      waitRequest(
        {
          url: '/test/ok',
          data: { success: true },
          form: true,
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
    });

    it('Send post request.(400)', done => {
      const handler = initPostErrorResponse(true);
      handler.response.for('test-post').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<void, { success: boolean }> }) => {
            expect(data.ok).to.be.eq(false);
            expect(data.status).to.be.eq(STATUS.BAD_REQUEST);
            expect(data.error).to.be.deep.equal({ success: false });
          },
          done,
        ),
      );
      waitRequest(
        {
          url: '/test/ng',
          data: { success: false },
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
    });

    it('Apply interceptor.(200)', done => {
      const handler = initPostResponse(true);
      handler.response.for('test-post').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<{ success: boolean }, void> }) => {
            expect(data.ok).to.be.eq(true);
            expect(data.status).to.be.eq(STATUS.OK);
            expect(data.response).to.be.deep.equal({ success: true });
          },
          done,
        ),
      );
      waitRequest(
        {
          url: '/test/ok',
          data: { success: true },
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
    });

    it('Apply interceptor.(400)', done => {
      const handler = initPostErrorResponse(true);
      handler.response.for('test-post').subscribe(
        graceful(
          ({ data }: { data: HttpResponse<void, { success: boolean }> }) => {
            expect(data.ok).to.be.eq(false);
            expect(data.status).to.be.eq(STATUS.BAD_REQUEST);
            expect(data.error).to.be.deep.equal({ success: false });
          },
          done,
        ),
      );
      waitRequest(
        {
          url: '/test/ng',
          data: { success: false },
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
    });

    it('Apply interceptor and stop process.(200)', () => {
      let called = false;
      const handler = initPostResponse(false);
      handler.response.for('test-post').subscribe(res => {
        called = true;
      });
      waitRequest(
        {
          url: '/test/ok',
          data: { success: true },
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
      expect(called).to.be.eq(false);
    });

    it('Apply interceptor and stop process.(400)', () => {
      let called = false;
      const handler = initPostErrorResponse(false);
      handler.response.for('test-post').subscribe(res => {
        called = true;
      });
      waitRequest(
        {
          url: '/test/ng',
          data: { success: true },
          method: HttpMethod.POST,
          responseType: ResponseType.JSON,
        },
        handler,
        'test-post',
      );
      server.respond();
      expect(called).to.be.eq(false);
    });
  });
});
