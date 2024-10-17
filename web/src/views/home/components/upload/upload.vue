<template>
  <v-btn
    class="fixed! bottom-20px right-13px"
    variant="tonal"
    icon="fa-cloud-upload"
    @click="showSheet = true"
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
        @click="handleAction(action.value as FileType)"
      >
        <v-list-item-title class="text-center">
          <v-icon size="x-small" :icon="action.icon"></v-icon>
          {{ action.text }}
        </v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item
        value="close"
        @click="(showSheet = false), (uploadType = '')"
      >
        <v-list-item-title class="text-center font-bold!"
          >关闭</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>
<script setup lang="ts">
import { put } from "@/hooks/useRequest";
import { msgs } from "@/utils/help";
import axios from "axios";

defineOptions({
  name: "Upload",
});

const props = defineProps<{
  cwd: string;
}>();

type FileType = "camera" | "media" | "file" | "folder";

const showSheet = ref(true);
const uploadFile = ref<File | null>(null);
const uploadType = ref<FileType | "">("");
const uploadProgress = ref(0);
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

const inputFileType = computed(
  () =>
    ({
      camera: "image/*",
      media: "image/*,video/*",
      file: "*",
    })[uploadType.value] ?? "*"
);

const handleAction = async (type: FileType) => {
  uploadType.value = type;
  console.log("uploadType: ", uploadType.value);
  await nextTick();
  uploadInputRef.value?.click();
};

const onFileChange = (e: Event) => {
  console.log("inputFileType.value", inputFileType.value);
  const target = e.target as HTMLInputElement;
  handleOnUpload(target.files);
  console.log("target.files: ", target.files);

  // if (target.files && target.files.length) {
  //   uploadFile.value = target.files[0];
  // }
};

const handleOnUpload = async (files) => {
  let fileDir = props.cwd;
  if (fileDir && !fileDir.endsWith("/")) {
    fileDir += "/";
  }
  const upLoadFiles = Array.from(files).map((file) => ({
    baseDir: fileDir,
    file,
  }));
  const uploading = msgs("正在上传...");
  console.log("upLoadFiles", upLoadFiles);
  try {
    for await (const upFile of upLoadFiles) {
      console.log("upFile: ", upFile);
      const { file, baseDir } = upFile as { file: File; baseDir: string };
      const uploadUrl = `/api/write/items/${baseDir}${file.name}`;
      const onUploadProgress = (progressEvent) => {
        uploadProgress.value =
          (progressEvent.loaded * 100) / progressEvent.total;
        console.log("uploadProgress.value", uploadProgress.value);
      };
      await put(uploadUrl, file, { onUploadProgress });
    }
    // await uploadFiles(upLoadFiles);
  } catch (error) {
    console.log("error: ", error);
    msgs("上传失败...", "error");
  } finally {
    uploadInputRef.value!.value = "";
    uploading();
  }
};
</script>
