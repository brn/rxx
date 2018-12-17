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
import TestUtils from 'react-dom/test-utils';
import TestRenderer from 'react-test-renderer';
import { connect, ConnectArgs, CONTEXT_TYPES } from '../connect';
import { intent } from '../../intent/intent';
import { store } from '../../store/store';
import { expect } from 'chai';
import { extend, omit } from '../../utils';
import { Provisioning } from '../../provisioning';
import * as PropTypes from 'prop-types';

@store
class TestStore {
  private intent!: TestIntent;
  public initialize() {
    return { view: { test: 1 } };
  }
}
@intent
class TestIntent {}

class ContextProvider extends React.Component<any, any> {
  public static childContextTypes = {
    provisioning: PropTypes.any,
    ...CONTEXT_TYPES,
  };

  public render() {
    return this.props.children as React.ReactElement<any>;
  }

  public getChildContext() {
    const p = new Provisioning(
      '',
      {},
      { intent: TestIntent },
      [TestStore],
      undefined,
      {},
    );
    p.prepare();

    return {
      provisioning: p,
      intent: p.getIntentHandler(),
      state: p.getState(),
      parent: {},
    };
  }
}

describe('connect.tsx', () => {
  let init;

  beforeEach(() => {
    init = (opt?: ConnectArgs<any, any, any, any>) => {
      const props = {};
      const Component = connect(opt)(
        class TestComponent extends React.Component<any, any> {
          constructor(p, c) {
            super(p, c);
            extend(props, p);
          }

          public render() {
            return <div />;
          }
        },
      );

      return {
        props,
        Component,
      };
    };
  });

  describe('connect', () => {
    it('should create context aware component.', () => {
      const { Component, props } = init();
      const renderer = TestRenderer.create(
        <ContextProvider>
          <Component />
        </ContextProvider>,
      );
      expect(props).to.be.deep.eq({ test: 1 });
    });

    it('should convert state to props', () => {
      const { Component, props } = init({
        mapStateToProps(state) {
          return { convertedProps: state.test };
        },
      });
      const renderer = TestRenderer.create(
        <ContextProvider>
          <Component />
        </ContextProvider>,
      );
      expect(props).to.be.deep.eq({ convertedProps: 1 });
    });

    it('should convert intent to props', () => {
      const { Component, props } = init({
        mapIntentToProps(intent, state) {
          return { convertedIntent: state.test };
        },
        mapStateToProps(state) {
          return { convertedProps: state.test };
        },
      });
      const renderer = TestRenderer.create(
        <ContextProvider>
          <Component />
        </ContextProvider>,
      );
      expect(props).to.be.deep.eq({ convertedProps: 1, convertedIntent: 1 });
    });
  });
});
