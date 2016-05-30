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

/// <reference path="../_references.d.ts"/>


import 'core-js';
import * as React from 'react';
import {
  createModule
} from '../di/abstract-module';
import {
  run
} from '../run';
import {
  Chai
} from '@react-mvi/testing';


describe('run.tsx', () => {
  let disposable: {el: Element, dispose(): void} = {} as any;


  beforeEach(() => {
    const el = document.body.appendChild(document.createElement('div')) as Element;
    disposable = {
      el,
      dispose() {
        el.parentNode.removeChild(el);
      }
    }
  });
  
  describe('run', () => {
    it('create component with context.', () => {
      const service = () => {
        return {
          test1: 'test1'
        }
      }
      const service2 = () => {
        return {
          test2: 'test2'
        }
      }

      class App extends React.Component<any, any> {
        public render() {
          return <div id={this.props.test1}><span id={this.props.test2}></span></div>
        }
      }

      run({component: App, modules: [createModule(config => {
        config.bind('testService').toInstance(service);
        config.bind('test2Service').toInstance(service2);
      })]}, disposable.el);
      Chai.expect(!!disposable.el.querySelector('#test1')).to.be.eq(true);
      Chai.expect(!!disposable.el.querySelector('#test2')).to.be.eq(true);
      disposable.dispose();
    });
  });
});
