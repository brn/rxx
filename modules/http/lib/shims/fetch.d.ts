/// <reference path="../declarations.d.ts" />
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
import 'whatwg-fetch';
import { Promise } from './promise';
export interface RequestStatic {
    new (input: string | Request, init?: RequestInit): Request;
}
export interface Request extends Body {
    method: string;
    url: string;
    headers: Headers;
    context: RequestContext;
    referrer: string;
    mode: RequestMode;
    credentials: RequestCredentials;
    cache: RequestCache;
}
export interface RequestInit {
    method?: string;
    headers?: HeaderInit | {
        [index: string]: string;
    };
    body?: BodyInit;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
}
export declare type RequestContext = "audio" | "beacon" | "cspreport" | "download" | "embed" | "eventsource" | "favicon" | "fetch" | "font" | "form" | "frame" | "hyperlink" | "iframe" | "image" | "imageset" | "import" | "internal" | "location" | "manifest" | "object" | "ping" | "plugin" | "prefetch" | "script" | "serviceworker" | "sharedworker" | "subresource" | "style" | "track" | "video" | "worker" | "xmlhttprequest" | "xslt";
export declare type RequestMode = "same-origin" | "no-cors" | "cors";
export declare type RequestCredentials = "omit" | "same-origin" | "include";
export declare type RequestCache = "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
export interface Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string;
    getAll(name: string): Array<string>;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, name: string) => void): void;
}
export interface Body {
    bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    json(): Promise<any>;
    json<T>(): Promise<T>;
    text(): Promise<string>;
}
export interface ResponseStatic {
    new (body?: BodyInit, init?: ResponseInit): Response;
    error(): Response;
    redirect(url: string, status: number): Response;
}
export interface Response extends Body {
    type: ResponseType;
    url: string;
    status: number;
    ok: boolean;
    statusText: string;
    headers: Headers;
    clone(): Response;
}
export declare type ResponseType = "basic" | "cors" | "default" | "error" | "opaque";
export interface ResponseInit {
    status: number;
    statusText?: string;
    headers?: HeaderInit;
}
export declare type HeaderInit = Headers | Array<string> | {
    [key: string]: string;
};
export declare type BodyInit = Blob | FormData | string;
export declare type RequestInfo = Request | string;
export interface Fetch {
    (url: string | Request, init?: RequestInit): Promise<Response>;
}
export declare const fetch: Fetch;
export declare const Request: RequestStatic;
export declare const Response: ResponseStatic;
