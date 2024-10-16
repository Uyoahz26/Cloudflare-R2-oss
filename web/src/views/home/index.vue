<template>
  <div class="flex flex-col h-100vh">
    <TabBar
      :keyword="searchKey"
      v-model:sort-way="sortWay"
      @update:keyword="searchKey = $event.trim().toLowerCase()"
    />
    <div
      class="bg-[#fff] rounded-4px mb-5px p-10px flex-1 max-h-[calc(100vh-50px)] overflow-y-scroll"
    >
      <v-pull-to-refresh :pull-down-threshold="66" @load="getFileList">
        <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>
        <v-empty-state
          v-else-if="!foldersResult.length && !filesResult.length"
          title="空！！"
        />
        <transition-group
          :name="deletingFlag ? 'fileList' : ''"
          tag="div"
          class="file-list grid gap-10px grid-cols-[repeat(4,_1fr)]"
        >
          <v-list-item
            v-for="(folder, index) in foldersResult"
            :key="folder.path"
            :value="folder.path"
            @click="folders.splice(index, 1)"
          >
            <v-list-item-title
              class="flex items-center gap-x-6px select-none relative"
            >
              <div class="relative">
                <img :src="FileFolder" :width="42" alt="Image" loading="lazy" />
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
                This is yours
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
            v-for="(file, index) in filesResult"
            :key="file.key"
            :value="file.key"
            @click="files.splice(index, 1)"
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
                  <span v-text="formatSize(file.size)"></span>
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
  <FileAction v-model="targetFile" />
</template>
<script lang="ts" setup>
import TabBar from "./components/tabBar/tabBar.vue";
import FileAction from "./components/fileAction/file-action.vue";
import FileFolder from "@/assets/images/file-folder.svg";
import { VPullToRefresh } from "vuetify/labs/VPullToRefresh";
import Progress from "./components/progress/progress.vue";
import { get } from "@/hooks/useRequest";

import { getFileIcon, formatSize } from "@/utils/help";
import { useGetLoading } from "@/hooks/useLoading";
import { useCommonStore } from "@/stores/modules/common";

const store = useCommonStore();

const loading = useGetLoading();
const sortWay = ref(null);
const dialog = ref(false);
const searchKey = ref("");
const deletingFlag = ref(true);
const targetFile = ref();
const files = ref<Record<string, string>[]>([]);
const folders = ref<Record<string, string>[]>([]);

const filesResult = computed(() => {
  if (!searchKey.value) return files.value;
  return files.value.filter((item) =>
    item.key.toLowerCase().includes(searchKey.value)
  );
});
const foldersResult = computed(() => {
  console.log("searchKey.value: ", searchKey.value);
  if (!searchKey.value) return folders.value;
  return folders.value.filter((item) =>
    item.path.toLowerCase().includes(searchKey.value)
  );
});

const getFileList = async (event?) => {
  folders.value.length = 0;
  files.value.length = 0;
  const data = await get("/api/children");
  console.log("data: ", data);
  folders.value = data.folders ?? [];
  files.value = data.value ?? [];
  event?.done();
};
getFileList();

const preview = (path: string) => window.open(`/raw/${path}`);
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
