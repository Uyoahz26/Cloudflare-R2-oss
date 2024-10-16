import { defineStore } from "pinia";
export interface CommonState {
  token: string;
  QQ: string;
}

export const useCommonStore = defineStore("uyoahzOSS", {
  state: (): CommonState => {
    return {
      token: "",
      QQ: "",
    };
  },
  persist: {
    key: "uyoahz-oss",
    storage: window.localStorage,
  },
});
