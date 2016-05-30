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
    modules: Module[];
}
export declare class Context extends React.Component<ContextProps, {}> {
    private contextObject;
    constructor(props: any, c: any);
    render(): any;
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
 */
export declare function context<T extends Function>(target: T): void;
export declare function setContext(component: any): void;
