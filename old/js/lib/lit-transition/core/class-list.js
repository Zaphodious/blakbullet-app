// ripped from here: https://github.com/Polymer/lit-html/blob/master/src/directives/class-map.ts
// IE11 doesn't support classList on SVG elements, so we emulate it with a Set
class ClassList {
    constructor(element) {
        this.classes = new Set();
        this.element = element;
        const classList = (element.getAttribute('class') || '').split(/\s+/);
        for (const cls of classList) {
            this.classes.add(cls);
        }
    }
    add(cls) {
        this.classes.add(cls);
        this.commit();
    }
    remove(cls) {
        this.classes.delete(cls);
        this.commit();
    }
    commit() {
        let classString = '';
        this.classes.forEach((cls) => classString += cls + ' ');
        this.element.setAttribute('class', classString);
    }
}
let forceClassList = false;
export default function (element) {
    return !forceClassList ?
        (element.classList || new ClassList(element)) :
        new ClassList(element);
}
export function setForceClassList(force) {
    forceClassList = force;
}
//# sourceMappingURL=class-list.js.map