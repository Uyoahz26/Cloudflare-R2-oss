<template>
  <v-btn
    class="fixed! bottom-20px right-13px"
    variant="tonal"
    icon="fa-cloud-upload"
    @click="showSheet = true"
  />
  <v-bottom-sheet v-model="showSheet" inset class="select-none">
    <v-list>
      <v-list-subheader>选择操作</v-list-subheader>
      <v-list-item
        v-for="action in operationList"
        :key="action.value"
        :value="action.value"
      >
        <v-list-item-title class="text-center">
          <v-icon size="x-small" :icon="action.icon"></v-icon>
          {{ action.text }}
        </v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item value="close">
        <v-list-item-title
          class="text-center font-bold!"
          @click="showSheet = false"
          >关闭</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>
<script setup lang="ts">
defineOptions({
  name: "Upload",
});

const showSheet = ref(false);
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
</script>
