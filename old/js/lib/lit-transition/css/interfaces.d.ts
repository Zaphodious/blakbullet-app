import { TemplateResult } from 'lit-html';
/**
 * in-out: enter transition starts playing right away
 * out-in: enter transition only plays after leave completed
 * both: both transitions play immediately
 */
export declare enum TransitionMode {
    InOut = "in-out",
    OutIn = "out-in",
    Both = "both"
}
/**
 * in-out: enter transition starts playing right away
 * out-in: enter transition only plays after leave completed
 * both: both transitions play immediately
 */
export declare enum GeometryLockMode {
    None = 0,
    Lock = 1,
    Auto = "auto"
}
export interface CSSClassSequence {
    active?: string;
    from?: string;
    to?: string;
    lock?: GeometryLockMode;
}
export interface CSSTransitionOptions {
    css?: TemplateResult | string | null;
    duration?: Number;
    enter?: CSSClassSequence | Boolean;
    leave?: CSSClassSequence | Boolean;
    mode?: TransitionMode;
    skipHidden?: Boolean;
    onEnter?: Function;
    onLeave?: Function;
    onAfterEnter?: Function;
    onAfterLeave?: Function;
}
export declare type CSSTransitionOptionsGenerator = (opts?: any) => CSSTransitionOptions;
//# sourceMappingURL=interfaces.d.ts.map