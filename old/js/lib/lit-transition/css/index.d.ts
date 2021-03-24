import { CSSTransitionOptions, CSSTransitionOptionsGenerator } from './interfaces.js';
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
export declare const transition: (elem: any, opts?: CSSTransitionOptions | CSSTransitionOptionsGenerator) => (container: import("lit-html").NodePart) => Promise<void>;
//# sourceMappingURL=index.d.ts.map