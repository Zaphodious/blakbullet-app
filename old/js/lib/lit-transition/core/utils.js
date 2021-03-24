import classList from './class-list.js';
export function nextFrame(n = 1) {
    return new Promise(resolve => --n === 0 ? requestAnimationFrame(() => resolve()) :
        resolve(nextFrame(n)));
}
/**
 * get parent skipping over fragments
 * @param elem input element
 */
function parentElement(elem) {
    let e = elem;
    while (e = (e.parentNode || e.host)) {
        if (e instanceof HTMLElement) {
            return e;
        }
    }
    return null;
}
/**
 * resolves once the class attribute of a node
 * has been consolidated
 * @param node DOMNode
 */
export function classChanged(node, cb, skipFrame = true) {
    return new Promise(resolve => {
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(async () => {
            // Later, you can stop observing
            observer.disconnect();
            skipFrame && await nextFrame();
            resolve();
        });
        // Start observing the target node for configured mutations
        observer.observe(node, {
            attributes: true,
            attributeFilter: ["class"]
        });
        cb && cb();
    });
}
/**
 * returns true on ignore dom nodes
 * @param dom
 */
function ignoredDom(dom) {
    var _a;
    return dom.nodeName === '#text' && !((_a = dom.nodeValue) === null || _a === void 0 ? void 0 : _a.trim());
}
function partNodes(part) {
    const collected = [];
    let node = part.startNode.nextSibling;
    while (node !== part.endNode) {
        collected.push(node);
        node = node.nextSibling;
    }
    return collected;
}
export function partDomSingle(part) {
    let nodes = partNodes(part);
    let active = nodes.filter(d => !ignoredDom(d));
    // check part has a shape we accept
    // (i.e. only one non-text node)
    if (active.length != 1) {
        throw new Error(`lit-transition directive expects exactly one child node,
      but was passed ${active.map(a => a.nodeName).join(', ')}`);
    }
    return active[0];
}
/**
 * marked templates are kept in a global weak map
 */
const markedTemplates = new WeakMap();
export function mark(templateResult, name) {
    markedTemplates.set(templateResult, name);
    return templateResult;
}
export function marked(templateResult) {
    return markedTemplates.get(templateResult);
}
/**
 * tries to figure out if the geometry of an object
 * should be locked. will return true if e will have
 * position: absolute and parent has position: relative;
 * @param e element
 * @param activeCass className that would be applied
 */
export function needsLock(e, activeClass) {
    const parent = parentElement(e);
    if (parent) {
        // createa a div with active class to peek if
        // it will be positioned relatively;
        const position = (() => {
            const div = document.createElement('div');
            const cl = classList(div);
            // remove not needed since we detach child alltogether
            const add = (c) => Array.isArray(c) ?
                c.forEach((i) => cl.add(i)) : cl.add(c);
            // use shadowRoot for peeking if available!
            const root = parent.shadowRoot || parent;
            add(activeClass);
            root.appendChild(div);
            const style = window.getComputedStyle(div);
            const position = style.position;
            // peeking done remove child
            root.removeChild(div);
            return position;
        })();
        if (position === 'absolute') {
            const style = window.getComputedStyle(parent);
            return style.position === 'relative';
        }
    }
    return false;
}
/**
 * records geometry of a dom node so it can
 * be reaplied later on
 */
export function recordExtents(e) {
    const rect = e.getBoundingClientRect();
    // // we separately track margins
    // // so in case the changed when the extents
    // // are reapplied (like when a fixed margin is used)
    // // we can compensate
    // const style = window.getComputedStyle(e);
    // const marginTop = parseFloat(style.marginTop) || 0;
    // const marginLeft = parseFloat(style.marginLeft) || 0;
    let top = 0; //-marginTop;
    let left = 0; // -marginLeft;
    {
        let offsetParent = e.offsetParent;
        while (e && e !== document && !(e instanceof DocumentFragment)) {
            if (e === offsetParent) {
                break;
            }
            // not accounting for margins here
            // since in case of margin: auto, offset
            // may actually be the auto margin
            // const style = window.getComputedStyle(e);
            top += e.offsetTop - (e.scrollTop || 0);
            left += e.offsetLeft - (e.scrollLeft || 0);
            e = parentElement(e);
        }
    }
    return {
        left,
        top,
        width: rect.width,
        height: rect.height
    };
}
/**
 * applies left,top,width and height form ext
 * also sets marginLeft+Top to 0
 * @param e HTMLElement to apply extents to
 * @param ext extents object
 */
export function applyExtents(e, ext) {
    e.style.marginLeft = '0px';
    e.style.marginTop = '0px';
    e.style.left = (ext.left) + 'px';
    e.style.top = (ext.top) + 'px';
    e.style.width = (ext.width) + 'px';
    e.style.height = (ext.height) + 'px';
}
let _visible;
function updatePageVisibility(visible = !document.hidden) {
    _visible = visible;
}
updatePageVisibility();
document.addEventListener('visibilitychange', () => updatePageVisibility(), false);
let process = {env:{DEBUG:true}}
if (process.env.DEBUG) {
    // @ts-ignore
    window.updatePageVisibility = updatePageVisibility;
}
export function pageVisible() {
    return _visible;
}
//# sourceMappingURL=utils.js.map