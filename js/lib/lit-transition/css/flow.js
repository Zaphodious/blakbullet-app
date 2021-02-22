import { html } from '../../lit-html/lit-html.js';
import classList from '../core/class-list.js';
import { partDomSingle, applyExtents, recordExtents, classChanged, needsLock } from '../core/utils.js';
import { GeometryLockMode } from './interfaces.js';
/**
 * schedules css transitons
 * @param part NodePart that is to be rendered
 * @param classes classes to be applied as part of css flow
 * @param global global params to be merged with flow-specific params
 */
export const flow = {
    async transition(part, classes, global) {
        // destructure params
        const { duration = global.duration, active, from, to, lock } = classes;
        // will throw if dom does not expose exactly one
        // non-text node
        const dom = partDomSingle(part);
        if (!dom) {
            // animation was cancelled?
            return;
        }
        //const parent = dom.parentNode;
        let extents;
        if (lock) {
            if (lock !== GeometryLockMode.Auto || active && needsLock(dom, active)) {
                extents = recordExtents(dom);
            }
        }
        await new Promise(async (resolve) => {
            const cl = classList(dom);
            const add = (c) => Array.isArray(c) ?
                c.forEach((i) => cl.add(i)) : cl.add(c);
            const remove = (c) => Array.isArray(c) ?
                c.forEach((i) => cl.remove(i)) : cl.remove(c);
            // in this case we apply a previously recorded
            // geometry
            if (extents) {
                applyExtents(dom, extents);
            }
            // called once transition is completed
            function done(e) {
                if (e) {
                    // if e is set we have an actual event
                    if (e.target !== dom) {
                        // bubbled up from someone else, ignore..
                        return;
                    }
                    // this event was meant for us
                    // we handle it definitively
                    e.preventDefault();
                    e.stopPropagation();
                }
                // Remove all the other excess hooks
                ['transitionend', 'transitioncancel',
                    'animationend', 'animationcancel']
                    .filter(type => !e || type !== e.type)
                    .forEach(type => dom.removeEventListener(type, done));
                // remove all classes we added and resolve
                active && remove(active);
                from && remove(from);
                to && remove(to);
                resolve();
            }
            // Register these hooks before we set the css
            // class es that will trigger animations
            // or transitions
            const o = { once: true };
            if (duration) {
                setTimeout(done, duration);
            }
            else {
                dom.addEventListener('transitionrun', function () {
                    dom.addEventListener('transitionend', done, o);
                    dom.addEventListener('transitioncancel', done, o);
                }, o);
                dom.addEventListener('animationstart', function () {
                    dom.addEventListener('animationend', done, o);
                    dom.addEventListener('animationcancel', done, o);
                }, o);
            }
            // add actual transition classes
            from && await classChanged(dom, () => add(from));
            active && await classChanged(dom, () => add(active));
            from && remove(from);
            to && add(to);
        });
    },
    // injects style tags
    init({ data, remove, add, transition }) {
        if (data._cssSource !== transition.css) {
            data.css && remove(data.css);
            if (!!transition.css) {
                // only init css if it has changed!
                data._cssSource = transition.css;
                let css = transition.css;
                css = typeof css === 'string' ? html `<style>${css}</style>` : css;
                data.css = add(css);
            }
        }
    }
};
//# sourceMappingURL=flow.js.map