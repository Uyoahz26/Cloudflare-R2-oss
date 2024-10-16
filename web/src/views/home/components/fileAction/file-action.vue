<template>
  <v-bottom-sheet v-model="showSheet" inset class="select-none">
    <v-list>
      <div class="flex flex-col items-center mb-20px" v-if="showSheet">
        <img class="my-10px" :src="getFileIcon(targetFile)" width="100" />
        <v-chip color="primary" label class="px-8px! h-26px!">
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
        <v-list-item-title
          class="text-center"
          :class="{
            'text-red-500': action.value === 'delete',
          }"
          @click="handleFileAction(action.value)"
        >
          <v-icon size="x-small" :icon="action.icon"></v-icon>
          {{ action.text }}
        </v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item value="close">
        <v-list-item-title
          class="text-center font-bold!"
          @click="targetFile = null"
          >关闭</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
  <v-dialog v-model="deleteDialog" width="auto">
    <v-card
      :loading
      width="400"
      class="px-10px!"
      prepend-icon="fa-exclamation-triangle"
      title=""
    >
      <template #text>
        <div class="text-center">
          确定要删除
          <v-chip color="red" label class="px-8px! h-26px!">
            <span class="font-bold">
              {{
                targetFile?.key ??
                targetFile?.path.split("/").filter(Boolean).pop()
              }}</span
            >
          </v-chip>
          吗？
        </div>
      </template>
      <template #actions>
        <v-btn
          :disabled="loading"
          text="取消"
          variant="plain"
          size="small"
          @click="deleteDialog = false"
        ></v-btn>
        <v-btn
          :loading
          color="primary"
          text="确定"
          variant="tonal"
          size="small"
          @click="deleteFile"
        ></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { getFileIcon, msgs } from "@/utils/help";
import { Action, FileActions } from "../../types";
import { del } from "@/hooks/useRequest";
defineOptions({
  name: "FileAction",
});

const emit = defineEmits(["delete"]);

const loading = ref(false);

const targetFile = defineModel() as Ref<Record<string, any> | null>;

const deleteDialog = ref(false);

const showSheet = computed({
  get: () => !!targetFile.value,
  set: (value) => {
    if (!value) {
      targetFile.value = null;
    }
  },
});

const fileOptions = computed<FileActions>(() => {
  const publicMethod: FileActions = [
    {
      text: "复制链接",
      value: "copyLink",
      icon: "fa-link",
    },
    {
      text: "删除",
      value: "delete",
      icon: "fa-trash",
    },
  ];
  if (targetFile.value?.key) {
    publicMethod.unshift(
      {
        text: "重命名",
        value: "rename",
        icon: "fa-pencil-square-o",
      },
      {
        text: "下载",
        value: "download",
        icon: "fa-download",
      }
    );
  }
  return publicMethod;
});

const handleFileAction = (action: Action) => {
  console.log("action: ", action);
  console.log("targetFile.value", targetFile.value);
  switch (action) {
    case "delete":
      deleteDialog.value = true;
      break;

    default:
      break;
  }
};

const deleteFile = async () => {
  const key = targetFile.value?.key ?? targetFile.value?.path;
  if (!key) return;
  loading.value = true;
  try {
    await del(`/api/write/items/${key}`, {
      requestOptions: {
        globalSuccessMessage: true,
      },
    });
    loading.value = false;
    deleteDialog.value = false;
    emit("delete", targetFile.value);
    targetFile.value = null;
  } catch {
    loading.value = false;
  }
};
</script>
