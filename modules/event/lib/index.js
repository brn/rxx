"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@react-mvi/core");
var Rx_1 = require("rxjs/Rx");
/**
 * History size.
 */
var MAX_HISTORY_LENGTH = 10;
/**
 * Event publisher.
 */
var EventDispatcher = (function (_super) {
    __extends(EventDispatcher, _super);
    function EventDispatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Event history.
         */
        _this.history = [];
        return _this;
    }
    EventDispatcher.prototype.subscribe = function (props) {
        return new Rx_1.Subscription();
    };
    /**
     * Publish event.
     * @override
     * @param key Event name. If 'RETRY' passed, past published event will be republishing.
     * @param args Event args. If a first argument was 'RETRY', specify history index.
     * If empty, last event will be publishing.
     */
    EventDispatcher.prototype.push = function (key, args) {
        if (key === 'RETRY') {
            var target = this.history[args || this.history.length - 1];
            if (target) {
                target();
            }
            return;
        }
        if (!this.store.has(key)) {
            return;
        }
        var subjects = this.store.get(key);
        var fire = function () { return subjects.forEach(function (subject) { return subject.next(args); }); };
        this.history.push(fire);
        if (this.history.length > MAX_HISTORY_LENGTH) {
            this.history.shift();
        }
        fire();
        return Promise.resolve();
    };
    /**
     * Return callback function that will publish event.
     * @override
     * @param key Event name.
     * @param v Event args. Override publish args.
     */
    EventDispatcher.prototype.callback = function (key, v) {
        var _this = this;
        return function (args) { return _this.push(key, core_1.isDefined(v) ? v : args); };
    };
    return EventDispatcher;
}(core_1.Outlet));
EventDispatcher = __decorate([
    core_1.io
], EventDispatcher);
exports.EventDispatcher = EventDispatcher;
