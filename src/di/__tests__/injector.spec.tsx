/**
 * @fileoverview
 * @author Taketshi Aono
 * @requires lib/camp/camp.js
 */// -*- mode: typescript -*-
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

/// <reference path="../../_references.d.ts" />


import {
  expect
}               from 'chai';
import Symbol   from 'es6-symbol';
import Injector from '../injector';
import {
  MethodProxy,
  MethodInvocation
}               from '../method-proxy';
import {
  AbstractModule
}               from '../abstract-module';
import {
  inject
}               from '../inject';
import {
  intercept
}               from '../intercept';



class Test1 {
  @inject()
  public targetA1;

  @inject()
  public targetA2;

  @inject()
  public targetA3;

  @inject()
  public targetA4;
}


describe('Injector', () => {
  describe('#inject', () => {
    it('依存性か解決されたインスタンスを生成する', () => {
      class Target1 {}
      class Target2 {}
      class Target3 {}
      class Target4 {}


      class TestModule extends AbstractModule {
        public configure(): void {
          this.bind('targetA1').to(Target1);
          this.bind('targetA2').to(Target2);
          this.bind('targetA3').to(Target3);
          this.bind('targetA4').to(Target4);
        }
      }

      const injector = new Injector([new TestModule]);
      const result   = injector.inject(Test1);

      expect(result.targetA1).instanceof(Target1);
      expect(result.targetA2).instanceof(Target2);
      expect(result.targetA3).instanceof(Target3);
      expect(result.targetA4).instanceof(Target4);
    });


    it('入れ子になった依存性を全て解決した状態のインスタンスを生成する', () => {
      class Binded {
        @inject()
        public targetB1;

        @inject()
        public targetB2;

        @inject()
        public targetB3;
      }

      class Binded2 {
        @inject()
        public targetC1;

        @inject()
        public targetC2;

        @inject()
        public targetC3;
      }

      class Binded3 {
        @inject()
        public targetD1;

        @inject()
        public targetD2;

        @inject()
        public targetD3;
      }


      class Binded4 {
        @inject()
        public targetE1;

        @inject()
        public targetE2;

        @inject()
        public targetE3;
      }

      class TestModule extends AbstractModule {
        public configure() {
          this.bind('targetA1').to(Binded);
          this.bind('targetA2').to(Binded2);
          this.bind('targetA3').to(Binded3);
          this.bind('targetA4').to(Binded4);

          this.bind('targetB1').toInstance(1);
          this.bind('targetB2').toInstance(2);
          this.bind('targetB3').toInstance(3);

          this.bind('targetC1').toInstance(4);
          this.bind('targetC2').toInstance(5);
          this.bind('targetC3').toInstance(6);

          this.bind('targetD1').toInstance(7);
          this.bind('targetD2').toInstance(8);
          this.bind('targetD3').toInstance(9);

          this.bind('targetE1').toInstance(10);
          this.bind('targetE2').toInstance(11);
          this.bind('targetE3').toInstance(12);
        }
      }

      const injector = new Injector([new TestModule()]);

      const result = injector.inject(Test1);
      expect(result.targetA1).instanceof(Binded);
      expect(result.targetA2).instanceof(Binded2);
      expect(result.targetA3).instanceof(Binded3);
      expect(result.targetA4).instanceof(Binded4);

      expect(result.targetA1.targetB1).equal(1);
      expect(result.targetA1.targetB2).equal(2);
      expect(result.targetA1.targetB3).equal(3);

      expect(result.targetA2.targetC1).equal(4);
      expect(result.targetA2.targetC2).equal(5);
      expect(result.targetA2.targetC3).equal(6);

      expect(result.targetA3.targetD1).equal(7);
      expect(result.targetA3.targetD2).equal(8);
      expect(result.targetA3.targetD3).equal(9);

      expect(result.targetA4.targetE1).equal(10);
      expect(result.targetA4.targetE2).equal(11);
      expect(result.targetA4.targetE3).equal(12);
    });

    it('singletonのバインディングは一度しか生成しない', () => {
      let targetId = 0;

      class Target {
        constructor() {
          targetId++;
        }
      }

      class Test {
        @inject()
        public target;
      }

      class TestModule extends AbstractModule {
        public configure() {
          this.bind('target').to(Target).asSingleton();
        }
      }

      const injector = new Injector([new TestModule()]);

      let instance = injector.inject(Test);
      instance = injector.inject(Test);
      instance = injector.inject(Test);
      instance = injector.inject(Test);

      expect(targetId).equal(1);
    });

    it('インターセプタを適用する', () => {
      const testInterceptor = Symbol('__test__');

      class TestClass {
        @intercept(testInterceptor)
        public test() {
          return 1;
        }
      }

      class TestProxy implements MethodProxy {
        public invoke(methodInvocation: MethodInvocation) {
          return methodInvocation.proceed() + 1;
        }
      }
      
      class TestModule extends AbstractModule {
        public configure() {
          this.bindInterceptor(testInterceptor).to(TestProxy);
        }
      }

      const injector = new Injector([new TestModule()]);
      const inst     = injector.inject(TestClass);
      expect(inst.test()).eq(2);
    });

    it('入れ子の依存にインターセプタを適用する', () => {
      const testInterceptor = Symbol('__test__');


      class ParentClass {
        @inject()
        private childClass;

        public test() {
          return this.childClass.test();
        }
      }

      class ChildClass {
        @intercept(testInterceptor)
        public test() {
          return 1;
        }
      }

      class TestProxy implements MethodProxy {
        public invoke(methodInvocation: MethodInvocation) {
          return methodInvocation.proceed() + 1;
        }
      }
      
      class TestModule extends AbstractModule {
        public configure() {
          this.bindInterceptor(testInterceptor).to(TestProxy);
          this.bind('childClass').to(ChildClass);
        }
      }

      const injector = new Injector([new TestModule()]);
      const inst     = injector.inject(ParentClass);
      expect(inst.test()).eq(2);
    })
  });
});
