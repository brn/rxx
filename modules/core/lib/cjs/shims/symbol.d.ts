/// <reference path="../declarations.d.ts" />
export interface Symbol {
    /** Returns a string representation of an object. */
    toString(): string;
    /** Returns the primitive value of the specified object. */
    valueOf(): Object;
}
export interface SymbolConstructor {
    /**
     * A reference to the prototype.
     */
    readonly prototype: Symbol;
    /**
     * Returns a new unique Symbol value.
     * @param  description Description of the new Symbol object.
     */
    (description?: string | number): symbol;
    /**
     * Returns a Symbol object from the global symbol registry matching the given key if found.
     * Otherwise, returns a new symbol with this key.
     * @param key key to search for.
     */
    for(key: string): symbol;
    /**
     * Returns a key from the global symbol registry matching the given Symbol if found.
     * Otherwise, returns a undefined.
     * @param sym Symbol to find the key for.
     */
    keyFor(sym: symbol): string | undefined;
    /**
     * A method that returns the default iterator for an object. Called by the semantics of the
     * for-of statement.
     */
    readonly iterator: symbol;
    /**
     * Returns a new unique Symbol value.
     * @param  description Description of the new Symbol object.
     */
    (description?: string | number): symbol;
    /**
     * Returns a Symbol object from the global symbol registry matching the given key if found.
     * Otherwise, returns a new symbol with this key.
     * @param key key to search for.
     */
    for(key: string): symbol;
    /**
     * Returns a key from the global symbol registry matching the given Symbol if found.
     * Otherwise, returns a undefined.
     * @param sym Symbol to find the key for.
     */
    keyFor(sym: symbol): string | undefined;
    /**
     * A method that determines if a constructor object recognizes an object as one of the
     * constructor’s instances. Called by the semantics of the instanceof operator.
     */
    readonly hasInstance: symbol;
    /**
     * A Boolean value that if true indicates that an object should flatten to its array elements
     * by Array.prototype.concat.
     */
    readonly isConcatSpreadable: symbol;
    /**
     * A regular expression method that matches the regular expression against a string. Called
     * by the String.prototype.match method.
     */
    readonly match: symbol;
    /**
     * A regular expression method that replaces matched substrings of a string. Called by the
     * String.prototype.replace method.
     */
    readonly replace: symbol;
    /**
     * A regular expression method that returns the index within a string that matches the
     * regular expression. Called by the String.prototype.search method.
     */
    readonly search: symbol;
    /**
     * A function valued property that is the constructor function that is used to create
     * derived objects.
     */
    readonly species: symbol;
    /**
     * A regular expression method that splits a string at the indices that match the regular
     * expression. Called by the String.prototype.split method.
     */
    readonly split: symbol;
    /**
     * A method that converts an object to a corresponding primitive value.
     * Called by the ToPrimitive abstract operation.
     */
    readonly toPrimitive: symbol;
    /**
     * A String value that is used in the creation of the default string description of an object.
     * Called by the built-in method Object.prototype.toString.
     */
    readonly toStringTag: symbol;
    /**
     * An Object whose own property names are property names that are excluded from the 'with'
     * environment bindings of the associated objects.
     */
    readonly unscopables: symbol;
}
export declare const Symbol: SymbolConstructor;
