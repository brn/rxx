export declare function isDefined(obj: any): boolean;
export declare function assign<T extends {}, U extends {}>(base: T, append: U): T & U;
export declare function extend<T extends {}, U extends {}>(base: T, append: U): T & U;
export declare function omit(obj: any, name: string | string[]): {};
export declare function forIn<T>(obj: T, cb: (value: T[keyof T], key: string, values: T) => void): void;
export declare function isObject(obj: any): obj is Object;
export declare function isArray(obj: any): obj is any[];
export declare function isRegExp(obj: any): obj is RegExp;
export declare function filter<T>(obj: T[], cb: (e: T, key: number, all: T[]) => boolean): T[];
export declare function filter<T>(obj: T, cb: (e: T[keyof T], key: string, all: T) => boolean): T[keyof T][];
export declare function map<T, U>(obj: T[], cb: (e: T, key: number, all: T[]) => U): U[];
export declare function map<T, U>(obj: T, cb: (e: T[keyof T], key: string, all: T) => U): U[];
export declare function some<T>(obj: T, cb: (value: T[keyof T], index: number | string, all: T) => boolean): boolean;
export declare function mapValues<T, U>(obj: T, cb: (value: T[keyof T], key: string, all: T) => U): {
    [key: string]: U;
};
export declare function clone<T>(target: T): T;
