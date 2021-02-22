/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
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
/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../node_modules/@types/chai/index.d.ts" />
import { live } from '../../directives/live.js';
import { render } from '../../lib/render.js';
import { html } from '../../lit-html.js';
const assert = chai.assert;
/* eslint-disable @typescript-eslint/no-explicit-any */
class LiveTester extends HTMLElement {
    constructor() {
        super(...arguments);
        this._setCount = 0;
    }
    get x() {
        return this._x;
    }
    set x(v) {
        this._x = v;
        this._setCount++;
    }
}
customElements.define('live-tester', LiveTester);
suite('live', () => {
    let container;
    setup(() => {
        container = document.createElement('div');
    });
    suite('properties', () => {
        test('live() is useful', () => {
            const go = (x) => render(html `<input .value="${x}">}`, container);
            go('a');
            const el = container.firstElementChild;
            el.value = 'b';
            go('a');
            assert.equal(el.value, 'b');
        });
        test('updates an externally set property', () => {
            const go = (x) => render(html `<input .value="${live(x)}">}`, container);
            go('a');
            const el = container.firstElementChild;
            el.value = 'b';
            go('a');
            assert.equal(el.value, 'a');
        });
        test('does not set a non-changed property', () => {
            const go = (x) => render(html `<live-tester .x="${live(x)}"></live-tester>}`, container);
            go('a');
            const el = container.firstElementChild;
            assert.equal(el.x, 'a');
            assert.equal(el._setCount, 1);
            go('a');
            assert.equal(el.x, 'a');
            assert.equal(el._setCount, 1);
        });
    });
    suite('attributes', () => {
        test('updates an externally set attribute', () => {
            const go = (x) => render(html `<div class="${live(x)}">}`, container);
            go('a');
            const el = container.firstElementChild;
            el.className = 'b';
            go('a');
            assert.equal(el.getAttribute('class'), 'a');
        });
        test('does not set a non-changed attribute', async () => {
            let mutationCount = 0;
            const observer = new MutationObserver((records) => {
                mutationCount += records.length;
            });
            const go = (x) => render(html `<div x="${live(x)}"></div>}`, container);
            go('a');
            const el = container.firstElementChild;
            assert.equal(el.getAttribute('x'), 'a');
            observer.observe(el, { attributes: true });
            go('b');
            await new Promise((resolve) => setTimeout(resolve, 0));
            assert.equal(el.getAttribute('x'), 'b');
            assert.equal(mutationCount, 1);
            go('b');
            await new Promise((resolve) => setTimeout(resolve, 0));
            assert.equal(el.getAttribute('x'), 'b');
            assert.equal(mutationCount, 1);
        });
    });
    test('does not set a non-changed attribute with a non-string value', async () => {
        let mutationCount = 0;
        const observer = new MutationObserver((records) => {
            mutationCount += records.length;
        });
        const go = (x) => render(html `<div x="${live(x)}"></div>}`, container);
        go(1);
        const el = container.firstElementChild;
        assert.equal(el.getAttribute('x'), '1');
        observer.observe(el, { attributes: true });
        go(2);
        await new Promise((resolve) => setTimeout(resolve, 0));
        assert.equal(el.getAttribute('x'), '2');
        assert.equal(mutationCount, 1);
        go(2);
        await new Promise((resolve) => setTimeout(resolve, 0));
        assert.equal(el.getAttribute('x'), '2');
        assert.equal(mutationCount, 1);
    });
    suite('boolean attributes', () => {
        test('updates an externally set boolean attribute', () => {
            const go = (x) => render(html `<div ?hidden="${live(x)}"></div>}`, container);
            go(true);
            const el = container.firstElementChild;
            assert.equal(el.getAttribute('hidden'), '');
            go(true);
            assert.equal(el.getAttribute('hidden'), '');
            el.removeAttribute('hidden');
            assert.equal(el.getAttribute('hidden'), null);
            go(true);
            assert.equal(el.getAttribute('hidden'), '');
        });
        test('does not set a non-changed boolean attribute', async () => {
            let mutationCount = 0;
            const observer = new MutationObserver((records) => {
                mutationCount += records.length;
            });
            const go = (x) => render(html `<div ?hidden="${live(x)}"></div>}`, container);
            go(true);
            const el = container.firstElementChild;
            assert.equal(el.getAttribute('hidden'), '');
            observer.observe(el, { attributes: true });
            go(false);
            await new Promise((resolve) => setTimeout(resolve, 0));
            assert.equal(el.getAttribute('hidden'), null);
            assert.equal(mutationCount, 1);
            go(false);
            await new Promise((resolve) => setTimeout(resolve, 0));
            assert.equal(el.getAttribute('hidden'), null);
            assert.equal(mutationCount, 1);
        });
    });
});
//# sourceMappingURL=live_test.js.map