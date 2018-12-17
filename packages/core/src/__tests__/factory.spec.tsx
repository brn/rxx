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

import { Observable, Subject } from 'rxjs';
import React from 'react';
import { render } from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import {
  Provider,
  ProviderContextType,
  directConnect,
} from '../component/provider';
import { HandlerResponse } from '../handler/handler';
import { connect } from '../decorators/connect';
import { intent } from '../intent/intent';
import { Store, store } from '../store/store';
import { expect } from 'chai';
import { SubjectPayload } from '../subject';
import { scan, share, startWith, map, filter } from 'rxjs/operators';
import { makeApp, makeView } from '../factory';
import { reducer } from '../reducer';

@intent
class Intent {
  private intent!: HandlerResponse;

  public test(): Observable<{}> {
    return this.intent.for<{}, {}>('test').pipe(share());
  }
}

@store
class TestStore implements Store<{ view: { test: Observable<number> } }> {
  private intent!: Intent;

  private subject!: Observable<
    SubjectPayload<'subject-test', number, { test2: number }>
  >;

  public initialize() {
    return {
      view: {
        base: this.intent.test().pipe(
          scan((acc, next: any) => acc + 1, 1),
          share(),
          startWith(1),
        ),
        test: this.intent.test().pipe(
          scan((acc, next: any) => acc + 1, 1),
          share(),
          startWith(1),
        ),
        test2: this.subject.pipe(
          map(({ type, payload, states }) => {
            switch (type) {
              case 'subject-test':
                return payload + states.test2;
              default:
                return payload;
            }
          }),
          startWith(1),
        ),
      },
    };
  }
}

function testStore(
  observable: Observable<SubjectPayload<'test', number, { test2: number }>>,
  initialState: number,
) {
  return {
    view: observable.pipe(
      scan(
        (
          acc: number,
          args: SubjectPayload<'test', number, { test2: number }>,
        ) => {
          switch (args.type) {
            case 'test':
              return acc + 1;
            default:
              return acc;
          }
        },
        initialState,
      ),
      startWith(initialState),
    ),
  };
}

@store
class TestStore2 implements Store<{ view: { test2: Observable<number> } }> {
  private intent!: Intent;

  public initialize() {
    return {
      view: {
        test2: this.intent.test().pipe(
          scan((acc, next: any, index) => index, 1),
          share(),
          startWith(0),
        ),
      },
    };
  }
}

@store
class TestStore3 implements Store<{ view: { test: Observable<number> } }> {
  private intent!: Intent;

  private foo!: number;

  public initialize() {
    return {
      view: {
        test: this.intent.test().pipe(
          scan((acc, next: any) => acc + 1, this.foo),
          share(),
          startWith(this.foo),
        ),
      },
    };
  }
}

@intent
class Intent4 {
  private intent!: HandlerResponse;

  public test(): Observable<{}> {
    return this.intent.for<{}, {}>('on-click').pipe(share());
  }
}

@store
class TestStore4 implements Store<{ view: { test3: Observable<number> } }> {
  private intent!: Intent4;

  private foo!: number;

  public initialize() {
    return {
      view: {
        test3: this.intent.test().pipe(
          map(({ state }: any) => state.view.base + 1),
          startWith(0),
        ),
      },
    };
  }
}

const Component = connect({
  mapStateToProps(state, props) {
    return { ...state, text: state.test };
  },
  mapIntentToProps(intent, state, props) {
    return { click: intent.callback('test') };
  },
})(
  class Component extends React.Component<
    {
      test: number;
      text: string;
      click(): void;
    },
    any
  > {
    public context!: ProviderContextType<TestStore>;

    public render() {
      return (
        <div className="test-el" onClick={this.props.click}>
          {`${this.props.text}-${this.props.test}`}
        </div>
      );
    }
  },
);

const Component2 = connect({
  mapIntentToProps(intent) {
    return { click: intent.callback('test') };
  },
  mapStateToProps(state) {
    return state;
  },
})(
  class Component extends React.Component<
    { test: number; test2: number; click(): void },
    any
  > {
    public context!: ProviderContextType<TestStore>;

    public render() {
      return (
        <div>
          <div className="test-el-1" onClick={this.props.click}>
            {this.props.test}
          </div>
          <div
            className="test-el-2"
            onClick={this.context.intent.callback('test')}
          >
            {this.props.test2}
          </div>
        </div>
      );
    }
  },
);

const SubjectTestComponent = connect({
  mapStateToProps(state, props) {
    return { ...state, text: state.test2 };
  },
  mapIntentToProps(intent, state, props) {
    return { click: intent.callback('subject-test', 1, true) };
  },
})(
  class Component extends React.Component<
    {
      test2: number;
      text: string;
      click(): void;
    },
    any
  > {
    public context!: ProviderContextType<TestStore>;
    public render() {
      return (
        <div className="test-el" onClick={this.props.click}>
          {`${this.props.text}-${this.props.test2}`}
        </div>
      );
    }
  },
);

const WAIT_TIME_MS = 200;
describe('factory.tsx', () => {
  describe('makeView/makeApp', () => {
    it('should pass intent and store to children.', done => {
      const view = makeView(
        Component,
        C => TestUtils.renderIntoDocument(<C />) as React.Component<any>,
      );
      const app = makeApp({});
      const instance = view(app({}), {
        store: TestStore,
        intent: Intent,
      });

      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        done();
      }, WAIT_TIME_MS);
    });

    it('should pass intent and store group to children.', done => {
      const view = makeView(
        <Component2 />,
        C => TestUtils.renderIntoDocument(<C />) as React.Component<any>,
      );
      const app = makeApp({});
      const instance = view(app({}), {
        store: [TestStore, TestStore2],
        intent: Intent,
      });
      setTimeout(() => {
        const el1 = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el-1',
        );
        expect(el1.textContent).to.be.eq('1');
        TestUtils.Simulate.click(el1);
        expect(el1.textContent).to.be.eq('2');
        const el2 = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el-2',
        );
        expect(el2.textContent).to.be.eq('0');
        TestUtils.Simulate.click(el2);
        expect(el2.textContent).to.be.eq('1');
        done();
      }, WAIT_TIME_MS);
    });

    it('should pass intent and store to children if rerendered.', done => {
      const view = makeView(<Component />);
      const app = makeApp({});
      const Rendered = view(app({}), {
        store: TestStore,
        intent: Intent,
      });

      class X extends React.Component<any, any> {
        public render() {
          return null;
        }
      }
      class C extends React.Component<any, any> {
        public state = { showComponent: true };
        public render() {
          return (
            <div className="root">
              <span className="button" onClick={e => this.handleClick()} />
              {this.state.showComponent ? <Rendered /> : <X />}
            </div>
          );
        }
        private handleClick() {
          this.setState({ showComponent: !this.state.showComponent });
        }
      }

      const instance: any = TestUtils.renderIntoDocument(<C />);
      setTimeout(() => {
        const div = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'root',
        );
        const button = div.querySelector('.button');
        TestUtils.Simulate.click(button!);
        TestUtils.Simulate.click(button!);

        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        done();
      }, WAIT_TIME_MS);
    });

    it('should pass services', done => {
      const view = makeView(
        <Component />,
        C => TestUtils.renderIntoDocument(<C />) as React.Component,
      );
      const app = makeApp({});
      const instance = view(app({}), {
        store: TestStore3,
        intent: Intent,
        service: { foo: 10 },
      });
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('10-10');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('11-11');
        done();
      }, WAIT_TIME_MS);
    });

    it('should pass grand parent state', () => {
      const GParent = class extends React.Component<any> {
        private static Component = class extends React.Component<any> {
          public render() {
            return <div>{this.props.children}</div>;
          }
        };
        private Component: any;
        constructor(p) {
          super(p);
          const view = makeView(() => (
            <GParent.Component>{this.props.children}</GParent.Component>
          ));
          const app = makeApp({});

          this.Component = view(app({}), {
            store: TestStore,
            intent: Intent,
          });
        }

        public render() {
          return <this.Component />;
        }
      };

      const Parent = class extends React.Component<any> {
        private static Component = class extends React.Component<any> {
          public render() {
            return <div>{this.props.children}</div>;
          }
        };
        private Component: any;
        constructor(p) {
          super(p);
          const view = makeView(() => (
            <Parent.Component>{this.props.children}</Parent.Component>
          ));
          const app = makeApp({});

          this.Component = view(app({}), {
            store: TestStore2,
            intent: Intent,
          });
        }

        public render() {
          return <this.Component />;
        }
      };

      const Component = class extends React.Component<any> {
        private static Component = connect({
          mapIntentToProps(intent) {
            return {
              onClick: intent.callback('on-click'),
            };
          },
          mapStateToProps(state: { test3: number }) {
            return { test3: state.test3 };
          },
        })(
          class extends React.Component<{
            test3: number;
            onClick(e?: any): void;
          }> {
            public render() {
              return (
                <span className="test-el" onClick={this.props.onClick}>
                  {this.props.test3}
                </span>
              );
            }
          },
        );

        private Component: any;
        constructor(p) {
          super(p);
          const view = makeView(() => <Component.Component />);
          const app = makeApp({});

          this.Component = view(app({}), {
            store: TestStore4,
            intent: Intent4,
          });
        }

        public render() {
          return <this.Component />;
        }
      };

      const instance = TestUtils.renderIntoDocument(
        <GParent>
          <Parent>
            <Component />
          </Parent>
        </GParent>,
      );
      const el = TestUtils.findRenderedDOMComponentWithClass(
        instance as any,
        'test-el',
      );
      TestUtils.Simulate.click(el);
      expect(el.textContent).to.be.eq('2');
    });

    it('pass through payload from subject', done => {
      const app = makeApp({});
      const view = makeView(
        <SubjectTestComponent />,
        C => TestUtils.renderIntoDocument(<C />) as React.Component<any>,
      );
      const instance = view(app({}), {
        store: TestStore,
        intent: Intent,
      });
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        done();
      }, WAIT_TIME_MS);
    });

    it('should accept state factories', done => {
      const app = makeApp({ test: testStore });
      const view = makeView(
        <Component />,
        C => TestUtils.renderIntoDocument(<C />) as React.Component<any>,
      );

      const instance = view(app({ test: 1 }));
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        done();
      }, WAIT_TIME_MS);
    });

    it('should create observable', done => {
      const Component = connect({
        mapIntentToProps(intent) {
          return {
            onClick: intent.callback('test'),
          };
        },
        mapStateToProps(state) {
          return {
            text: state.text,
          };
        },
      })(
        class Component extends React.Component<{
          onClick(): void;
          text: string;
        }> {
          public render() {
            return (
              <div className="foo" onClick={this.props.onClick}>
                {this.props.text}
              </div>
            );
          }
        },
      );

      function stream(source: Observable<any>, initial) {
        return {
          view: reducer(
            source,
            (state, payload) => {
              if (payload.type === 'test') {
                return (state += '-clicked');
              }
            },
            initial,
          ),
        };
      }

      const app = makeApp({ text: stream });
      const view = makeView(
        Component,
        C => TestUtils.renderIntoDocument(<C />) as React.Component<any>,
      );

      const instance = view(app({ text: 'test' }));

      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(instance, 'foo');
        expect(el.textContent).to.be.eq('test');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('test-clicked');
        done();
      }, WAIT_TIME_MS);
    });
  });
});
