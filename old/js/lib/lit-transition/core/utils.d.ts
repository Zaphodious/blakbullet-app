import { NodePart, TemplateResult } from 'lit-html';
export declare function nextFrame(n?: number): Promise<void>;
/**
 * resolves once the class attribute of a node
 * has been consolidated
 * @param node DOMNode
 */
export declare function classChanged(node: HTMLElement, cb: Function | null, skipFrame?: Boolean): Promise<unknown>;
export declare function partDomSingle(part: NodePart): any;
export declare function mark(templateResult: TemplateResult, name: String): TemplateResult;
export declare function marked(templateResult: TemplateResult): String | undefined;
/**
 * tries to figure out if the geometry of an object
 * should be locked. will return true if e will have
 * position: absolute and parent has position: relative;
 * @param e element
 * @param activeCass className that would be applied
 */
export declare function needsLock(e: HTMLElement, activeClass: string): boolean;
/**
 * records geometry of a dom node so it can
 * be reaplied later on
 */
export declare function recordExtents(e: any): {
    left: number;
    top: number;
    width: any;
    height: any;
};
/**
 * applies left,top,width and height form ext
 * also sets marginLeft+Top to 0
 * @param e HTMLElement to apply extents to
 * @param ext extents object
 */
export declare function applyExtents(e: HTMLElement, ext: any): void;
export declare function pageVisible(): Boolean;
//# sourceMappingURL=utils.d.ts.map