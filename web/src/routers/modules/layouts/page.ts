import type { RouteRecordRaw } from "vue-router";

export const page: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home/index.vue"),
  },
];
