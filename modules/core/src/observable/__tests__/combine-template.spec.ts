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


import {
  expect
} from 'chai';
import {
  Subscription,
  Subject
} from 'rxjs/Rx';
import {
  combineTemplate
} from '../combine-template';


class Dummy { }


function createObject(aValue, bValue) {
  return {
    aValue,
    bWrapper: {
      bValue
    },
    cWrapper: {
      cValue: 'ordinal-value',
      dWrapper: {
        eWrapper: {
          eValue: new Dummy()
        }
      }
    }
  };
}


describe('combineTemplate', () => {
  let subscription: Subscription;

  beforeEach(() => {
    subscription = new Subscription();
  });

  afterEach(() => subscription.unsubscribe());

  it('should convert observable obeject to ordinal object', done => {
    const aValue = new Subject();
    const bValue = new Subject();
    const BUFFER_COUNT = 4;

    const values = createObject(aValue.startWith(''), bValue.startWith(''));

    subscription.add(combineTemplate(values).do(v => v.persist()).bufferCount(BUFFER_COUNT).subscribe(v => {
      /*tslint:disable:no-magic-numbers*/
      expect(v[0]).to.be.deep.eq(createObject('', ''));
      expect(v[1]).to.be.deep.eq(createObject('200', ''));
      expect(v[2]).to.be.deep.eq(createObject('200', '300'));
      expect(v[3]).to.be.deep.eq(createObject('OK', '300'));
      /*tslint:enable:no-magic-numbers*/
      done();
    }));

    aValue.next('200');
    bValue.next('300');
    aValue.next('OK');
  });


  it('should share state object', done => {
    const aValue = new Subject();
    const bValue = new Subject();
    const BUFFER_COUNT = 4;

    const values = createObject(aValue.startWith(''), bValue.startWith(''));

    subscription.add(combineTemplate(values).bufferCount(BUFFER_COUNT).subscribe(v => {
      /*tslint:disable:no-magic-numbers*/
      expect(v[0]).to.be.deep.eq(createObject('OK', '300'));
      expect(v[3]).to.be.deep.eq(createObject('OK', '300'));
      expect(v[3]).to.be.deep.eq(createObject('OK', '300'));
      expect(v[3]).to.be.deep.eq(createObject('OK', '300'));
      /*tslint:enable:no-magic-numbers*/
      done();
    }));

    aValue.next('200');
    bValue.next('300');
    aValue.next('OK');
  });


  it('should has default value.', done => {
    const aValue = new Subject();
    const bValue = new Subject();

    const values = createObject(aValue, bValue);

    subscription.add(combineTemplate(values).subscribe(v => {
      expect(v).to.be.deep.eq(createObject(null, null));
      done();
    }));
  });


  it('should return base object if observable is not contained.', done => {
    const ORDINAL = { test: 1, test2: { test: 1 } };
    subscription.add(combineTemplate(ORDINAL).subscribe(v => {
      expect(v).to.be.deep.eq(ORDINAL);
      done();
    }));
  });
});
