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


import * as React from 'react';
import * as TestUtils from 'react-addons-test-utils';
import * as TestRenderer from 'react-test-renderer';
import {
  connect,
  ConnectArgs,
  CONTEXT_TYPES
} from '../connect';
import {
  expect
} from 'chai';
import {
  extend
} from '../../utils';


class ContextProvider extends React.Component<any, any> {
  public static childContextTypes = CONTEXT_TYPES;

  public render() {
    return this.props.children;
  }

  public getChildContext() {
    return {
      intent: this.props.intent,
      state: this.props.state,
      parent: this.props.parent
    };
  }
}


describe('connect.tsx', () => {
  let init;

  beforeEach(() => {
    init = (opt?: ConnectArgs) => {
      const props = {};
      const context = {};
      const Component = connect(opt)(class TestComponent extends React.Component<any, any> {
        constructor(p, c) {
          super(p, c);
          extend(props, p);
          extend(context, c);
        }

        public render() {
          return <div></div>;
        }
      });

      return {
        props, context, Component
      };
    };
  });

  describe('connect', () => {
    it('should create context aware component.', () => {
      const CONTEXT = { intent: 'ok', state: 'state', parent: 'parent' };
      const { Component, context, props } = init();
      const renderer = TestRenderer.create(<ContextProvider {...CONTEXT}><Component /></ContextProvider>);
      expect(context).to.be.deep.eq({ intent: 'ok', state: 'state', parent: 'parent' });
    });

    it('should convert state to props', () => {
      const { Component, context, props } = init({ mapStateToProps(s) { return { convertedValue: s.value }; } });
      const renderer = TestRenderer.create(<Component value="1" />);
      expect(props).to.be.deep.eq({ convertedValue: '1' });
    });

    it('should convert intent to props', () => {
      const CONTEXT = { intent: 'intent', state: 'state', parent: 'parent' };
      const { Component, context, props } = init({ mapIntentToProps(intent) { return { convertedValue: intent }; } });
      const renderer = TestRenderer.create(<ContextProvider {...CONTEXT}><Component /></ContextProvider>);
      expect(props).to.be.deep.eq({ convertedValue: 'intent' });
    });
  });
});
