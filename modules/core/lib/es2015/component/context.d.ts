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
import * as React from 'react';
import { Module } from '../di/module';
import { Injector } from '../di/injector';
import { IO, BasicIOTypes } from '../io/io';
export interface IOTypes extends BasicIOTypes {
    [key: string]: IO;
}
/**
 * Context types.
 */
export interface ContextType {
    createProps<T>(...args: any[]): any;
    clean(): void;
    connect<T>(v: T): void;
    injector: Injector;
    io: IOTypes;
}
/**
 * React contextTypes.
 */
export declare const ContextReactTypes: {
    createProps: React.Requireable<any>;
    clean: React.Requireable<any>;
    connect: React.Requireable<any>;
    injector: React.Requireable<any>;
    io: React.Requireable<any>;
};
/**
 * Required props for Context Component.
 */
export interface ContextProps {
    injector?: Injector;
    modules?: Module[];
}
/**
 * React context provider.
 */
export declare class Context extends React.Component<ContextProps, {}> {
    /**
     * Context object.
     */
    private contextObject;
    private disposables;
    constructor(props: any, c: any);
    render(): any;
    componentWillUnmount(): void;
    getChildContext(): ContextType;
    static readonly childContextTypes: {
        createProps: React.Requireable<any>;
        clean: React.Requireable<any>;
        connect: React.Requireable<any>;
        injector: React.Requireable<any>;
        io: React.Requireable<any>;
    };
}
/**
 * Decorator to set specified type as context type.
 * @param target A class constructor.
 */
export declare function context<T extends Function>(target: T): void;
/**
 * Set context type to stateless component.
 * @param component A stateless component.
 */
export declare function setContext(component: any): void;
