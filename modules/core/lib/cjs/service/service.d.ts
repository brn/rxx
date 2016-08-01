import { Injector } from '../di/injector';
export declare const SERVICE_MARK: symbol;
export declare function service<T extends Function>(target: T): T;
export interface Service<IOS, T> {
    (ios: IOS, injector: Injector, ...args: any[]): T;
    initialize?(ios: IOS, injector: Injector, ...args: any[]): T;
}
