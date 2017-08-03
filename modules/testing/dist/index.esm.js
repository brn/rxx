import { Provisioning, registerHandlers } from '@react-mvi/core';
import { Subject } from 'rxjs/Rx';

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
 *  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * Create functor that is function behave like class.
 * @param {Function} fn The function that want to define methods.
 * @param {Object} props Methods.
 * @returns {Function}
 */
function functor(fn, props) {
    for (const prop in props) {
        fn[prop] = props[prop];
    }
    return fn;
}
/**
 * Exit async function gracefully.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} The function that is notify error to mocha.
 */
const graceful = functor((cb, done, optCallback) => (...args) => {
    let error;
    try {
        cb.apply(undefined, args);
    }
    catch (e) {
        error = e;
    }
    finally {
        optCallback && optCallback();
        done(error);
    }
}, {
    /**
     * Run graceful function.
     * @param {Function} cb Async function.
     * @param {Function} done The Mocha async test case exit callback.
     * @returns {*} Function return value.
     */
    run: (cb, done, optCallback) => graceful(cb, done, optCallback)()
});
/**
 * Create function that exit async test case.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case.
 */
const nothing = (done, optCallback) => () => (optCallback && optCallback(), done());
/**
 * Create function that exit test case if error thrown.
 * @param {Function} cb Async function.
 * @param {Function} done The Mocha async test case exit callback.
 * @returns {Function} Function that exit async test case if error thrown.
 */
const stopOnError = functor((cb, done, optCallback) => (...args) => {
    try {
        return cb.apply(undefined, args);
    }
    catch (e) {
        optCallback && optCallback();
        done(e);
    }
}, {
    run(cb, done, optCallback) {
        return stopOnError(cb, done, optCallback)();
    }
});
class Joiner {
    constructor(time, cb) {
        this.time = time;
        this.cb = cb;
        this.current = 0;
    }
    notify() {
        if (++this.current === this.time) {
            this.cb();
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
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
const sym = s => typeof Symbol === 'function' ? Symbol(s) : `@@${s}`;
const STATE_SYM = sym('ReactMVIMockedIntentState');
const SUBJECT_SYM = sym('ReactMVIMockedIntentSubject');
const BUILTINS = (() => {
    const keys = Object.getOwnPropertyNames(Object.prototype);
    const result = Object.create(null);
    for (let i = 0, len = keys.length; i < len; i++) {
        result[keys[i]] = true;
    }
    result.constructor = true;
    return result;
})();
class Mocker {
    constructor(intent, state) {
        this[SUBJECT_SYM] = {};
        this[STATE_SYM] = state;
        let proto = intent;
        while (proto && proto !== Object.prototype) {
            Object.getOwnPropertyNames(proto).forEach(key => {
                if (this[key] || BUILTINS[key]) {
                    return;
                }
                const descriptor = Object.getOwnPropertyDescriptor(proto, key);
                if (descriptor) {
                    if (typeof descriptor.get === 'function') {
                        const clone = Object.assign({}, descriptor);
                        clone.get = Mocker.proxify(this, key);
                        Object.defineProperty(this, key, clone);
                    }
                    else if (typeof descriptor.value === 'function') {
                        this[key] = Mocker.proxify(this, key);
                    }
                }
            });
            proto = proto.__proto__;
        }
    }
    static proxify(mocker, methodName) {
        mocker[SUBJECT_SYM][methodName] = new Subject();
        return () => {
            return mocker[SUBJECT_SYM][methodName].share();
        };
    }
}
class MockManipulator {
    constructor(mocker) {
        this.mocker = mocker;
    }
    send(name, data = {}) {
        MockManipulator.send(this.mocker, name, data);
    }
    static send(mock, name, data = {}) {
        if (!mock[SUBJECT_SYM][name]) {
            throw new Error(`$[name} is not valid property name.`);
        }
        mock[SUBJECT_SYM][name].next({ data, state: mock[STATE_SYM] });
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
 * Prepare Intent and Store.
 * @param IntentClass Intent constructor.
 * @param StoreClass Store constructor or Array of Store constructor.
 * @param opt Options if contains handlers, call registerHandlers with that,
 * if contains state, set as parent state of intent arguments.
 */
function prepareTest(IntentClass, StoreClass, opt = { state: {} }) {
    if (opt && opt.handlers) {
        registerHandlers(opt.handlers);
    }
    const context = { state: opt.state, __intent: null };
    const provisioning = new Provisioning(context, IntentClass, StoreClass, opt.services || {}, intent => new Mocker(intent, opt.state));
    provisioning.prepare();
    return {
        store: provisioning.getStores()[0],
        stores: provisioning.getStores(),
        mock: new MockManipulator(provisioning.getIntentInstance())
    };
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

export { graceful, nothing, stopOnError, Joiner, prepareTest, Mocker, MockManipulator };
