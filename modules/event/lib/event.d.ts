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
import { IOResponse, Event } from '@react-mvi/core';
/**
 * Event publisher.
 */
export declare class EventDispatcher implements Event {
    /**
     * Subject store.
     */
    private store;
    /**
     * IO Response.
     */
    private res;
    /**
     * Event history.
     */
    private history;
    constructor();
    /**
     * Publish event.
     * @override
     * @param key Event name. If 'RETRY' passed, past published event will be republishing.
     * @param args Event args. If a first argument was 'RETRY', specify history index.
     * If empty, last event will be publishing.
     */
    fire(key: string, args?: any): void;
    /**
     * Fire event after specific time.
     * @override
     * @param time Time to delay.
     * @param key Event name.
     * @param args Event args.
     */
    throttle(time: number, key: string, args?: any): void;
    /**
     * Return callback function that will publish event.
     * @override
     * @param key Event name.
     * @param v Event args. Override publish args.
     */
    asCallback(key: string, v?: any): (args?: any) => void;
    /**
     * Same as asCallback.
     * @override
     * @param key Event name.
     * @param v Event args.
     */
    asc(key: string, v?: any): (args?: any) => void;
    /**
     * Dispose all subscriptions.
     * @override
     */
    end(): void;
    /**
     * Return response of events.
     * @override
     */
    readonly response: IOResponse;
}
