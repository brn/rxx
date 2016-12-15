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
import { Outlet } from '@react-mvi/core';
import { Subscription } from 'rxjs/Rx';
/**
 * Event publisher.
 */
export declare class EventDispatcher extends Outlet {
    /**
     * Event history.
     */
    private history;
    subscribe(props: {
        [key: string]: any;
    }): Subscription;
    /**
     * Publish event.
     * @override
     * @param key Event name. If 'RETRY' passed, past published event will be republishing.
     * @param args Event args. If a first argument was 'RETRY', specify history index.
     * If empty, last event will be publishing.
     */
    push(key: string, args?: any): Promise<any>;
    /**
     * Return callback function that will publish event.
     * @override
     * @param key Event name.
     * @param v Event args. Override publish args.
     */
    callback(key: string, v?: any): (args?: any) => void;
}
