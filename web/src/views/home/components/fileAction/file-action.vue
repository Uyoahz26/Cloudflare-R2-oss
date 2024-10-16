<template>
  <v-bottom-sheet v-model="showSheet" inset>
    <v-list>
      <div class="flex flex-col items-center mb-20px" v-if="showSheet">
        <img
          :src="
            targetFile?.path
              ? FileFolder
              : targetFile?.customMetadata.thumbnail
                ? `/raw/_$flaredrive$/thumbnails/${targetFile?.customMetadata.thumbnail}.png`
                : getFileIcon(targetFile)
                  ? getFileIcon(targetFile)
                  : null
          "
          width="80"
        />
        <v-chip color="primary" label>
          <span class="font-bold">
            {{ targetFile?.key ?? targetFile?.path }}</span
          >
        </v-chip>
      </div>
      <v-divider></v-divider>
      <v-list-subheader>选择操作</v-list-subheader>
      <v-list-item
        v-for="action in fileOptions"
        :key="action.value"
        :value="action"
      >
        <v-list-item-title class="text-center">{{
          action.text
        }}</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item value="close">
        <v-list-item-title class="text-center" @click="targetFile = null"
          >关闭</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>
<script setup lang="ts">
import FileFolder from "@/assets/images/file-folder.svg";
import { getFileIcon } from "@/utils/help";
defineOptions({
  name: "FileAction",
});

const targetFile = defineModel() as Ref<Record<string, any> | null>;

const showSheet = computed({
  get: () => {
    console.log("targetFile.value", targetFile.value);
    return !!targetFile.value;
  },
  set: (value) => {
    if (!value) {
      targetFile.value = null;
    }
  },
});

const fileOptions = computed(() => {
  const publicMethod = [
    {
      text: "复制链接",
      value: "copyLink",
    },
    {
      text: "删除",
      value: "delete",
    },
  ];
  if (targetFile.value?.key) {
    publicMethod.unshift(
      {
        text: "重命名",
        value: "rename",
      },
      {
        text: "下载",
        value: "download",
      }
    );
  }
  return publicMethod;
});
</script>
