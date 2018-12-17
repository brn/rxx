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
import * as React from 'react';
import { render } from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import { Provider, ProviderContextType, directConnect } from '../provider';
import { HandlerResponse, Handler } from '../../handler/handler';
import { connect } from '../../decorators/connect';
import { intent } from '../../intent/intent';
import { Store, store } from '../../store/store';
import { expect } from 'chai';
import { SubjectPayload } from '../../subject';
import { scan, share, startWith, map, filter, tap } from 'rxjs/operators';
import { makeApp } from '../../factory';
import { StateHandler } from '../../handler/state-handler';

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
          scan((acc: any, next) => acc + 1, 1),
          share(),
          startWith(1),
        ),
        test: this.intent.test().pipe(
          scan((acc: any, next) => acc + 1, 1),
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
describe('provider.tsx', () => {
  describe('Provider', () => {
    it('should pass intent and store to children.', done => {
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={TestStore} intent={Intent}>
          <Component />
        </Provider>,
      );
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
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={[TestStore, TestStore2]} intent={Intent}>
          <Component2 />
        </Provider>,
      );
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
              {this.state.showComponent ? (
                <Provider store={TestStore} intent={Intent}>
                  <Component />
                </Provider>
              ) : (
                <X />
              )}
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
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={TestStore3} intent={Intent} service={{ foo: 10 }}>
          <Component />
        </Provider>,
      );
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
        public render() {
          return (
            <Provider store={TestStore} intent={Intent}>
              <GParent.Component>{this.props.children}</GParent.Component>
            </Provider>
          );
        }
      };

      const Parent = class extends React.Component<any> {
        private static Component = class extends React.Component<any> {
          public render() {
            return <div>{this.props.children}</div>;
          }
        };
        public render() {
          return (
            <Provider store={TestStore2} intent={Intent}>
              <Parent.Component>{this.props.children}</Parent.Component>
            </Provider>
          );
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

        public render() {
          return (
            <Provider store={TestStore4} intent={Intent4}>
              <Component.Component />
            </Provider>
          );
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
      const instance: any = TestUtils.renderIntoDocument(
        <Provider store={TestStore} intent={Intent}>
          <SubjectTestComponent />
        </Provider>,
      );
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
      const instance: any = TestUtils.renderIntoDocument(
        <Provider app={makeApp({ test: testStore })({ test: 1 })}>
          <Component />
        </Provider>,
      );
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
  });

  describe('directConnect', () => {
    it('should convert container component to component which can receive state by props.', done => {
      const ConnectedComponent = directConnect(Component);
      class Renderer extends React.Component<any, { test: number }> {
        constructor(p) {
          super(p);
          this.state = { test: 1 };
        }

        public render() {
          return (
            <ConnectedComponent
              state={this.state}
              handlers={[
                {
                  test: ({ dispatch }) => {
                    this.setState({ test: this.state.test + 1 }, () =>
                      dispatch('test2'),
                    );
                  },
                  test2: () => {
                    this.setState({ test: this.state.test + 1 });
                  },
                },
              ]}
            />
          );
        }
      }

      const instance: any = TestUtils.renderIntoDocument(<Renderer />);
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        const TIME = 300;
        setTimeout(() => {
          expect(el.textContent).to.be.eq('3-3');
          done();
        }, TIME);
      }, WAIT_TIME_MS);
    });

    it('should convert container component to component which can receive state by props(subject).', done => {
      const ConnectedComponent = directConnect(Component);
      class Renderer extends React.Component<any, { test: number }> {
        constructor(p) {
          super(p);
          this.state = { test: 1 };
        }

        public render() {
          return (
            <ConnectedComponent
              app={makeApp({
                test: (observable, initialState) => {
                  return {
                    view: observable.pipe(
                      filter(args => args.type === 'test'),
                      scan((acc, next) => acc + 1, initialState),
                      startWith(initialState),
                    ),
                  };
                },
              })(this.state)}
            />
          );
        }
      }

      const instance: any = TestUtils.renderIntoDocument(<Renderer />);
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

    it('should receive StateHandler.', done => {
      const ConnectedComponent = directConnect(Component);
      let pushed = false;
      class TestHandler extends StateHandler {
        public subscribe(props: { test: Observable<any> }) {
          return props.test.subscribe(v => this.push('', ''));
        }
        public push(key: string, args: any) {
          pushed = true;
          return Promise.resolve();
        }
        public clone(...args: any[]): Handler {
          return new TestHandler();
        }
      }
      class Renderer extends React.Component<any, { test: number }> {
        constructor(p) {
          super(p);
          this.state = { test: 1 };
        }

        public render() {
          return (
            <ConnectedComponent
              stateHandlers={{
                test: new TestHandler(),
              }}
              app={makeApp({
                test: (observable, initialState) => {
                  return {
                    view: observable.pipe(
                      filter(args => args.type === 'test'),
                      scan((acc, next) => acc + 1, initialState),
                      startWith(initialState),
                    ),
                    test: observable,
                  };
                },
              })(this.state)}
            />
          );
        }
      }

      const instance: any = TestUtils.renderIntoDocument(<Renderer />);
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        expect(el.textContent).to.be.eq('2-2');
        expect(pushed).to.be.true;
        done();
      }, WAIT_TIME_MS);
    });
  });
});
