declare class ClassList {
    element: Element;
    classes: Set<string>;
    constructor(element: Element);
    add(cls: string): void;
    remove(cls: string): void;
    commit(): void;
}
export default function (element: Element): DOMTokenList | ClassList;
export declare function setForceClassList(force: Boolean): void;
export {};
//# sourceMappingURL=class-list.d.ts.map