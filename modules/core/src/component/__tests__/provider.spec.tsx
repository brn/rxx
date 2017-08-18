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
  Observable
} from 'rxjs/Rx';
import * as React from 'react';
import {
  render
} from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import {
  Subject
} from 'rxjs/Rx';
import {
  Provider,
  ProviderContextType
} from '../provider';
import {
  HandlerResponse
} from '../../handler/handler';
import {
  connect
} from '../../decorators/connect';
import {
  intent
} from '../../intent/intent';
import {
  Tags as T
} from '../tags';
import {
  Store,
  store
} from '../../store/store';
import {
  expect
} from 'chai';


@intent
class Intent {
  private intent: HandlerResponse;

  public test(): Observable<{}> {
    return this.intent.for<{}, {}>('test').share();
  }
}


@store
class TestStore implements Store<{ view: { test: Observable<number> } }> {
  private intent: Intent;

  public initialize() {
    return {
      view: {
        test: this.intent.test().scan((acc: number, next: any) => acc + 1, 1).share().startWith(1)
      }
    };
  }
}


@store
class TestStore2 implements Store<{ view: { test2: Observable<number> } }> {
  private intent: Intent;

  public initialize() {
    return {
      view: {
        test2: this.intent.test().scan((acc: number, next: any, index) => index, 1).share().startWith(0)
      }
    };
  }
}


@store
class TestStore3 implements Store<{ view: { test: Observable<number> } }> {
  private intent: Intent;

  private foo: number;

  public initialize() {
    return {
      view: {
        test: this.intent.test().scan((acc: number, next: any) => acc + 1, this.foo).share().startWith(this.foo)
      }
    };
  }
}


const Component = connect({
  mapStateToProps(getState, props) {
    return { text: props.test };
  },
  mapIntentToProps(intent, getState, props) {
    return { click: intent.callback('test'), getState };
  }
})(class Component extends React.Component<{ text: Observable<number>; getState(): { view: { [key: string]: any } }; click(): void }, any> {
  public context: ProviderContextType<TestStore>;

  public render() {
    return (
      <T.Div className="test-el" onClick={this.props.click}>{this.props.text.map(v => `${v}-${this.props.getState().view.test}`)}</T.Div>
    );
  }
});

const Component2 = connect({
  mapIntentToProps(intent) {
    return { click: intent.callback('test') };
  }
})(class Component extends React.Component<{ test: Observable<number>; test2: Observable<number>; click(): void }, any> {
  public context: ProviderContextType<TestStore>;

  public render() {
    return (
      <div>
        <T.Div className="test-el-1" onClick={this.props.click}>{this.props.test}</T.Div>
        <T.Div className="test-el-2" onClick={this.context.intent.callback('test')}>{this.props.test2}</T.Div>
      </div>
    );
  }
});

describe('provider.tsx', () => {
  const WAIT_TIME_MS = 200;
  describe('Provider', () => {
    it('should pass intent and store to children.', done => {
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={TestStore} intent={Intent}>
          <Component />
        </Provider>
      );
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(instance, 'test-el');
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        done();
      }, WAIT_TIME_MS);
    });

    it('should pass intent and store group to children.', done => {
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={[TestStore, TestStore2]} intent={Intent}>
          <Component2 />
        </Provider>
      );
      setTimeout(() => {
        const el1 = TestUtils.findRenderedDOMComponentWithClass(instance, 'test-el-1');
        expect(el1.textContent).to.be.eq('1');
        TestUtils.Simulate.click(el1);
        expect(el1.textContent).to.be.eq('2');
        const el2 = TestUtils.findRenderedDOMComponentWithClass(instance, 'test-el-2');
        expect(el2.textContent).to.be.eq('0');
        TestUtils.Simulate.click(el2);
        expect(el2.textContent).to.be.eq('1');
        done();
      }, WAIT_TIME_MS);
    });


    it('should pass intent and store to children if rerendered.', done => {
      class X extends React.Component<any, any> { public render() { return null; } }
      class C extends React.Component<any, any> {
        public state = { showComponent: true };
        public render() {
          return (
            <div className="root">
              <span className="button" onClick={e => this.handleClick()} />
              {
                this.state.showComponent ?
                  <Provider store={TestStore} intent={Intent}>
                    <Component />
                  </Provider> : <X />
              }
            </div>
          );
        }
        private handleClick() {
          this.setState({ showComponent: !this.state.showComponent });
        }
      }

      const instance: any = TestUtils.renderIntoDocument(<C />);
      setTimeout(() => {
        const div = TestUtils.findRenderedDOMComponentWithClass(instance, 'root');
        const button = div.querySelector('.button');
        TestUtils.Simulate.click(button);
        TestUtils.Simulate.click(button);

        const el = TestUtils.findRenderedDOMComponentWithClass(instance, 'test-el');
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        done();
      }, WAIT_TIME_MS);
    });


    it('should pass services', done => {
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={TestStore3} intent={Intent} service={{ foo: 10 }}>
          <Component />
        </Provider>
      );
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(instance, 'test-el');
        expect(el.textContent).to.be.eq('10-10');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('11-11');
        done();
      }, WAIT_TIME_MS);
    });
  });
});
