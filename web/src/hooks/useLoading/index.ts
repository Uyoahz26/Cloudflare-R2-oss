const show = ref(false);
let countLoading = 0;

export function useSetLoading(state: boolean): void {
  countLoading = unref(state) ? countLoading + 1 : countLoading - 1;
  show.value = countLoading > 0;
}

export function useGetLoading(): Ref<boolean> {
  return show;
}
