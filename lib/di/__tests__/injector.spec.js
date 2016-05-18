/**
 * @fileoverview
 * @author Taketshi Aono
 * @requires lib/camp/camp.js
 */ // -*- mode: typescript -*-
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
System.register(['chai', 'es6-symbol', '../injector', '../abstract-module', '../inject', '../intercept'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var chai_1, es6_symbol_1, injector_1, abstract_module_1, inject_1, intercept_1;
    var Test1;
    return {
        setters:[
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (es6_symbol_1_1) {
                es6_symbol_1 = es6_symbol_1_1;
            },
            function (injector_1_1) {
                injector_1 = injector_1_1;
            },
            function (abstract_module_1_1) {
                abstract_module_1 = abstract_module_1_1;
            },
            function (inject_1_1) {
                inject_1 = inject_1_1;
            },
            function (intercept_1_1) {
                intercept_1 = intercept_1_1;
            }],
        execute: function() {
            Test1 = (function () {
                function Test1() {
                }
                __decorate([
                    inject_1.inject(), 
                    __metadata('design:type', Object)
                ], Test1.prototype, "targetA1", void 0);
                __decorate([
                    inject_1.inject(), 
                    __metadata('design:type', Object)
                ], Test1.prototype, "targetA2", void 0);
                __decorate([
                    inject_1.inject(), 
                    __metadata('design:type', Object)
                ], Test1.prototype, "targetA3", void 0);
                __decorate([
                    inject_1.inject(), 
                    __metadata('design:type', Object)
                ], Test1.prototype, "targetA4", void 0);
                return Test1;
            }());
            describe('Injector', function () {
                describe('#inject', function () {
                    it('依存性か解決されたインスタンスを生成する', function () {
                        var Target1 = (function () {
                            function Target1() {
                            }
                            return Target1;
                        }());
                        var Target2 = (function () {
                            function Target2() {
                            }
                            return Target2;
                        }());
                        var Target3 = (function () {
                            function Target3() {
                            }
                            return Target3;
                        }());
                        var Target4 = (function () {
                            function Target4() {
                            }
                            return Target4;
                        }());
                        var TestModule = (function (_super) {
                            __extends(TestModule, _super);
                            function TestModule() {
                                _super.apply(this, arguments);
                            }
                            TestModule.prototype.configure = function () {
                                this.bind('targetA1').to(Target1);
                                this.bind('targetA2').to(Target2);
                                this.bind('targetA3').to(Target3);
                                this.bind('targetA4').to(Target4);
                            };
                            return TestModule;
                        }(abstract_module_1.AbstractModule));
                        var injector = new injector_1.default([new TestModule]);
                        var result = injector.inject(Test1);
                        chai_1.expect(result.targetA1).instanceof(Target1);
                        chai_1.expect(result.targetA2).instanceof(Target2);
                        chai_1.expect(result.targetA3).instanceof(Target3);
                        chai_1.expect(result.targetA4).instanceof(Target4);
                    });
                    it('入れ子になった依存性を全て解決した状態のインスタンスを生成する', function () {
                        var Binded = (function () {
                            function Binded() {
                            }
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded.prototype, "targetB1", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded.prototype, "targetB2", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded.prototype, "targetB3", void 0);
                            return Binded;
                        }());
                        var Binded2 = (function () {
                            function Binded2() {
                            }
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded2.prototype, "targetC1", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded2.prototype, "targetC2", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded2.prototype, "targetC3", void 0);
                            return Binded2;
                        }());
                        var Binded3 = (function () {
                            function Binded3() {
                            }
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded3.prototype, "targetD1", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded3.prototype, "targetD2", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded3.prototype, "targetD3", void 0);
                            return Binded3;
                        }());
                        var Binded4 = (function () {
                            function Binded4() {
                            }
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded4.prototype, "targetE1", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded4.prototype, "targetE2", void 0);
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Binded4.prototype, "targetE3", void 0);
                            return Binded4;
                        }());
                        var TestModule = (function (_super) {
                            __extends(TestModule, _super);
                            function TestModule() {
                                _super.apply(this, arguments);
                            }
                            TestModule.prototype.configure = function () {
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
                            };
                            return TestModule;
                        }(abstract_module_1.AbstractModule));
                        var injector = new injector_1.default([new TestModule()]);
                        var result = injector.inject(Test1);
                        chai_1.expect(result.targetA1).instanceof(Binded);
                        chai_1.expect(result.targetA2).instanceof(Binded2);
                        chai_1.expect(result.targetA3).instanceof(Binded3);
                        chai_1.expect(result.targetA4).instanceof(Binded4);
                        chai_1.expect(result.targetA1.targetB1).equal(1);
                        chai_1.expect(result.targetA1.targetB2).equal(2);
                        chai_1.expect(result.targetA1.targetB3).equal(3);
                        chai_1.expect(result.targetA2.targetC1).equal(4);
                        chai_1.expect(result.targetA2.targetC2).equal(5);
                        chai_1.expect(result.targetA2.targetC3).equal(6);
                        chai_1.expect(result.targetA3.targetD1).equal(7);
                        chai_1.expect(result.targetA3.targetD2).equal(8);
                        chai_1.expect(result.targetA3.targetD3).equal(9);
                        chai_1.expect(result.targetA4.targetE1).equal(10);
                        chai_1.expect(result.targetA4.targetE2).equal(11);
                        chai_1.expect(result.targetA4.targetE3).equal(12);
                    });
                    it('singletonのバインディングは一度しか生成しない', function () {
                        var targetId = 0;
                        var Target = (function () {
                            function Target() {
                                targetId++;
                            }
                            return Target;
                        }());
                        var Test = (function () {
                            function Test() {
                            }
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], Test.prototype, "target", void 0);
                            return Test;
                        }());
                        var TestModule = (function (_super) {
                            __extends(TestModule, _super);
                            function TestModule() {
                                _super.apply(this, arguments);
                            }
                            TestModule.prototype.configure = function () {
                                this.bind('target').to(Target).asSingleton();
                            };
                            return TestModule;
                        }(abstract_module_1.AbstractModule));
                        var injector = new injector_1.default([new TestModule()]);
                        var instance = injector.inject(Test);
                        instance = injector.inject(Test);
                        instance = injector.inject(Test);
                        instance = injector.inject(Test);
                        chai_1.expect(targetId).equal(1);
                    });
                    it('インターセプタを適用する', function () {
                        var testInterceptor = es6_symbol_1.default('__test__');
                        var TestClass = (function () {
                            function TestClass() {
                            }
                            TestClass.prototype.test = function () {
                                return 1;
                            };
                            __decorate([
                                intercept_1.intercept(testInterceptor), 
                                __metadata('design:type', Function), 
                                __metadata('design:paramtypes', []), 
                                __metadata('design:returntype', void 0)
                            ], TestClass.prototype, "test", null);
                            return TestClass;
                        }());
                        var TestProxy = (function () {
                            function TestProxy() {
                            }
                            TestProxy.prototype.invoke = function (methodInvocation) {
                                return methodInvocation.proceed() + 1;
                            };
                            return TestProxy;
                        }());
                        var TestModule = (function (_super) {
                            __extends(TestModule, _super);
                            function TestModule() {
                                _super.apply(this, arguments);
                            }
                            TestModule.prototype.configure = function () {
                                this.bindInterceptor(testInterceptor).to(TestProxy);
                            };
                            return TestModule;
                        }(abstract_module_1.AbstractModule));
                        var injector = new injector_1.default([new TestModule()]);
                        var inst = injector.inject(TestClass);
                        chai_1.expect(inst.test()).eq(2);
                    });
                    it('入れ子の依存にインターセプタを適用する', function () {
                        var testInterceptor = es6_symbol_1.default('__test__');
                        var ParentClass = (function () {
                            function ParentClass() {
                            }
                            ParentClass.prototype.test = function () {
                                return this.childClass.test();
                            };
                            __decorate([
                                inject_1.inject(), 
                                __metadata('design:type', Object)
                            ], ParentClass.prototype, "childClass", void 0);
                            return ParentClass;
                        }());
                        var ChildClass = (function () {
                            function ChildClass() {
                            }
                            ChildClass.prototype.test = function () {
                                return 1;
                            };
                            __decorate([
                                intercept_1.intercept(testInterceptor), 
                                __metadata('design:type', Function), 
                                __metadata('design:paramtypes', []), 
                                __metadata('design:returntype', void 0)
                            ], ChildClass.prototype, "test", null);
                            return ChildClass;
                        }());
                        var TestProxy = (function () {
                            function TestProxy() {
                            }
                            TestProxy.prototype.invoke = function (methodInvocation) {
                                return methodInvocation.proceed() + 1;
                            };
                            return TestProxy;
                        }());
                        var TestModule = (function (_super) {
                            __extends(TestModule, _super);
                            function TestModule() {
                                _super.apply(this, arguments);
                            }
                            TestModule.prototype.configure = function () {
                                this.bindInterceptor(testInterceptor).to(TestProxy);
                                this.bind('childClass').to(ChildClass);
                            };
                            return TestModule;
                        }(abstract_module_1.AbstractModule));
                        var injector = new injector_1.default([new TestModule()]);
                        var inst = injector.inject(ParentClass);
                        chai_1.expect(inst.test()).eq(2);
                    });
                });
            });
        }
    }
});
