import {
  InterceptorHooks,
  ExpandAxiosResponse,
  BaseApiResponse,
  RequestOptions,
} from "./types";
import { getToken, checkout, checkToken } from "@/utils/auth";
import { useSetLoading } from "@/hooks/useLoading";
import { msgs } from "@/utils/help";

export const transform: InterceptorHooks = {
  requestInterceptor(config) {
    const options = config["requestOptions"] as RequestOptions;

    if (options?.globalCheckToken) {
      const token = getToken();
      if (!token) {
        checkout();
        throw new Error("Token check failed");
      } else {
        config!.headers!.Authorization = "Basic " + token;
      }
    }
    if (options?.globalLoading) {
      useSetLoading(true);
    }
    return config;
  },
  requestInterceptorCatch(err) {
    useSetLoading(false);
    return Promise.reject(err);
  },
  responseInterceptor(result) {
    useSetLoading(false);

    const res = result as ExpandAxiosResponse;
    if (res.status !== 200) {
      return Promise.reject(res);
    }

    const data = res.data;

    const { requestOptions } = res.config;
    if (requestOptions?.globalRawData) {
      return data;
    }
    if (!data.flag && requestOptions?.globalErrorMessage) {
      msgs(data.message, "error");
      return Promise.reject(data);
    }

    const successMsg = requestOptions?.globalSuccessMessage;
    successMsg &&
      msgs(typeof successMsg === "string" ? successMsg : "操作成功", "success");

    return data;
  },
  responseInterceptorCatch(err) {
    if (err.message === "Token check failed") {
      return Promise.reject(err);
    }
    useSetLoading(false);
    const mapErrorStatus = new Map([
      [400, "发出的请求有错误"],
      [401, "么得权限"],
      [403, "服务器拒绝本次访问"],
      [404, "请求资源未找到"],
      [405, "请求方式不正确"],
      [406, "请求的格式不正确"],
      [500, "内部服务器错误"],
      [501, "服务器不支持该请求中使用的方法"],
      [502, "网关错误"],
      [503, "服务不可用"],
      [504, "网关超时"],
    ]);
    const message =
      mapErrorStatus.get(err.response?.status) || "请求出错，请稍后再试";
    msgs(message, "error");
    return Promise.reject(err.response);
  },
};
