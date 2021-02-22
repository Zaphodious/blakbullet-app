import { NodePart } from 'lit-html';
/**
 * schedules css transitons
 * @param part NodePart that is to be rendered
 * @param classes classes to be applied as part of css flow
 * @param global global params to be merged with flow-specific params
 */
export declare const flow: {
    transition(part: NodePart, classes: any, global: any): Promise<void>;
    init({ data, remove, add, transition }: {
        data: any;
        remove: any;
        add: any;
        transition: any;
    }): void;
};
//# sourceMappingURL=flow.d.ts.map