import "vuetify/styles";
import "virtual:uno.css";
import "@/styles/index.scss";
import "font-awesome/css/font-awesome.min.css";

import App from "./App.vue";
import { createApp } from "vue";
import { store } from "@/stores";
import { router } from "@/routers";
import { createVuetify } from "vuetify";
import { aliases, fa } from "vuetify/iconsets/fa4";

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  const vuetify = createVuetify({
    icons: {
      defaultSet: "fa",
      aliases,
      sets: {
        fa,
      },
    },
  });

  app.use(router).use(store).use(vuetify);
  await router.isReady();
  app.mount("#app", true);
  app.config.errorHandler = (err: Error) => {
    console.log(err);
  };
}
bootstrap();
