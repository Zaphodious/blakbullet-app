import { directive } from '../../lit-html/lit-html.js';
import { transitionBase } from '../core/transition-base.js';
import { fade as defaultTransition } from './transitions/fade.js';
import { normalizeCSSTransitionOptions } from './utils.js';
import { flow } from './flow.js';
/**
 * re-export interfaces
 */
export * from './interfaces.js';
/**
 * re-export predefined transitions
 */
export * from './transitions/index.js';
/**
 * re-export mark
 */
export { mark } from '../core/utils.js';
/**
 * this is the actual directive
 */
export const transition = directive(function (elem, opts = defaultTransition) {
    if (typeof opts === 'function') {
        opts = opts();
    }
    return transitionBase(flow)(elem, normalizeCSSTransitionOptions(opts));
});
//# sourceMappingURL=index.js.map