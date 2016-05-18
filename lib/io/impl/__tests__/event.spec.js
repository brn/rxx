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
System.register(['chai', '../event', '../../../testing/async-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var chai_1, event_1, async_utils_1;
    return {
        setters:[
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (event_1_1) {
                event_1 = event_1_1;
            },
            function (async_utils_1_1) {
                async_utils_1 = async_utils_1_1;
            }],
        execute: function() {
            describe('event.tsx', function () {
                var instance;
                beforeEach(function () {
                    instance = new event_1.EventDispatcher();
                });
                afterEach(function () { return instance.end(); });
                describe('EventDispatcher', function () {
                    describe('#fire()', function () {
                        it('イベントを発火する', function () {
                            var fired = false;
                            instance.response.for('test').subscribe(function (v) {
                                fired = v;
                            });
                            instance.fire('test', true);
                            chai_1.expect(fired).to.be.eq(true);
                        });
                    });
                    describe('#asFunction()', function () {
                        it('イベントを発火するコールバックを返す', function () {
                            var fired = false;
                            instance.response.for('test').subscribe(function (v) {
                                fired = v;
                            });
                            instance.asCallback('test', true)();
                        });
                    });
                    describe('#throttle', function () {
                        it('指定時間経過後にイベントを発火する', function (done) {
                            instance.response.for('test').subscribe(async_utils_1.graceful(function (v) {
                                chai_1.expect(v).to.be.eq(true);
                            }, done));
                            instance.throttle(100, 'test', true);
                        });
                    });
                });
            });
        }
    }
});
