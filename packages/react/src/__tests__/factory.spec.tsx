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
import { Provider, ProviderContextType } from '../component/provider';
import { connect } from '../decorators/connect';
import { expect } from 'chai';
import { scan, share, startWith, map, filter } from 'rxjs/operators';
import { makeView } from '../factory';
import { workerCodes } from '../component/__tests__/worker';

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
  describe('makeView', () => {
    it('should create updatable component with worker.', done => {
      const view = makeView(
        Component,
        C => TestUtils.renderIntoDocument(<C />) as React.Component<any>,
      );
      const instance = view(
        () => new Worker(URL.createObjectURL(new Blob([workerCodes]))),
      );

      setTimeout(() => {
        const el = TestUtils.findRenderedDOMComponentWithClass(
          instance,
          'test-el',
        );
        expect(el.textContent).to.be.eq('1-1');
        TestUtils.Simulate.click(el);
        setTimeout(() => {
          expect(el.textContent).to.be.eq('2-2');
          done();
        }, WAIT_TIME_MS);
      }, WAIT_TIME_MS);
    });

    it('should pass intent and store to children if rerendered.', done => {
      const view = makeView(<Component />);
      const Rendered = view(
        () => new Worker(URL.createObjectURL(new Blob([workerCodes]))),
      );

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
      }, WAIT_TIME_MS);
    });
  });
});
