/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
// Set Symbol.asyncIterator on browsers without it
if (typeof Symbol !== undefined && Symbol.asyncIterator === undefined) {
    Object.defineProperty(Symbol, 'asyncIterator', { value: Symbol() });
}
/**
 * An async iterable that can have values pushed into it for testing code
 * that consumes async iterables. This iterable can only be safely consumed
 * by one listener.
 */
export class TestAsyncIterable {
    constructor() {
        /**
         * A Promise that resolves with the next value to be returned by the
         * async iterable returned from iterable()
         */
        this._nextValue = new Promise((resolve) => this._resolveNextValue = resolve);
    }
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            while (true) {
                yield yield __await(yield __await(this._nextValue));
            }
        });
    }
    /**
     * Pushes a new value and returns a Promise that resolves when the value
     * has been emitted by the iterator. push() must not be called before
     * a previous call has completed, so always await a push() call.
     */
    async push(value) {
        const currentValue = this._nextValue;
        const currentResolveValue = this._resolveNextValue;
        this._nextValue =
            new Promise((resolve) => this._resolveNextValue = resolve);
        // Resolves the previous value of _nextValue (now currentValue in this
        // scope), making `yield await this._nextValue` go.
        currentResolveValue(value);
        // Waits for the value to be emitted
        await currentValue;
        // Need to wait for one more microtask for value to be rendered, but only
        // when devtools is closed. Waiting for rAF might be more reliable, but
        // this waits the minimum that seems reliable now.
        await Promise.resolve();
    }
}
//# sourceMappingURL=test-async-iterable.js.map