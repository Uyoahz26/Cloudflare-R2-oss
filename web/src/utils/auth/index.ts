import { useCommonStore } from "@/stores/modules/common";
import { router } from "@/routers";
import { msgs } from "../help";

export const checkout = async (): Promise<void> => {
  useCommonStore().$reset();
  msgs("无权限，先登录", "error");
  // router.replace("/");
};

export const checkToken = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!getToken()) {
      checkout();
      reject("登录失效，请重新登录");
    } else {
      resolve();
    }
  });
};

export const getToken = (): string => {
  return useCommonStore().token;
};

export const setToken = (token: string): void => {
  if (token) {
    useCommonStore().$patch({
      token,
    });
  } else {
    router.replace("/login");
  }
};
