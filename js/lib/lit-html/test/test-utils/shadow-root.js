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
import { render } from '../../lib/shady-render.js';
/**
 * A helper for creating a shadowRoot on an element.
 */
export const renderShadowRoot = (result, element) => {
    if (!element.shadowRoot) {
        element.attachShadow({ mode: 'open' });
    }
    render(result, element.shadowRoot, { scopeName: element.localName });
};
//# sourceMappingURL=shadow-root.js.map