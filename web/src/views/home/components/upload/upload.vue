<template>
  <v-overlay
    v-model="progressProps.show"
    scroll-strategy="block"
    class="flex justify-center items-center bg-#edf2fab0!"
    persistent
    contained
  >
    <Progress :value="progressProps.value" />
  </v-overlay>
  <v-btn
    class="fixed! bottom-20px right-13px"
    variant="tonal"
    icon="fa-cloud-upload"
    @click="controlSheet(true)"
  />
  <v-bottom-sheet v-model="showSheet" inset class="select-none">
    <input
      ref="uploadInputRef"
      type="file"
      :accept="inputFileType"
      :multiple="uploadType === 'media'"
      :capture="uploadType === 'camera' ? 'environment' : false"
      hidden
      @change="onFileChange"
    />
    <v-list>
      <v-list-subheader>选择操作</v-list-subheader>
      <v-list-item
        v-for="action in operationList"
        :key="action.value"
        :value="action.value"
        :disabled="!getToken()"
        @click="handleAction(action.value as FileType)"
      >
        <v-list-item-title class="text-center">
          <v-icon size="x-small" :icon="action.icon"></v-icon>
          {{ action.text }}
        </v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item value="close" @click="controlSheet(false)">
        <v-list-item-title class="text-center font-bold!"
          >关闭</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
  <v-dialog
    v-model="dialogShow"
    width="auto"
    :persistent="loading"
    class="select-none"
  >
    <v-card
      :loading
      width="400px"
      class="px-10px!"
      prepend-icon="fa-pencil-square-o"
      title="新建文件夹"
    >
      <template #text>
        <v-text-field
          ref="folderRef"
          v-model="folderName"
          :loading
          :rules="[
            (v) => !!v || '文件名必填!',
            (v) => /^[a-zA-Z0-9_.-]+$/.test(v) || '文件名不能包含特殊字符!',
            (v) =>
              !foldersPath.includes(v.toLocaleLowerCase() + '/') ||
              `文件夹 ${v} 已存在!`,
          ]"
          label="文件夹名称"
        />
      </template>
      <template #actions>
        <v-btn
          :disabled="loading"
          text="取消"
          variant="plain"
          size="small"
          @click="(folderName = ''), (dialogShow = false)"
        />
        <v-btn
          :loading
          color="primary"
          text="确定"
          variant="tonal"
          size="small"
          @click="handleCreateFolder"
        />
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import Progress from "../progress/progress.vue";
import { msgs } from "@/utils/help";
import { getToken } from "@/utils/auth";
import { put } from "@/hooks/useRequest";
import { multipartUpload, SIZE_LIMIT, uploadImgThumbnail } from "./helper";
defineOptions({
  name: "Upload",
});

type FileType = "camera" | "media" | "file" | "folder";

const emit = defineEmits(["refresh"]);
const props = defineProps<{
  cwd: string;
  folders: Record<string, string>[];
}>();

const folderRef = ref();
const folderName = ref("");
const loading = ref(false);
const showSheet = ref(false);
const dialogShow = ref(false);
const uploadType = ref<FileType | "">("");
const progressProps = ref({
  show: false,
  value: 0,
});
const uploadInputRef = ref<HTMLInputElement | null>(null);

const operationList = readonly([
  {
    text: "拍照上传",
    icon: "fa-camera-retro",
    value: "camera",
  },
  {
    text: "图片/视频",
    icon: "fa-file-image-o",
    value: "media",
  },
  {
    text: "上传文件",
    icon: "fa-file",
    value: "file",
  },
  {
    text: "新建文件夹",
    icon: "fa-folder-open",
    value: "folder",
  },
]);

const foldersPath = computed(() =>
  props.folders.map((item) => item.path.toLocaleLowerCase())
);
const inputFileType = computed(
  () =>
    ({
      camera: "image/*",
      media: "image/*,video/*",
      file: "*",
    })[uploadType.value] ?? "*"
);

const controlSheet = (status: boolean) => {
  if (status && !getToken()) {
    msgs("请先登录...", "error");
    return;
  }
  showSheet.value = status;
};

const handleAction = async (type: FileType) => {
  if (type === "folder") {
    dialogShow.value = true;
    return;
  }
  uploadType.value = type;
  await nextTick();
  uploadInputRef.value?.click();
};

const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files ?? [];
  if (!files.length) return;

  let fileDir = props.cwd;
  if (fileDir && !fileDir.endsWith("/")) {
    fileDir += "/";
  }
  const upLoadFiles = Array.from(files).map((file) => ({
    baseDir: fileDir,
    file,
  }));
  const uploading = msgs("正在上传...");
  try {
    unref(progressProps).show = true;
    for await (const upFile of upLoadFiles) {
      let thumbnailDigest = "";
      const { file, baseDir } = upFile as { file: File; baseDir: string };
      if (file.type.startsWith("image/") || file.type === "video/mp4") {
        thumbnailDigest = await uploadImgThumbnail(file);
      }
      const uploadUrl = `/api/write/items/${baseDir}${file.name}`;
      const headers = {};
      if (thumbnailDigest) {
        headers["fd-thumbnail"] = thumbnailDigest;
      }
      const onUploadProgress = (progressEvent) => {
        unref(progressProps).value =
          (progressEvent.loaded * 100) / progressEvent.total;
      };
      if (file.size >= SIZE_LIMIT) {
        await multipartUpload(`${baseDir}${file.name}`, file, {
          headers,
          onUploadProgress,
        });
      } else {
        await put(uploadUrl, file, { headers, onUploadProgress });
      }
    }
    uploading();
    setTimeout(async () => {
      progressProps.value.show = false;
      controlSheet(false);
      emit("refresh");
      setTimeout(() => {
        progressProps.value.value = 0;
      }, 500);
    }, 1000);
  } catch (error) {
    uploading();
    msgs(error?.["message"] || "上传失败", "error");
    progressProps.value = {
      show: false,
      value: 0,
    };
  } finally {
    unref(uploadInputRef)!.value = "";
  }
};

const handleCreateFolder = async () => {
  const validate = await folderRef.value?.validate();
  if (validate.length) return;
  loading.value = true;
  try {
    const uploadUrl = `/api/write/items/${props.cwd}${folderName.value}/_$folder$`;
    await put(uploadUrl);
    loading.value = false;
    showSheet.value = false;
    dialogShow.value = false;
    emit("refresh");
    folderName.value = "";
  } catch {
    loading.value = false;
  }
};
</script>
<style lang="scss" scoped>
::v-deep(.v-overlay__scrim) {
  background: unset !important;
}
</style>
