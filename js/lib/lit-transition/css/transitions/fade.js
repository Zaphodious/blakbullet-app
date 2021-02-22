import { instantiateDefault, mergeObjects } from '../utils.js';
export const fade = instantiateDefault('fade.js', function fade(opts = {}) {
    const { duration = 500, ease = 'ease-out', opacity = 0.0 } = opts;
    return mergeObjects({
        enter: {
            active: 'fade-enter-active',
            from: 'fade-enter-from',
            to: 'fade-enter-to',
        },
        leave: {
            active: 'fade-leave-active',
            from: 'fade-leave-from',
            to: 'fade-leave-to',
            lock: true
        },
        css: `
    .fade-leave-active {
      position: fixed;
      transition: opacity ${duration}ms ${ease}, transform ${duration}ms ${ease};
    }
    .fade-enter-active {
      transition: opacity ${duration}ms ${ease}, transform ${duration}ms ${ease};
    }
  .fade-enter-from, .fade-leave-to {
    opacity: ${opacity};
  }
  .fade-enter-to, .fade-leave-from {
    opacity: 1;
  }
  `,
    }, opts);
});
//# sourceMappingURL=fade.js.map