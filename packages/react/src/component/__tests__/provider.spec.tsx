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

import React from 'react';
import { render } from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { Provider, ProviderContextType } from '../provider';
import { connect } from '../../decorators/connect';
import { expect } from 'chai';
import { workerCodes } from './worker';

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
    public render() {
      return (
        <div className="test-el" onClick={this.props.click}>
          {`${this.props.text}-${this.props.test}`}
        </div>
      );
    }
  },
);

const ComponentWithChildren = connect({
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
    public render() {
      return (
        <div>
          <div className="test-el" onClick={this.props.click}>
            {`${this.props.text}-${this.props.test}`}
          </div>
          <div>{this.props.children}</div>
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
    { test: number; test2: number; click(): void; parentState: boolean },
    any
  > {
    public render() {
      return (
        <div>
          <div className="test-el-1" onClick={this.props.click}>
            {this.props.test}-{String(this.props.parentState)}
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
    return { click: intent.callback('test', 1, true) };
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
describe.only('provider.tsx', () => {
  describe('Provider', () => {
    it('should pass intent and store to children.', done => {
      const instance: any = TestUtils.renderIntoDocument(
        <Provider
          initWorker={() =>
            new Worker(URL.createObjectURL(new Blob([workerCodes])))
          }
        >
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
        const TIMEOUT = 200;
        setTimeout(() => {
          expect(el.textContent).to.be.eq('2-2');
          done();
        }, TIMEOUT);
      }, WAIT_TIME_MS);
    });

    it('should pass parent state to children.', done => {
      const instance: any = TestUtils.renderIntoDocument(
        <Provider
          initWorker={() =>
            new Worker(URL.createObjectURL(new Blob([workerCodes])))
          }
        >
          <ComponentWithChildren>
            <Provider
              initWorker={() =>
                new Worker(URL.createObjectURL(new Blob([workerCodes])))
              }
            >
              <Component2 />
            </Provider>
          </ComponentWithChildren>
        </Provider>,
      );
      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        const TIMEOUT = 200;
        setTimeout(() => {
          expect(el.textContent).to.be.eq('2-2');

          (function() {
            const el = TestUtils.findRenderedDOMComponentWithClass(
              instance,
              'test-el-1',
            );
            expect(el.textContent).to.be.eq('1-true');
            TestUtils.Simulate.click(el);
            const TIMEOUT = 200;
            setTimeout(() => {
              expect(el.textContent).to.be.eq('2-true');
              done();
            }, TIMEOUT);
          })();
        }, TIMEOUT);
      }, WAIT_TIME_MS);
    });
  });
});
