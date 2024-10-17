<template>
  <v-bottom-sheet v-model="showSheet" inset class="select-none">
    <v-list>
      <div class="flex flex-col items-center mb-20px" v-if="showSheet">
        <img
          class="my-10px"
          :src="getFileIcon(targetFile)"
          width="100"
          :style="{
            animation: showSheet ? 'imgShadow 2s infinite alternate' : 'none',
          }"
        />
        <v-chip
          color="primary"
          label
          class="px-8px! py-3px! h-auto! mx-10px! whitespace-break-spaces!"
        >
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
          @click="processFileAction(action.value)"
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
  <v-dialog v-model="dialogShow" width="auto" :persistent="loading">
    <v-card
      :loading
      width="400px"
      class="px-10px!"
      :prepend-icon="
        DeleteFlag ? 'fa-exclamation-triangle' : 'fa-pencil-square-o'
      "
      title=""
    >
      <template #text>
        <div v-if="DeleteFlag" class="flex items-center">
          确定要删除<v-chip
            color="red"
            label
            class="px-8px! py-3px! h-auto! whitespace-break-spaces!"
          >
            <span class="font-bold">
              {{
                targetFile?.key ??
                targetFile?.path.split("/").filter(Boolean).pop()
              }}</span
            > </v-chip
          >吗？
        </div>
        <v-text-field
          v-else
          ref="renameRef"
          v-model="rename.name"
          :loading
          :required="true"
          :rules="[
            (v) => !!v || '文件名必填!',
            (v) => /^[a-zA-Z0-9_.-]+$/.test(v) || '文件名不能包含特殊字符!',
            (v) => fileName !== v || '新名称不能与旧名称相同!',
          ]"
          :suffix="rename.suffix"
          label="文件名"
        />
      </template>
      <template #actions>
        <v-btn
          :disabled="loading"
          text="取消"
          variant="plain"
          size="small"
          @click="dialogShow = false"
        ></v-btn>
        <v-btn
          :loading
          color="primary"
          text="确定"
          variant="tonal"
          size="small"
          @click="(DeleteFlag ? deleteFile : handleFileRename)()"
        ></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ThemeColor } from "@/utils/colorTheme";
import { getFileIcon, msgs } from "@/utils/help";
import { Action, FileActions } from "../../types";
import { del, put } from "@/hooks/useRequest";
defineOptions({
  name: "FileAction",
});
const emit = defineEmits(["delete", "refresh"]);
const targetFile = defineModel() as Ref<Record<string, any> | null>;

const loading = ref(false);
const dialogShow = ref(false);
const DeleteFlag = ref(false);
const renameRef = ref();
const rename = ref({
  name: "",
  suffix: "",
});

const fileName = computed(() =>
  targetFile.value?.key.split("/").pop().split(".").shift()
);
const showSheet = computed({
  get: () => {
    if (!!targetFile.value) {
      nextTick(() => {
        new ThemeColor(getFileIcon(targetFile.value), (_, color) => {
          const styleSheet =
            document.styleSheets[document.styleSheets.length - 1];
          const keyframes = `
            @keyframes imgShadow {
              0% {
                filter: drop-shadow(0px 0px 1px white);
              }
              100% {
                transform: scale(1.003);
                filter: drop-shadow(2px 4px 6px ${color});
              }
            }
          `;
          styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        });
      });
    }
    return !!targetFile.value;
  },
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

const processFileAction = (action: Action): void => {
  switch (action) {
    case "copyLink":
      handleCopyLink();
      break;
    case "rename":
      const fileSplit = targetFile.value?.key.split("/").pop().split(".");
      const fileSuffix = "." + fileSplit.pop();
      Object.assign(rename.value, {
        suffix: fileSuffix,
        name: fileSplit.join("."),
      });
      DeleteFlag.value = false;
      dialogShow.value = true;
      break;
    case "download":
      const downloadUrl = `/raw/${targetFile.value?.key}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", targetFile.value?.key.split("/").pop());
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      break;
    case "delete":
      DeleteFlag.value = true;
      dialogShow.value = true;
      break;

    default:
      break;
  }
};

const handleCopyLink = (): void => {
  const { key, path } = targetFile.value ?? {};
  const link = key ? `/raw/${key}` : `/?p=${encodeURIComponent(path)}`;
  const url = new URL(link, window.location.origin);
  navigator.clipboard.writeText(url.toString());
  msgs("已复制链接到剪贴板");
};

const handleFileRename = async (): Promise<void> => {
  const validate = await renameRef.value?.validate();
  if (validate.length) return;
  loading.value = true;
  try {
    const fileType = targetFile.value?.key.split(".").pop();
    await put(`/api/write/items/${rename.value.name}.${fileType}`, "", {
      headers: {
        "x-amz-copy-source": encodeURIComponent(targetFile.value?.key),
      },
    });
    await del(`/api/write/items/${targetFile.value?.key}`, {
      requestOptions: {
        globalSuccessMessage: `我重生了,这一世我叫【${rename.value.name}】`,
      },
    });
    loading.value = false;
    dialogShow.value = false;
    targetFile.value = null;
    emit("refresh");
  } catch (error) {
    console.log("rename error: ", error);
    loading.value = false;
  }
};

const deleteFile = async (): Promise<void> => {
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
    dialogShow.value = false;
    emit("delete", targetFile.value);
    targetFile.value = null;
  } catch (e) {
    loading.value = false;
  }
};
</script>
<style lang="scss" scoped>
@media only screen and (max-width: 768px) {
  .v-card {
    width: 80vw !important;
  }
}
</style>
