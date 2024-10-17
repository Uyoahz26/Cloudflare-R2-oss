<template>
  <div class="flex flex-col h-100vh">
    <TabBar
      :keyword="searchKey"
      v-model:sort-way="sortWay"
      @update:keyword="searchKey = $event.trim().toLowerCase()"
    />
    <div
      class="bg-[#fff] rounded-4px flex-1 max-h-[calc(100vh-55px)] overflow-hidden"
    >
      <v-pull-to-refresh
        :pull-down-threshold="66"
        @load="getFileList"
        class="h-full overflow-y-scroll pl-10px mt-5px"
      >
        <v-list-item
          v-if="cwd"
          :key="cwd"
          @click="cwd = cwd.replace(/[^\/]+\/$/, '')"
        >
          <v-list-item-title
            :key="cwd"
            class="flex items-center gap-x-6px select-none"
          >
            <img
              :src="getFileIcon({ path: true })"
              :width="42"
              alt="Image"
              loading="lazy"
            />
            <p class="tracking-0.2px font-500 truncate">返回上一级..</p>
          </v-list-item-title>
        </v-list-item>
        <v-empty-state
          v-if="!loading && !foldersResult.length && !filesResult.length"
          title="空！！"
        />
        <transition-group
          :name="deletingFlag ? 'fileList' : ''"
          tag="div"
          class="file-list grid gap-10px grid-cols-[repeat(4,_1fr)]"
        >
          <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>
          <v-list-item
            v-for="folder in foldersResult"
            :key="folder.path"
            :value="folder.path"
            @click="cwd = folder.path"
          >
            <v-list-item-title
              class="flex items-center gap-x-6px select-none relative"
            >
              <div class="relative">
                <img
                  :src="getFileIcon(folder)"
                  :width="42"
                  alt="Image"
                  loading="lazy"
                />
                <template v-if="folder.qqID">
                  <img
                    class="absolute left-10px top-12px rounded-full h-22px opacity-80"
                    :src="`https://q1.qlogo.cn/g?b=qq&nk=${folder.qqID}&s=640`"
                  />
                </template>
              </div>
              <p class="tracking-0.2px font-500 truncate">
                {{ folder.path.split("/").filter(Boolean).pop() }}
              </p>
              <v-chip
                v-if="folder.qqID === store.QQ"
                color="primary"
                size="small"
              >
                <span class="font-bold">This is yours</span>
              </v-chip>
              <div class="absolute right-1 hidden file-more-action">
                <v-btn
                  density="compact"
                  variant="text"
                  size="small"
                  icon="$menu"
                  color="#656669"
                  @click.stop="targetFile = folder"
                />
              </div>
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            v-for="file in filesResult"
            :key="file.key"
            :value="file.key"
          >
            <v-list-item-title
              class="flex items-center gap-x-6px select-none relative"
            >
              <img
                :src="getFileIcon(file)"
                :width="36"
                loading="lazy"
                class="cursor-pointer"
                @click.stop="preview(file.key)"
              />
              <div class="cursor-pointer" @click.stop="preview(file.key)">
                <p class="file-list-name">{{ file.key.split("/").pop() }}</p>
                <div class="text-[#8d8d8d] text-0.8em tracking-0.3px">
                  <span>{{ new Date(file.uploaded).toLocaleString() }}</span>
                  <span class="ml-10px">{{ formatSize(file.size) }}</span>
                </div>
              </div>
              <div class="absolute right-1 hidden file-more-action">
                <v-btn
                  density="compact"
                  variant="text"
                  size="small"
                  icon="$menu"
                  color="#656669"
                  @click.stop="targetFile = file"
                />
              </div>
            </v-list-item-title>
          </v-list-item>
        </transition-group>
      </v-pull-to-refresh>
      <!-- <Progress :value="40" />
      <div>
        <span class="text-size-14px text-[#73767c]">欢迎使用系统！</span>
        <v-btn variant="tonal"> Button </v-btn>
      </div>
      <div class="text-center pa-4">
        <v-btn @click="dialog = true"> Open Dialog </v-btn>

        <v-dialog v-model="dialog" width="auto">
          <v-card
            max-width="400"
            prepend-icon="mdi-update"
            text="Your application will relaunch automatically after the update is complete."
            title="Update in progress"
          >
            <template v-slot:actions>
              <v-btn class="ms-auto" text="Ok" @click="dialog = false"></v-btn>
            </template>
          </v-card>
        </v-dialog>
      </div> -->
    </div>
  </div>
  <Upload :cwd />
  <FileAction v-model="targetFile" @delete="onDelete" @refresh="getFileList" />
</template>
<script lang="ts" setup>
import Upload from "./components/upload/upload.vue";
import TabBar from "./components/tabBar/tabBar.vue";
import FileAction from "./components/fileAction/file-action.vue";
import { VPullToRefresh } from "vuetify/labs/VPullToRefresh";
import Progress from "./components/progress/progress.vue";
import { get } from "@/hooks/useRequest";

import { getFileIcon, formatSize } from "@/utils/help";
import { useCommonStore } from "@/stores/modules/common";

const store = useCommonStore();

const loading = ref(false);
const sortWay = ref();
const dialog = ref(false);
const targetFile = ref();
const cwd = ref("");
const searchKey = ref("");
const deletingFlag = ref(false);
const files = ref<Record<string, string>[]>([]);
const folders = ref<Record<string, string>[]>([]);

const filesResult = computed(() => {
  let resultFiles = files.value;
  if (searchKey.value) {
    resultFiles = files.value;
    files.value.filter((item) =>
      item.key.toLowerCase().includes(searchKey.value)
    );
  }
  if (sortWay.value?.value) {
    const sortKey = sortWay.value.value;
    resultFiles.sort((a, b) => {
      switch (sortKey) {
        case "smallToBig":
          return +a.size - +b.size;
        case "bigToSmall":
          return +b.size - +a.size;
        default:
          return a.key.localeCompare(b.key);
      }
    });
  }
  return resultFiles;
});
const foldersResult = computed(() => {
  console.log("searchKey.value: ", searchKey.value);
  if (!searchKey.value) return folders.value;
  return folders.value.filter((item) =>
    item.path.toLowerCase().includes(searchKey.value)
  );
});

watch(
  () => cwd.value,
  () => {
    getFileList();
    const url = new URL(window.location.href);
    if ((url.searchParams.get("p") || "") !== cwd.value) {
      cwd.value
        ? url.searchParams.set("p", cwd.value)
        : url.searchParams.delete("p");
      window.history.pushState(null, "", url.toString());
    }
    document.title = `${cwd.value.replace(/.*\/(?!$)|\//g, "") || "/"} - 文件库`;
  }
);

const getFileList = async (event?): Promise<void> => {
  folders.value.length = 0;
  files.value.length = 0;
  loading.value = true;
  try {
    // const data = await get("/api/children");
    const data = await get(`/api/children${cwd.value ? "/" + cwd.value : ""}`, {
      requestOptions: {
        globalRawData: true,
        globalCheckToken: false,
      },
    });
    folders.value = data.folders ?? [];
    files.value = data.value ?? [];
  } finally {
    loading.value = false;
    event?.done();
  }
};
getFileList();

const preview = (path: string) => window.open(`/raw/${path}`);

const onDelete = (target): void => {
  deletingFlag.value = true;
  const targetData = target.path ? folders.value : files.value;
  const compareFied = target.path ? "path" : "key";
  const index = targetData.findIndex(
    (v) => v[compareFied] === target[compareFied]
  );
  targetData.splice(index, 1);
  setTimeout(() => {
    deletingFlag.value = false;
  }, 400);
};
</script>
<style lang="scss" scoped>
@media only screen and (max-width: 768px) {
  .file-list {
    padding-bottom: 90px;
    grid-template-columns: none;
    .file-more-action {
      display: block;
    }
  }
}
.v-list-item {
  &:hover {
    .file-more-action {
      display: block;
    }
  }
}

.fileList-move,
.fileList-enter-active,
.fileList-leave-active {
  position: relative;
  transition: all 0.666s cubic-bezier(0.55, 0, 0.1, 1);
}
.fileList-leave-to {
  opacity: 0;
}
.fileList-leave-active {
  transform: scaleY(0.1);
  position: absolute;
  bottom: 0;
  width: 100%;
}

.file-list-name {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.23px;
  font-weight: 400;
  max-width: 80vw;
}
</style>
