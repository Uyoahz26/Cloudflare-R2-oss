import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { page } from "./modules/layouts/page";

export const routes: RouteRecordRaw[] = [
  ...page,
  {
    path: "/:pathMatch(.*)*",
    name: "error404",
    component: () => import("@/views/error/404.vue"),
    meta: {
      title: "404",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes,
});
export { router };
