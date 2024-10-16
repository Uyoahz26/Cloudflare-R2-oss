export function debouncedRef(value, delay = 500) {
  let timer;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },

      set(val) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          value = val;
          trigger();
        }, delay);
      },
    };
  });
}
