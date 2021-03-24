import { TransitionMode, GeometryLockMode } from '../interfaces.js';
import { instantiateDefault, mergeObjects } from '../utils.js';
/**
 * simple slide transition
 * TODO
 */
export const slide = instantiateDefault('slide', function slide(opts = {}) {
    const { left, right, up, down } = opts;
    let simple = {};
    left && (simple = {
        x: '-100%',
        x1: '100%' // .. and in from left
    });
    right && (simple = {
        x: '100%',
        x1: '-100%' // .. and in from left
    });
    up && (simple = {
        y: '100%',
        y1: '-100%' // .. and in from left
    });
    down && (simple = {
        y: '-100%',
        y1: '100%' // .. and in from left
    });
    let { mode, duration = 500, x = '100%', y = '0%', x1 = '', y1 = '', ease = 'ease-out', leavePosition = '', opacity = 0.0, } = Object.assign(Object.assign({}, simple), opts);
    x1 = x1 || x;
    y1 = y1 || y;
    return mergeObjects({
        enter: {
            active: 'slide-enter-active',
            from: 'slide-enter-from'
        },
        leave: {
            active: 'slide-leave-active',
            to: 'slide-leave-to',
            lock: GeometryLockMode.Auto
        },
        css: `
    .slide-enter-active {
      transition: transform ${duration}ms ${ease}, opacity ${duration}ms ${ease};
    }
    .slide-leave-active {
      position: ${leavePosition
            || (mode !== TransitionMode.OutIn ? 'absolute' : 'initial')};
      transition: transform ${duration}ms ${ease}, opacity ${duration}ms ${ease};
    }
    .slide-leave-to {
      opacity: ${opacity};
      transform: translate(${x}, ${y});
    }
    .slide-enter-from {
      opacity: ${opacity};
      transform: translate(${x1}, ${y1});
    }`,
        mode
    }, opts);
});
//# sourceMappingURL=slide.js.map