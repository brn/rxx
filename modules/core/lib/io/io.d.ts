import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
export declare const IO_MARK: symbol;
/**
 * Base class of io module.
 */
export declare class IOModule {
    constructor();
}
/**
 * Decorator for io module.
 */
export declare function io<T extends Function>(target: T): void;
export declare const appendIOModuleKey: (name: any) => void;
export declare const getIOModules: () => string[];
/**
 * Represent IO response.
 */
export declare class IOResponse {
    private subjectStore;
    constructor(subjectStore: SubjectStore);
    /**
     * Get a subject by specify key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    for<T>(key: string): Observable<T>;
}
/**
 * Hold Subject cache.
 */
export declare class SubjectStore {
    private subjectMap;
    constructor(subjectMap?: {
        [key: string]: Subject<any>;
    });
    hasWithoutGlobal(key: string): boolean;
    /**
     * Check whether Subject was defined with specific key or not.
     * @param key Subject name.
     * @return True if Subject was defined.
     */
    has(key: string): Subject<any> | boolean;
    getWithoutGlobal(key: string): Subject<any>;
    /**
     * Get Subject by specific key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    get(key: string): Subject<any>[];
    /**
     * Append new Subject.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    add<T>(key: string): Subject<T>;
    /**
     * Dispose all subscriptions.
     */
    end(): void;
}
/**
 * Interface for IO processor.
 */
export interface IO {
    response: IOResponse;
    end(): void;
}
/**
 * The methods of the Http request.
 */
export declare enum HttpMethod {
    GET = 1,
    POST = 2,
    PUT = 3,
}
/**
 * Response type of the Http request.
 */
export declare enum ResponseType {
    JSON = 1,
    BLOB = 2,
    ARRAY_BUFFER = 3,
    FORM_DATA = 4,
    TEXT = 5,
}
/**
 * Type for Http request options.
 */
export declare type HttpConfig = {
    url: string;
    key: string;
    method?: HttpMethod;
    headers: any;
    mode?: 'cors' | 'same-origin' | 'no-cors';
    json?: boolean;
    data?: string | Blob | FormData;
    responseType?: ResponseType;
    sendToken?: boolean;
};
/**
 * Interface for Http IO.
 */
export interface Http extends IO {
    /**
     * Wait Http request observable.
     * @param request Disposable.
     */
    wait(request: Observable<HttpConfig>): Subscription;
    /**
     * Dispose all subscriptions.
     */
    end(): void;
}
/**
 * Interface for Event IO
 */
export interface Event extends IO {
    /**
     * Publish specified key event.
     * @param key Event name.
     * @param args Event args.
     */
    fire(key: string, args?: any): void;
    /**
     * Get callback function that publish specified key event.
     * @param key Event name.
     * @param v Event args that override event args.
     * @returns Function that publish event.
     */
    asCallback(key: string, v?: any): (args?: any) => void;
    /**
     * Same as asCallback
     * @param key Event name.
     * @param v Event args that override event args.
     * @returns Function that publish event.
     */
    asc(key: string, v?: any): (args?: any) => void;
    /**
     * Fire event after specified time.
     * @param time Time to delay.
     * @param key Event name.
     * @param args Event args
     */
    throttle(time: number, key: string, args: any): void;
    /**
     * Dispose all subscriptions.
     */
    end(): void;
}
/**
 * The methods of the StorageIO.
 */
export declare enum StorageMethod {
    PUT = 1,
    GET = 2,
    DEL = 3,
}
/**
 * The type of the Storage.
 */
export declare enum StorageType {
    LOCAL_STORAGE = 1,
    SESSION_STORAGE = 2,
    COOKIE = 3,
}
/**
 * Option interface of the Storage.
 */
export interface StorageOptions {
    type: StorageType;
    key: string;
    name: string;
    value: any;
    method: StorageMethod;
    options: {
        expires?: number;
        path?: string;
        domain?: string;
        secure?: boolean;
    };
}
/**
 * Interface for Storages.
 */
export interface DOMStorage {
    put<T>(key: string, value: T, opt: StorageOptions): any;
    get<T>(key: string): T;
    del(key: string): any;
}
/**
 * Interface for storage io processor.
 */
export interface StorageIO extends IO {
    wait(ob: Observable<StorageOptions>): void;
}
export interface BasicIOTypes {
    http: Http;
    event: Event;
    storage: StorageIO;
}
