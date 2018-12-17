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
import { connect, ConnectArgs } from '../connect';
import { expect } from 'chai';
import { extend, omit } from '../../utils';
import PropTypes from 'prop-types';
import { Context } from '../../component/provider';

const intent = () => {};
intent.callback = () => {};

class ContextProvider extends React.Component<any, any> {
  public render() {
    return (
      <Context.Provider
        value={{
          state: { test: 1 },
          intent: intent as any,
          parent: null as any,
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

const TIMEOUT = 200;

describe('connect.tsx', () => {
  let init;

  beforeEach(() => {
    init = (opt?: ConnectArgs<any, any, any, any>) => {
      const props = {};
      const Component = connect(opt)(
        class TestComponent extends React.Component<any, any> {
          constructor(p) {
            super(p);
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
    it('should create context aware component.', done => {
      const { Component, props } = init();
      const renderer = TestRenderer.create(
        <ContextProvider>
          <Component />
        </ContextProvider>,
      );
      setTimeout(() => {
        expect(props).to.be.deep.eq({ test: 1 });
        done();
      }, TIMEOUT);
    });

    it('should convert state to props', done => {
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
      setTimeout(() => {
        expect(props).to.be.deep.eq({ convertedProps: 1 });
        done();
      }, TIMEOUT);
    });

    it('should convert intent to props', done => {
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
      setTimeout(() => {
        expect(props).to.be.deep.eq({ convertedProps: 1, convertedIntent: 1 });
        done();
      }, TIMEOUT);
    });
  });
});
