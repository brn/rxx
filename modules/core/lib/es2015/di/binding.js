// -*- mode: typescript -*-
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
/**
 * Options for class type.
 */
var ClassTypeOption = (function () {
    function ClassTypeOption(binding) {
        this.binding = binding;
    }
    /**
     * Make class singleton.
     */
    ClassTypeOption.prototype.asSingleton = function () {
        this.binding.singleton = true;
    };
    /**
     * Make class eager singleton.
     */
    ClassTypeOption.prototype.asEagerSingleton = function () {
        this.binding.singleton = true;
        this.binding.eagerSingleton = true;
    };
    return ClassTypeOption;
}());
export { ClassTypeOption };
var bindingId = 0;
/**
 * Link binding to value.
 */
var BindingPlaceholder = (function () {
    /**
     * @param id Binding id.
     * @param holder Bindings map.
     */
    function BindingPlaceholder(id, holder) {
        this.id = id;
        this.holder = holder;
    }
    BindingPlaceholder.prototype.to = function (ctor) {
        this.holder[this.id] = { val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: false, id: bindingId++ };
        return new ClassTypeOption(this.holder[this.id]);
    };
    /**
     * Link instance to binding id.
     * @param value Immediate value.
     */
    BindingPlaceholder.prototype.toInstance = function (value) {
        this.holder[this.id] = { val: value, singleton: false, eagerSingleton: false, instance: true, provider: false, template: false, id: bindingId++ };
    };
    /**
     * Link Provider to binding id.
     * @param value Provider constructor function.
     */
    BindingPlaceholder.prototype.toProvider = function (value) {
        this.holder[this.id] = { val: value, singleton: false, eagerSingleton: false, instance: false, provider: true, template: false, id: bindingId++ };
    };
    return BindingPlaceholder;
}());
export { BindingPlaceholder };
/**
 * Hold interceptor and value.
 */
var InterceptPlaceholder = (function () {
    /**
     * @param targetSymbol The symbol that set to intercepted.
     */
    function InterceptPlaceholder(targetSymbol) {
        this.targetSymbol = targetSymbol;
        /**
         * Singleton flag.
         */
        this.singleton = false;
        /**
         * Eager singleton flag.
         */
        this.eagerSingleton = false;
        this.id = bindingId++;
    }
    /**
     * Do binding.
     * @param methodProxyCtor MethodProxy constructor funciton.
     */
    InterceptPlaceholder.prototype.to = function (methodProxyCtor) {
        this.interceptor = methodProxyCtor;
        return new ClassTypeOption(this);
    };
    return InterceptPlaceholder;
}());
export { InterceptPlaceholder };
/**
 * Hold template definitions and values.
 */
var TemplatePlaceholder = (function () {
    /**
     * @param id Template id.
     * @param holder Object that hold bindings.
     */
    function TemplatePlaceholder(id, holder) {
        this.id = id;
        this.holder = holder;
    }
    /**
     * Link template to binding id.
     * @param ctor Constructor function.
     */
    TemplatePlaceholder.prototype.to = function (ctor) {
        this.holder[this.id] = { val: ctor, singleton: false, eagerSingleton: false, instance: false, provider: false, template: true, id: bindingId++ };
    };
    return TemplatePlaceholder;
}());
export { TemplatePlaceholder };
