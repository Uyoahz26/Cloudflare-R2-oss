import Unocss from "unocss/vite";
import Vue from "@vitejs/plugin-vue";
import Autoprefixer from "autoprefixer";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import { Vuetify3Resolver } from "unplugin-vue-components/resolvers";

export default ({ mode }) => {
  const __DEV__ = mode === "development";

  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: __DEV__ ? "/" : "./",
    plugins: [
      Vue(),
      Unocss(),
      AutoImport({
        imports: ["vue", "vue-router"],
        resolvers: [Vuetify3Resolver()],
        dts: "./types/auto-imports.d.ts",
      }),
      Components({
        resolvers: [Vuetify3Resolver()],
        dts: "./types/components.d.ts",
      }),
    ],
    resolve: {
      alias: {
        "@": `${resolve(__dirname, "src")}`,
      },
    },
    css: {
      postcss: {
        plugins: [
          Autoprefixer,
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import '@/styles/base/variables.scss';`,
          api: "modern-compiler",
        },
      },
    },
    server: {
      host: true,
      port: 12138,
      proxy: {
        "/api": {
          target: "https://uyoahz.site",
          // target: "http://127.0.0.1:8788",
          changeOrigin: true,
        },
      },
    },
    build: {
      target: "es2020",
      cssTarget: "chrome80",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      outDir: "../dist",
    },
  });
};
