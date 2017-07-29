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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono
 */


import 'core-js';
import {
  Observable
} from 'rxjs/Rx';
import * as React from 'react';
import {
  render
} from 'react-dom';
import {
  Subject
} from 'rxjs/Rx';
import {
  Subscriber
} from '../subscriber';
import {
  Tags as T
} from '../tags';
import {
  expect
} from 'chai';

const WAIT_TIME_MS = 100;

describe('combinator.tsx', () => {
  describe('Subscriber', () => {
    it('Subscribe all observable', done => {
      const className1 = new Subject();
      const className2 = new Subject();
      const text = new Subject();
      const div = document.body.appendChild(document.createElement('div')) as HTMLDivElement;
      const el = render(
        <Subscriber>
          <div className={className1 as any}>
            <div className="hoge">
              <span className={className2 as any}>{text}</span>
            </div>
          </div>
        </Subscriber>,
        div);
      className1.next('className1');
      className2.next('className2');
      text.next('test-text');
      setTimeout(() => {
        expect(!!div.querySelector('.className1')).to.be.eq(true);
        expect(!!div.querySelector('.className2')).to.be.eq(true);
        expect(div.querySelector('.className2').textContent).to.be.eq('test-text');
        div.parentNode.removeChild(div);
        done();
      }, WAIT_TIME_MS);
    });


    it('Subscribe only root tree.', done => {
      const className1 = new Subject();
      const className2 = new Subject();
      const div = document.body.appendChild(document.createElement('div')) as HTMLDivElement;

      const el = render(
        <Subscriber ignoreSubtree={true}>
          <div className={className1 as any}>
            <div className="hoge">
              <span id="test-el" className={className2 as any}></span>
            </div>
          </div>
        </Subscriber>,
        div);

      className1.next('className1');
      className2.next('className2');

      setTimeout(() => {
        expect(!!div.querySelector('.className1')).to.be.eq(true);
        expect(!div.querySelector('.className2')).to.be.eq(true);
        expect(div.querySelector('#test-el').className).to.be.eq('[object Object]');
        div.parentNode.removeChild(div);
        done();
      }, WAIT_TIME_MS);
    });
  });

  describe('Tags', () => {
    it('Subscribe all observable', done => {
      const className1 = new Subject<string>();
      const className2 = new Subject<string>();
      const text = new Subject();
      const div = document.body.appendChild(document.createElement('div')) as HTMLDivElement;
      const Test = () => {
        return (
          <T.Div className={className1}>
            <div className="hoge">
              <T.Span className={className2}>{text}</T.Span>
              <T.Span className={'className3'}>{'test-text'}</T.Span>
            </div>
          </T.Div>
        );
      };

      const el = render(<Test />, div);
      className1.next('className1');
      className2.next('className2');
      text.next('test-text');

      setTimeout(() => {
        expect(!!div.querySelector('.className1')).to.be.eq(true);
        expect(!!div.querySelector('.className2')).to.be.eq(true);
        expect(!!div.querySelector('.className3')).to.be.eq(true);
        expect(div.querySelector('.className2').textContent).to.be.eq('test-text');
        expect(div.querySelector('.className3').textContent).to.be.eq('test-text');
        div.parentNode.removeChild(div);
        done();
      }, WAIT_TIME_MS);
    });

    it('Subscribe all observable', done => {
      const className1 = new Subject<string>();
      const className2 = new Subject<string>();
      const text = new Subject();
      const pub1 = className1.startWith('').publish();
      const pub2 = className2.startWith('').publish();
      const pub3 = text.startWith('').publish();
      const div = document.body.appendChild(document.createElement('div')) as HTMLDivElement;
      class Span extends React.Component<any, any> {
        public render() {
          return <T.Span ref="bar" className={this.props.pub2}>{this.props.text}</T.Span>;
        }
      }
      class Test extends React.Component<any, any> {
        public render() {
          return (
            <T.Div className={pub1} ref="foo">
              <div className="hoge">
                <Span ref="bar" pub2={pub2} text={pub3} />
              </div>
            </T.Div>
          );
        }


        public componentDidMount() {
          pub1.connect();
          pub2.connect();
          pub3.connect();
          className1.next('className1');
          className2.next('className2');
          text.next('test-text');
        }
      }

      render(<Test />, div);
      setTimeout(() => {
        expect(!!div.querySelector('.className1')).to.be.eq(true);
        expect(!!div.querySelector('.className2')).to.be.eq(true);
        expect(div.querySelector('.className2').textContent).to.be.eq('test-text');
        div.parentNode.removeChild(div);
        done();
      }, WAIT_TIME_MS);
    });


    it('If direct child is Observable, listen that.', done => {
      const div = document.body.appendChild(document.createElement('div')) as HTMLDivElement;
      const ob = Observable.of(1);
      class Test extends React.Component<any, any> {
        public render() {
          return (
            <Subscriber>
              {ob.map(v => <span className={`test-${v}`} />)}
            </Subscriber>
          );
        }
      }

      render(<Test />, div);
      setTimeout(() => {
        expect(!!div.querySelector('.test-1')).to.be.eq(true);
        div.parentNode.removeChild(div);
        done();
      }, WAIT_TIME_MS);
    });
  });
});
