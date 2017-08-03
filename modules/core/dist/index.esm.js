import { Component, cloneElement, createElement, isValidElement } from 'react';
import * as React from 'react';
import { any } from 'prop-types';
import * as PropTypes from 'prop-types';
import { Observable, Subject, Subscription } from 'rxjs/Rx';

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
const OBJECT_REGEXP = /\[object ([^\]]+)\]/;
const toStringClass = o => o ? Object.prototype.toString.call(o).match(OBJECT_REGEXP)[1] : 'null';
function isDefined(obj) {
    return obj !== undefined && obj !== null;
}
function assign(base, append) {
    return Object.assign({}, base, append);
}
function extend(base, append) {
    for (const key in append) {
        base[key] = append[key];
    }
    return base;
}
function omit(obj, name) {
    const ret = {};
    const omits = typeof name === 'string' ? [name] : name;
    for (const key in obj) {
        if (omits.indexOf(key) === -1) {
            ret[key] = obj[key];
        }
    }
    return ret;
}
function forIn(obj, cb) {
    for (const key in obj || {}) {
        cb(obj[key], key, obj);
    }
}
function isObject(obj) {
    return toStringClass(obj) === 'Object';
}
function isArray(obj) {
    return toStringClass(obj) === 'Array';
}
function isRegExp(obj) {
    return toStringClass(obj) === 'RegExp';
}
function filter(obj, cb) {
    if (isArray(obj)) {
        return obj.filter(cb);
    }
    const ret = [];
    for (const key in obj || {}) {
        if (cb(obj[key], key, obj)) {
            ret.push(obj[key]);
        }
    }
    return ret;
}
function map(obj, cb) {
    if (isArray(obj)) {
        return obj.map(cb);
    }
    const ret = [];
    for (const key in obj || {}) {
        ret.push(cb(obj[key], key, obj));
    }
    return ret;
}
function some(obj, cb) {
    if (isArray(obj)) {
        return obj.some(cb);
    }
    else if (isObject(obj)) {
        for (const key in obj || {}) {
            if (cb(obj[key], key, obj)) {
                return true;
            }
        }
    }
    return false;
}
function every(obj, cb) {
    if (isArray(obj)) {
        return obj.every(cb);
    }
    else if (isObject(obj)) {
        for (const key in obj || {}) {
            if (!cb(obj[key], key, obj)) {
                return false;
            }
        }
    }
    return true;
}
function mapValues(obj, cb) {
    const ret = {};
    for (const key in obj || {}) {
        ret[key] = cb(obj[key], key, obj);
    }
    return ret;
}
function clone(target) {
    if (isObject(target)) {
        return Object.assign({}, target);
    }
    else if (isArray(target)) {
        return target.slice();
    }
    return target;
}
function symbol(val) {
    return typeof Symbol === 'function' ? Symbol(val) : val;
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Abstract expression for method invocation.
 */
class MethodInvocation {
    /**
     * @param method Function body.
     * @param context Calling context.
     * @param args Arguments.
     * @param contextName The name of execution context.
     * @param propertyKey Property name.
     */
    constructor(method, context, args, contextName, propertyKey) {
        this.method = method;
        this.context = context;
        this.args = args;
        this.contextName = contextName;
        this.propertyKey = propertyKey;
    }
    /**
     * Execute function.
     * @returns Execute result.
     */
    proceed() {
        return this.method.apply(this.context, this.args);
    }
    /**
     * Get arguments.
     * @returns Arguments.
     */
    getArguments() {
        return this.args;
    }
    /**
     * Get context.
     * @returns Execution context.
     */
    getContext() {
        return this.context;
    }
    /**
     * Get instance name.
     * @returns string A instance name.
     */
    getInstanceName() {
        return this.contextName;
    }
    /**
     * Get property name.
     * @returns string A property name.
     */
    getPropertyName() {
        return this.propertyKey;
    }
    /**
     * Return joined name of context and property.
     */
    getFullQualifiedName() {
        return `${this.getInstanceName()}.${this.getPropertyName()}`;
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * StateHandler Registry.
 */
let stateHandlerRegistry = {};
/**
 * Get registered stateHandlerRegistry.
 */
function getHandlers() {
    return stateHandlerRegistry;
}
/**
 * Register StateHandler to handler map.
 * @param newHandlers Handler map.
 */
function registerHandlers(newHandlers) {
    let invalidTargetKey = '';
    if (!every(newHandlers, (h, k) => {
        const result = h instanceof StateHandler;
        if (!result) {
            invalidTargetKey = k;
        }
        return result;
    })) {
        throw new Error(`${invalidTargetKey} is not valid state handler.`);
    }
    stateHandlerRegistry = Object.assign({}, stateHandlerRegistry, newHandlers);
}
/**
 * Remove specified handler from registry.
 * @param key Key or keys of target handler.
 */
function removeHandler(key) {
    stateHandlerRegistry = omit(stateHandlerRegistry, key);
}
/**
 * Represent StateHandler response.
 */
class HandlerResponse {
    constructor(streamCollection) {
        this.streamCollection = streamCollection;
    }
    /**
     * Get a subject by specify key.
     * @param key Subject name.
     * @returns Registered Subject.
     */
    for(key) {
        if (!this.streamCollection.hasWithoutGlobal(key)) {
            return this.streamCollection.add(key);
        }
        return this.streamCollection.getWithoutGlobal(key);
    }
}
/**
 * Hold Subject cache.
 */
class StreamStore {
    constructor(subjectMap = {}) {
        this.subjectMap = subjectMap;
    }
    /**
     * @inheritDoc
     */
    hasWithoutGlobal(key) {
        return !!this.subjectMap[key];
    }
    /**
     * @inheritDoc
     */
    has(key) {
        const splited = key.split('::');
        const globalKey = splited.length > 1 ? `*::${splited[1]}` : null;
        return !!this.subjectMap[key] || (globalKey ? !!this.subjectMap[globalKey] : false);
    }
    /**
     * @inheritDoc
     */
    getWithoutGlobal(key) {
        if (this.subjectMap[key]) {
            return this.subjectMap[key];
        }
        return null;
    }
    /**
     * @inheritDoc
     */
    get(key) {
        const ret = [];
        const splited = key.split('::');
        const globalKey = splited.length > 1 ? `*::${splited[1]}` : null;
        const globalBus = globalKey && this.subjectMap[globalKey] ? this.subjectMap[globalKey] : null;
        if (this.subjectMap[key]) {
            ret.push(this.subjectMap[key]);
        }
        if (globalBus) {
            ret.push(globalBus);
        }
        return ret;
    }
    /**
     * @inheritDoc
     */
    add(key) {
        return this.subjectMap[key] = new Subject();
    }
}
class StateHandler {
    constructor(advices = {}, cutPoints = {}) {
        /**
         * Subject for exported stream.
         */
        this.store = new StreamStore();
        this.handlerResponse = new HandlerResponse(this.store);
        forIn(advices, (advice, name) => {
            let cutPoint = cutPoints[name];
            cutPoint = isArray(cutPoint) ? cutPoint : [cutPoint];
            if (!cutPoint) {
                throw new Error(`Cut point ${name} does not exists`);
            }
            cutPoint.forEach(name => {
                if (typeof this[name] !== 'function') {
                    throw new Error('Advice only applyable to Function.');
                }
                const method = this[name];
                this[name] = (...args) => {
                    const proceed = () => method.apply(this, args);
                    const mi = new MethodInvocation(proceed, this, args, this.constructor.name, name);
                    /*tslint:disable:no-string-literal*/
                    return advice['invoke'] ? advice.invoke(mi) : advice(mi);
                    /*tslint:enable:no-string-literal*/
                };
            });
        });
    }
    setState(state) {
        this.state = state;
    }
    /**
     * Return response representation of stream.
     * @return Representation of stream response.
     */
    get response() {
        return this.handlerResponse;
    }
    /**
     * @inheritDocs
     */
    callback(key, value) {
        return (key, args) => this.push(key, value !== undefined ? value : args);
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * History size.
 */
const MAX_HISTORY_LENGTH = 10;
/**
 * Intent decorator that assign StateHandler to instance properties.
 */
function intent(Base) {
    function EnhancedIntent(handlers) {
        for (const key in handlers) {
            this[key] = handlers[key];
        }
        Base.call(this, handlers);
    }
    EnhancedIntent.prototype = Base.prototype;
    return EnhancedIntent;
}
/**
 * Singleton event publisher.
 */
class Intent extends StateHandler {
    constructor(parent) {
        super();
        /**
         * Event history.
         */
        this.history = [];
        this.children = [];
        this.prepare(parent);
    }
    addChild(child) {
        this.children.push(child);
    }
    removeChild(intent) {
        const index = this.children.indexOf(intent);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }
    dispose() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.children = [];
        this.parent = null;
    }
    prepare(parent) {
        this.parent = parent;
        if (this.parent) {
            this.parent.addChild(this);
        }
    }
    subscribe(props) {
        return new Subscription();
    }
    /**
     * Publish event.
     * @override
     * @param key Event name. If 'RETRY' passed, past published event will be republishing.
     * @param args Event args. If a first argument was 'RETRY', specify history index.
     * If empty, last event will be publishing.
     */
    push(key, args) {
        if (key === 'RETRY') {
            const target = this.history[args || this.history.length - 1];
            if (target) {
                target();
            }
            return;
        }
        const subjects = this.findSubjects(key);
        if (!subjects.length) {
            return;
        }
        const fire = () => subjects.forEach(subject => subject.next({ data: args, state: this.state }));
        this.history.push(fire);
        if (this.history.length > MAX_HISTORY_LENGTH) {
            this.history.shift();
        }
        fire();
        return Promise.resolve();
    }
    getStreamStore() { return this.store; }
    /**
     * Return callback function that will publish event.
     * @override
     * @param key Event name.
     * @param v Event args. Override publish args.
     */
    callback(key, v) {
        return (args) => this.push(key, isDefined(v) ? v : args);
    }
    findSubjects(key) {
        let subjects = this.store.get(key);
        if (this.parent) {
            subjects = subjects.concat(this.findParentSubjects(key, false));
        }
        if (this.children.length) {
            subjects = subjects.concat(this.findChildrenSubjects(key, false));
        }
        return subjects;
    }
    findParentSubjects(key, searchSelfStore = true) {
        const subjects = searchSelfStore ? this.store.get(key) : [];
        if (this.parent) {
            return subjects.concat(this.parent.findParentSubjects(key));
        }
        return subjects;
    }
    findChildrenSubjects(key, searchSelfStore = true) {
        const subjects = searchSelfStore ? this.store.get(key) : [];
        if (this.children.length) {
            return this.children.reduce((subject, child) => subjects.concat(child.findChildrenSubjects(key)), subjects);
        }
        return subjects;
    }
}

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
class ObservableUpdater {
    constructor() {
        this.observables = [];
        this.doNotCollectObservables = false;
        this.currentIndex = 0;
        this.id = Date.now();
    }
    push(observable) {
        if (!this.doNotCollectObservables) {
            this.observables.push(observable);
        }
        else {
            this.observables[this.currentIndex++].context = observable.context;
        }
    }
    mapObservablesToValue() {
        if (!this.observables.length) {
            return Observable.of(this.templateObject);
        }
        return Observable.combineLatest(...this.observables.map(({ value }) => {
            const NULL_VALUE = {};
            let firstValue = NULL_VALUE;
            const sub = value.subscribe(v => firstValue = v);
            sub.unsubscribe();
            if (firstValue === NULL_VALUE) {
                return value.startWith(null);
            }
            return value;
        })).map(values => {
            values.forEach((value, index) => {
                const { context, key } = this.observables[index];
                context[key] = value;
            });
            const id = this.id = Date.now();
            let persisted = false;
            return typeof Proxy === 'function' ? new Proxy(this.clone, {
                get: (target, name) => {
                    if (name === 'persist') {
                        return () => {
                            persisted = true;
                            this.collect(this.templateObject);
                        };
                    }
                    if (!persisted && id !== this.id) {
                        console.warn(new Error(`State object is reused for performance.
If you want to use state object after updated, call persist().`).stack);
                    }
                    return target[name];
                }
            }) : (() => {
                return Object.defineProperty(this.clone, 'persist', {
                    value: () => { this.collect(this.templateObject); },
                    configurable: true,
                    enumerable: false,
                    writable: true
                });
            })();
        });
    }
    collect(object) {
        this.templateObject = object;
        if (isArray(object)) {
            this.clone = object.slice();
        }
        else if (isObject(object) && Object.getPrototypeOf(object) === Object.prototype) {
            this.clone = Object.assign({}, object);
        }
        else {
            throw new Error('Invalid object passed to combineTemplate');
        }
        this.doCollectObservable(object, this.clone);
        this.doNotCollectObservables = true;
        this.currentIndex = 0;
    }
    doCollectObservable(object, clone$$1) {
        if (isArray(object)) {
            for (let i = 0, len = object.length; i < len; i++) {
                this.doFindObservable(object, i, clone$$1);
            }
        }
        else if (isObject(object) && Object.getPrototypeOf(object) === Object.prototype) {
            for (const key in object) {
                this.doFindObservable(object, key, clone$$1);
            }
        }
        else {
            throw new Error('Invalid object passed to combineTemplate');
        }
    }
    doFindObservable(base, key, context) {
        const value = base[key];
        if (value instanceof Observable) {
            this.push({ context, key, value });
            context[key] = value;
        }
        else if (isArray(value)) {
            context[key] = value.slice();
            this.doCollectObservable(base[key], context[key]);
        }
        else if (isObject(value) && Object.getPrototypeOf(value) === Object.prototype) {
            context[key] = Object.assign({}, value);
            this.doCollectObservable(base[key], context[key]);
        }
        else {
            context[key] = value;
        }
    }
}
function combineTemplate(object) {
    const updater = new ObservableUpdater();
    updater.collect(object);
    return updater.mapObservablesToValue();
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Create intent handler from Intent StateHandler.
 * @param intent Intent StateHandler instance.
 * @returns IntentHandler implementation.
 */
function generateIntentHandler(intent$$1) {
    const intentCallable = (key, args) => {
        intent$$1.push(key, args);
    };
    intentCallable.callback = (k, v) => intent$$1.callback(k, v);
    return intentCallable;
}
/**
 * Group of stores.
 * That merge multiple store state to one monolithic state.
 */
class StoreGroup {
    constructor(intent$$1, stores, service) {
        this.intent = intent$$1;
        this.stores = stores;
        this.service = service;
        this.storeInstances = [];
    }
    /**
     * @returns Merged state.
     */
    initialize() {
        // Reduce to create one monolithic state.
        return this.stores.reduce((state, Store) => {
            const store = new Store(this.intent, this.service);
            const nextState = store.initialize();
            this.storeInstances.push(store);
            for (const key in nextState) {
                if (state[key]) {
                    state[key] = Object.assign({}, state[key], nextState[key]);
                }
                else {
                    state[key] = nextState[key];
                }
            }
            return state;
        }, { view: {} });
    }
    getStores() {
        return this.storeInstances;
    }
}
class Provisioning {
    constructor(context, IntentClass, Store, service, intentAdvice = v => v) {
        this.context = context;
        this.service = service;
        this.intentAdvice = intentAdvice;
        this.isDisposed = false;
        this.handlerSubscriptions = [];
        this.cache = null;
        this.IntentClass = IntentClass;
        const stores = this.storeConstructors = isArray(Store) ? Store : [Store];
    }
    dispose(removeCache = true) {
        this.isDisposed = true;
        this.subscription.unsubscribe();
        this.subscription = null;
        this.intent.dispose();
        this.handlerSubscriptions.forEach(s => s.unsubscribe());
        if (removeCache) {
            this.cache = null;
        }
    }
    prepare() {
        if (this.isDisposed) {
            this.intent.prepare(this.context.__intent);
        }
        else if (!this.intent) {
            this.intent = new Intent(this.context.__intent);
        }
        if (!this.cache) {
            this.cache = {};
            const intentInstance = this.cache.intentInstance = this.intentAdvice(new this.IntentClass(Object.assign({ intent: this.intent.response }, mapValues(getHandlers(), v => v.response))));
            const storeGroup = this.cache.storeGroup = new StoreGroup(intentInstance, this.storeConstructors, this.service);
            const intentHandler = this.cache.intentHandler = generateIntentHandler(this.intent);
            this.cache.storeState = storeGroup.initialize();
            this.cache.stores = storeGroup.getStores();
        }
        if (this.isDisposed || !this.subscription) {
            const state = Object.assign({}, this.cache.storeState);
            this.subscribeHandler(this.cache.storeState);
            if (this.context) {
                for (const key in this.context.state) {
                    if (state[key]) {
                        state[key] = Object.assign({}, state[key], this.context.state[key]);
                    }
                }
            }
            this.subscription = combineTemplate(state).subscribe(state => {
                this.intent.setState(state);
                forIn(getHandlers(), v => v.setState(state));
            });
        }
        this.isDisposed = false;
    }
    getStores() {
        return this.cache.storeGroup.getStores();
    }
    getState() {
        return this.cache.storeState;
    }
    getIntentHandler() {
        return this.cache.intentHandler;
    }
    getIntentInstance() {
        return this.cache.intentInstance;
    }
    getIntent() {
        return this.intent;
    }
    subscribeHandler(state) {
        const handlers = getHandlers();
        for (const key in handlers) {
            this.handlerSubscriptions.push(handlers[key].subscribe(state));
        }
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Container component for intent and state.
 * This component provide context object and props from store state.
 *
 * @example
 * <Provider store={Store} intent={Intent}>
 *   <Component />
 * </Provider>
 */
class Provider extends Component {
    constructor(p, c) {
        super(p, c);
        this.provisioning = new Provisioning(this.context, this.props.intent, this.props.store, this.props.service);
        const { provisioning, context } = this;
        this.ProviderComponent = class ProviderComponent extends Component {
            render() {
                return this.props.children;
            }
            getChildContext() {
                return {
                    intent: provisioning.getIntentHandler(),
                    state: provisioning.getState(),
                    parent: context,
                    __intent: provisioning.getIntent()
                };
            }
            static get childContextTypes() {
                return Provider.contextTypes;
            }
        };
    }
    render() {
        return (createElement(this.ProviderComponent, null, cloneElement(this.props.children, this.childrenProps)));
    }
    componentWillUnmount() {
        this.provisioning.dispose(!this.props.useCache);
    }
    componentWillMount() {
        this.provisioning.prepare();
        this.childrenProps = Object.assign({}, omit(this.props, ['store', 'intent', 'service', 'children']), this.provisioning.getState().view || {});
    }
    componentWillReceiveProps(nextProps) {
        this.childrenProps = Object.assign({}, omit(nextProps, ['store', 'intent', 'service', 'children']), this.provisioning.getState().view || {});
    }
}
Provider.contextTypes = { intent: any, state: any, parent: any, __intent: any };

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
function getProcess() {
    if (!window['process'] || !window['process'].env) {
        return {
            env: {
                NODE_ENV: 'debug'
            }
        };
    }
    return window['process'];
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
const process = getProcess();
/**
 * Steal $$typeof symbol from dummy element.
 */
/*tslint:disable:no-string-literal*/
const REACT_ELEMENT_TYPEOF = createElement('div', {})['$$typeof'];
/*tslint:enable:no-string-literal*/
const SYMBOL_KEY = '@@ReactMviSubscriber';
/**
 * If this symbol was set to static property,
 * that mean this component is process Observable.
 */
const SUBSCRIBER_MARK = typeof Symbol === 'function' ? Symbol(SYMBOL_KEY) : SYMBOL_KEY;
/**
 * Information about embedded observables and ReactElement.
 */
class ObservableBinding {
    constructor(updater, _observable) {
        this.updater = updater;
        this._observable = _observable;
    }
    /**
     * Return Observable that flow BindingObservableType.
     */
    observable() {
        return this._observable.map(value => ({ value, binding: this }));
    }
    /**
     * Update target element props or child.
     */
    update(value) {
        this.updater(value);
    }
}
/**
 * Identity function to return children.
 */
const EmptyRoot = props => props.children;
/**
 * Subscriber component for Rx.Observable.
 * This component provide an ability that subscribe rxjs stream props by auto detection of children components.
 */
class Subscriber extends Component {
    constructor(p, c) {
        super(p, c);
        /**
         * All Embeded Observable informations.
         */
        this.bindings = [];
        /**
         * Observable list that is pushed observable embeded in virtual dom trees.
         */
        this.observableList = [];
        /**
         * Cloned mutable children tree.
         */
        this.mutableTree = null;
        this.hasObservable = false;
        this.hasObservable = this.areThereObservableInChildren(createElement(EmptyRoot, null, this.props.children));
        // State has virtual dom tree that are covered by this component.
        this.state = {
            vdom: this.hasObservable ? null : this.props.children
        };
    }
    /**
     * Rendering new vdom trees that
     * props are replaced by result value of observable.
     */
    render() {
        return this.state.vdom;
    }
    /**
     * Subscribe all observable that embeded in vdom trees.
     */
    componentWillMount() {
        if (this.hasObservable) {
            this.mutableTree = this.cloneChildren(createElement(EmptyRoot, null, this.props.children), null, null);
            this.subscribeAll();
        }
    }
    /**
     * Reset all subscriptions and re subscribe all observables.
     */
    componentWillReceiveProps(nextProps) {
        this.disposeAll();
        this.hasObservable = this.areThereObservableInChildren(createElement(EmptyRoot, null, nextProps.children));
        if (this.hasObservable) {
            this.mutableTree = this.cloneChildren(createElement(EmptyRoot, null, nextProps.children), null, null);
            this.subscribeAll();
        }
        else {
            this.setState({ vdom: nextProps.children });
        }
    }
    /**
     * Subscribe changes of observables.
     * If observable was updated, children components are updated and rerendered.
     */
    subscribeAll() {
        if (this.bindings.length > 0) {
            const bindings = this.bindings.map(binding => binding.observable());
            this.subscription = Observable.combineLatest(...bindings).subscribe((bindings) => {
                bindings.forEach(({ value, binding }) => binding.update(value));
                this.setState({ vdom: this.createMutableElement(this.mutableTree) });
            });
        }
        else {
            this.setState({ vdom: this.props.children });
        }
    }
    /**
     * Reset all subscriptions.
     */
    componentWillUnmount() {
        this.disposeAll();
    }
    /**
     * Dispose all subscriptions and clear bindings.
     */
    disposeAll() {
        this.subscription && this.subscription.unsubscribe();
        this.subscription = null;
        this.bindings = [];
    }
    /**
     * Update children elements.
     * @param el A parent ReactElement.
     */
    updateChildren(el, value, index) {
        if (el.props.children && isArray(el.props.children)) {
            if (isArray(value)) {
                el.props.children = el.props.children.slice(0, index).concat(value);
            }
            else {
                el.props.children[index] = value;
            }
            if (process.env.NODE_ENV === 'debug') {
                // Check valid element or not
                createElement(el.type, el.props, ...el.props.children);
            }
        }
        else {
            el.props.children = value;
            if (process.env.NODE_ENV === 'debug') {
                // Check valid element or not
                createElement(el.type, el.props, el.props.children);
            }
        }
    }
    /**
     * Create mutable ReactElement trees.
     * @param el A source ReactElement.
     * @returns Mutable ReactElement like json.
     */
    createMutableElement(el) {
        /*tslint:disable:no-object-literal-type-assertion*/
        /*tslint:disable:no-string-literal*/
        return {
            $$typeof: REACT_ELEMENT_TYPEOF,
            type: el.type,
            props: clone(el.props),
            ref: el['ref'],
            key: el.key,
            _owner: el['_owner']
        };
        /*tslint:enable:no-object-literal-type-assertion*/
        /*tslint:enable:no-string-literal*/
    }
    /**
     * Clone all children trees that has mutable props, mutable children, recursively from root.
     * @param el Root React.ReactElement.
     */
    areThereObservableInChildren(el, depth = 0) {
        if (el instanceof Observable) {
            return true;
        }
        else {
            const target = filter(el.props ? (el.props.children ? (!isArray(el.props.children) ? [el.props.children] : el.props.children) : []) : [], v => isDefined(v));
            const checkChildren = () => target.some((child, i) => {
                if (child instanceof Observable) {
                    return true;
                }
                if (this.props.ignoreSubtree && depth === 1) {
                    return false;
                }
                return this.areThereObservableInChildren(child, depth + 1);
            });
            const props = el.props;
            const checkProps = () => some(omit(props, 'children'), (v, k) => {
                return v instanceof Observable;
            });
            return checkChildren() || checkProps();
        }
    }
    /**
     * Clone all children trees that has mutable props, mutable children, recursively from root.
     * @param el Root React.ReactElement.
     */
    cloneChildren(el, parent, index, depth = 0) {
        const newElement = this.createMutableElement(el);
        forIn(omit(newElement.props, 'children'), (v, k) => {
            if (v instanceof Observable) {
                this.bindings.push(new ObservableBinding(value => {
                    newElement.props[k] = value;
                    this.updateElement(parent, newElement, index);
                }, v));
            }
        });
        if (this.props.ignoreSubtree && depth === 1) {
            return newElement;
        }
        const target = filter(newElement.props.children ?
            (!isArray(newElement.props.children) ? [newElement.props.children] : newElement.props.children) : [], v => isDefined(v));
        const children = map(target, (child, i) => {
            if (child instanceof Observable) {
                this.bindings.push(new ObservableBinding(value => {
                    this.updateChildren(newElement, value, i);
                    this.updateElement(parent, newElement, index);
                }, child));
            }
            else if (isValidElement(child) && !this.isSubscriber(child)) {
                return this.cloneChildren(child, newElement, i, depth + 1);
            }
            return child;
        });
        if (newElement.props.children) {
            if (isArray(newElement.props.children)) {
                newElement.props.children = children;
            }
            else {
                newElement.props.children = children[0];
            }
        }
        return newElement;
    }
    /**
     * Update ReactElement to force update state of React Element Tree.
     * @param parent Parent ReactElement of current updated ReactElement.
     * @param el Updated ReactElement.
     */
    updateElement(parent, el, index) {
        if (parent) {
            this.updateChildren(parent, this.createMutableElement(el), index);
        }
        else {
            this.mutableTree = this.createMutableElement(el);
        }
    }
    /**
     * Check whether child is Subscriber or not.
     * @param child Child to check.
     * @returns Return true is passed element type is Subscriber constructor or has SUBSCRIBER_MARK.
     */
    isSubscriber(child) {
        return child.type && (child.type === Subscriber || child.type[SUBSCRIBER_MARK]);
    }
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Convert string html tag to Subscriber.
 */
const toSubscribable = (name) => {
    const ret = (_a = class extends Component {
            render() {
                return (createElement(Subscriber, { ignoreSubtree: this.props.ignoreSubtree }, createElement(name, assign(omit(this.props, ['ref', 'ignoreSubtree']), { ref: 'element' }))));
            }
        },
        _a.displayName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`,
        _a);
    ret[SUBSCRIBER_MARK] = true;
    return ret;
    var _a;
};
const Tags = {};
`a abbr address area article aside audio b base bdi bdo big blockquote body br
button canvas caption cite code col colgroup data datalist dd del details dfn
dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5
h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li
link main map mark menu menuitem meta meter nav noscript object ol optgroup
option output p param picture pre progress q rp rt ruby s samp script section
select small source span strong style sub summary sup table tbody td textarea
tfoot th thead time title tr track u ul var video wbr`.replace(/\n/g, ' ').split(' ').forEach(tag => {
    const exportName = `${tag.charAt(0).toUpperCase()}${tag.slice(1)}`;
    Tags[exportName] = toSubscribable(tag);
});

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
const DEFAULT = { mapStateToProps: undefined, mapIntentToProps: undefined };
const CONTEXT_TYPES = {
    intent: any,
    state: any,
    parent: any
};
/**
 * Connect store and intent to store.
 * @param args mapStateToProps convert store state to Component props.
 * mapIntentToProps convert intent to props.
 * @returns Function that wrap passed component with Context component.
 */
function connect(args = DEFAULT) {
    const { mapStateToProps = s => s, mapIntentToProps = i => ({}) } = args;
    return (C) => {
        // Set context type to passed to component.
        C.contextTypes = CONTEXT_TYPES;
        const displayName = `${C.name || C.displayName || 'AnonymousComponent'}$EnhancedReactMVIContextConnectorComponent`;
        /**
         * Component wrapper that pass context to children component
         */
        return _a = class extends Component {
                constructor(p, c) {
                    super(p, c);
                    this.mappedProps = Object.assign({}, mapStateToProps(this.props), mapIntentToProps(this.context.intent));
                }
                render() {
                    return createElement(C, Object.assign({}, this.mappedProps));
                }
                componentWillReceiveProps(nextProps) {
                    this.mappedProps = Object.assign({}, mapStateToProps(nextProps), mapIntentToProps(this.context.intent));
                }
                getChildContext() {
                    return {
                        intent: this.context.intent,
                        state: this.context.state,
                        parent: this.context.parent
                    };
                }
                static get childContextTypes() {
                    return CONTEXT_TYPES;
                }
            },
            _a.displayName = displayName,
            _a.contextTypes = CONTEXT_TYPES,
            _a;
        var _a;
    };
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Stateless component utils.
 * @example
 * const Component = view((props, context) => {
 *   return <div></div>;
 * })
 */
function view(renderer, displayName) {
    return _a = class extends Component {
            render() {
                return renderer(this.props, this.context);
            }
            static get displayName() {
                return displayName || 'StatelessView';
            }
        },
        _a.contextTypes = CONTEXT_TYPES,
        _a;
    var _a;
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Decorator to set specified type as context type.
 * @param target A class constructor.
 */
function context(target) {
    target.contextTypes = CONTEXT_TYPES;
    return target;
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
const STORE_SYMBOL = symbol('@@reactMVIStore');
/**
 * Store decorator that assign intent to instance property.
 */
function store(Base) {
    function EnhancedStore(intent, services) {
        this.intent = intent;
        if (services) {
            extend(this, services);
        }
        Base.call(this, intent);
    }
    EnhancedStore[STORE_SYMBOL] = true;
    EnhancedStore.prototype = Base.prototype;
    return EnhancedStore;
}

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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

export { Provider, SUBSCRIBER_MARK, Subscriber, Tags, CONTEXT_TYPES, connect, view, context, STORE_SYMBOL, store, getHandlers, registerHandlers, removeHandler, HandlerResponse, StreamStore, StateHandler, MethodInvocation, intent, Intent, isDefined, assign, extend, omit, forIn, isObject, isArray, isRegExp, filter, map, some, every, mapValues, clone, symbol, Provisioning };
