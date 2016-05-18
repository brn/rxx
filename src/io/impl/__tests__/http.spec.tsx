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

/// <reference path="../../../_references.d.ts" />

import {Promise}    from 'es6-promise';
import {
  expect
}                   from 'chai';
import * as Sinon   from 'sinon';
import {
  Subject
}                   from 'rx';
import * as _       from 'lodash';
import {
  HttpRquest,
  HttpMethod,
  HttpConfig,
  ResponseType
}                   from '../http';
import {
  Filter
}                   from '../../../filters/filter';
import {
  graceful
}                   from '../../../testing/async-utils';


describe('HttpRequest', () => {
  let initMultipartResponse;
  let initFormResponse;
  let initPostResponse;
  let initPostErrorResponse;
  let initGetResponse;
  let initGetErrorResponse;

  class SuccessFilter implements Filter {
    public filter({err, res}: {err: any, res: any}) {
      return err? {err: {result: err}, res: null}: {res: {result: res}, err: null};
    }
  }

  class ErrorFilter implements Filter {
    public filter(res: {err: any, res: any}) {
      return false;
    }
  }

  const parseRequest = (req: string) => {
    const ret = {};
    _.forEach(req.split('&'), v => {
      const splited = v.split('=');
      const v1 = splited[0];
      const v2 = splited[1];
      ret[v1] = v2 === 'false'? false: v2 === 'true'? true: v2;
    });
    return ret;
  }

  let fetchCache = window.fetch;
  const server = {respond() {queue.forEach(({resolve, res}) => resolve(res))}};
  const queue: {resolve(res: Response):void, res: Response}[] = []
  beforeEach(() => {
    initPostResponse = () => {
      window['fetch'] = (url, opt): Promise<Response> => {
        return new Promise(resolve => {
          const body = opt.body;
          const res = new window['Response'](body, {
            status: 200,
            headers: {
              'Content-type': 'application/json'
            }
          });
          queue.push({resolve, res});
        });
      }
    };

    initPostErrorResponse = () => {
      window['fetch'] = (url, opt): Promise<Response> => {
        return new Promise((_, reject) => queue.push({resolve: reject, res: new window['Response'](opt.body, {
          status: 400,
          headers: {
            'Content-type': 'application/json'
          }
        })}));
      };
    };

    initFormResponse = () => {
      window['fetch'] = (url, opt): Promise<Response> => {
        return new Promise(resolve => queue.push({resolve, res: new window['Response'](opt.body, {
          status: 200,
          headers: {
            'Content-type': 'application/json'
          }
        })}));
      };
    };
    
    initGetResponse = (params?: string) => {
      window['fetch'] = (url, opt): Promise<Response> => {
        return new Promise(resolve => queue.push({resolve, res: new window['Response']('{"success": true}', {
          status: 200,
          headers: {
            'Content-type': 'application/json'
          }
        })}));
      };
    };
    
    initGetErrorResponse = () => {
      window['fetch'] = (url, opt): Promise<Response> => {
        return new Promise((_, reject) => queue.push({resolve: reject, res: new window['Response']('{"success": false}', {
          status: 400,
          headers: {
            'Content-type': 'application/json'
          }
        })}));
      };
    };
  });

  let httpRequest: HttpRquest = null;

  afterEach(() => {
    window['fetch'] = fetchCache;
    queue.length = 0;
    httpRequest && httpRequest.end();
    httpRequest = null;
  });

  const waitRequest = (opt, inst) => {
    const subject = new Subject();
    inst.wait(subject);
    subject.onNext(opt);
  };
  
  const init = (filters: Filter[]) => {
    const ret = httpRequest = new HttpRquest(filters);
    return ret;
  };
  
  describe('HttpRequest#get()', () => {
    it('getリクエストを送信する(200)', done => {
      initGetResponse();
      const request = init([]);
      request.response.for('test').subscribe(graceful(v => {
        expect(v).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('getリクエストを送信する(200,パラメータ付き)', done => {
      initGetResponse('test=1');
      const request = init([]);      
      request.response.for('test').subscribe(graceful(res => {
        expect(res).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {test: 1}, key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('getリクエストを送信する(400)', done => {
      initGetErrorResponse();
      const request = init([]);
      request.response.for('test').subscribe(() => {}, graceful(res => {
        expect(res).to.be.deep.equal({success: false});
      }, done));
      waitRequest({url: '/test/ng', key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
    });
    
    it('filterをかける(200)', done => {
      initGetResponse();
      const request = init([new SuccessFilter()]);
      request.response.for('test').subscribe(graceful(res => {
        expect(res).to.be.deep.equal({result: {success: true}});
      }, done));
      waitRequest({url: '/test/ok', key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('filterをかける(400)', done => {
      initGetErrorResponse();
      const request = init([new SuccessFilter()]);
      request.response.for('test').subscribe(() => {}, graceful(res => {
        expect(res).to.be.deep.equal({result: {success: false}});
      }, done));
      waitRequest({url: '/test/ng', key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('filterで処理をとめる(200)', () => {
      let called = false;
      initGetResponse();
      const request = init([new ErrorFilter()]);
      request.response.for('test').subscribe(res => {called = true});
      waitRequest({url: '/test/ok', key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
      expect(called).to.be.false;
    });

    it('filterで処理をとめる(400)', () => {
      let called = false;
      initGetErrorResponse();
      const request = init([new ErrorFilter()]);
      request.response.for('test').subscribe(() => {}, res => {called = true});
      waitRequest({url: '/test/ng', key: 'test', responseType: ResponseType.JSON}, request);
      server.respond();
      expect(called).to.be.false;
    });
  });

  describe('HttpRequest#post()', () => {
    it('postリクエストを送信する(200)', done => {
      initPostResponse();
      const request = init([]);
      request.response.for('test-post').subscribe(graceful(res => {
        expect(res).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {success: true}, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
    });


    it('postリクエストを送信する(200, form)', done => {
      initFormResponse();
      const request = init([]);
      request.response.for('test-post').subscribe(graceful(res => {
        expect(res).to.be.deep.equal({success: true});
      }, done));
      waitRequest({url: '/test/ok', data: {success: true}, form: true, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('postリクエストを送信する(400)', done => {
      initPostErrorResponse();
      const request = init([]);
      request.response.for('test-post').subscribe(() => {}, graceful(res => {
        expect(res).to.be.deep.equal({success: false});
      }, done));
      waitRequest({url: '/test/ng', data: {success: false}, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('filterをかける(200)', done => {
      initPostResponse();
      const request = init([new SuccessFilter()]);
      request.response.for('test-post').subscribe(graceful(res => {
        expect(res).to.be.deep.equal({result: {success: true}});
      }, done));
      waitRequest({url: '/test/ok', data: {success: true}, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('filterをかける(400)', done => {
      initPostErrorResponse();
      const request = init([new SuccessFilter()]);
      request.response.for('test-post').subscribe(() => {}, graceful(res => {
        expect(res).to.be.deep.equal({result: {success: false}});
      }, done));
      waitRequest({url: '/test/ng', data: {success: false}, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
    });

    it('filterで処理をとめる(200)', () => {
      let called = false;
      initPostResponse();
      const request = init([new ErrorFilter()]);
      request.response.for('test-post').subscribe(res => {called = true});
      waitRequest({url: '/test/ok', data: {success: true}, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
      expect(called).to.be.false;
    });

    it('filterで処理をとめる(400)', () => {
      let called = false;
      initPostErrorResponse();
      const request = init([new ErrorFilter()]);
      request.response.for('test-post').subscribe(() => {}, res => {called = true});
      waitRequest({url: '/test/ng', data: {success: true}, method: HttpMethod.POST, key: 'test-post', responseType: ResponseType.JSON}, request);
      server.respond();
      expect(called).to.be.false;
    });
  });
});
