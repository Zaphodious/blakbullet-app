export function transition_stop(elem) {
    if (elem.elem) {
        elem = elem.elem
    }
    return new Promise((resolve, reject) => {
        function onend(e) {
            elem.removeEventListener('transitionend', onend)
            elem.removeEventListener('transitioncancel', onend)
            resolve()
        }
        try {
            elem.addEventListener('transitionend', onend)
            elem.addEventListener('transitioncancel', onend)
        } catch {
            resolve()
        }
    })
}