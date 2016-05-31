export interface Lodash {
    forEach<T>(a: T[], cb: (v: T, i?: number, a?: T[]) => any): void;
    forEach<T>(a: {
        [key: string]: T;
    }, cb: (v: T, k?: string, a?: {
        [key: string]: T;
    }) => any): void;
    forEach<T>(a: T, cb: (v: T, i?: string, a?: T) => any): void;
    every<T>(a: T[], cb: (v: T, i?: number, a?: T[]) => boolean): boolean;
    forIn<T>(a: {
        [key: string]: T;
    }, cb: (v: T, k?: string, a?: {
        [key: string]: T;
    }) => any): void;
    forIn<T, U>(a: T, cb: (v: U, k?: string, a?: T) => any): void;
    map<T, U>(a: T[], cb: (v: T, i?: number, a?: T[]) => U): U[];
    map<T, U>(a: {
        [key: string]: T;
    }, cb: (v: T, k?: string, a?: {
        [key: string]: T;
    }) => U): U[];
    filter<T>(a: T[], cb: (v: T, i?: number, a?: T[]) => boolean): T[];
    filter<T, U>(a: T, cb: (v: U, i?: string, a?: T) => boolean): T;
    mapValues<T, V>(a: {
        [key: string]: T;
    }, cb: (v: T, k?: string, a?: {
        [key: string]: T;
    }) => V): {
        [key: string]: V;
    };
    isArray(v: any): v is any[];
    isObject(v: any): boolean;
    clone<T>(v: T): T;
    omit<T>(v: T, prop: string): T;
    assign<A, B>(v: A, s: B): A & B;
    extend<A, B>(v: A, s: B): A & B;
    isNil(v: any): boolean;
    isRegExp(v: any): v is RegExp;
    keys(v: any): string[];
}
export declare const _: Lodash;
