/**
 * Intercept methods that are specified by regular expression.
 * @param key Symbol to intercept.
 * @param regexp Regular expression that specify methods.
 * @returns Class decorator.
 */
export declare function interceptAll(key: symbol, regexp: RegExp): <T extends Function>(target: T) => void;
/**
 * Specifiy injector to intercept method.
 * @param key Symbol to intercept.
 * @returns Method decorator.
 */
export declare function intercept(key: symbol): (target: Object, propertyKey: string | symbol) => void;
