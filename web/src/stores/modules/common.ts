import { defineStore } from "pinia";
export interface CommonState {
  token: string;
  QQ: string;
  allowFolder: string[];
}

export const useCommonStore = defineStore("uyoahzOSS", {
  state: (): CommonState => {
    return {
      token: "",
      QQ: "",
      allowFolder: [],
    };
  },
  persist: {
    key: "uyoahz-oss",
    storage: window.localStorage,
  },
});
