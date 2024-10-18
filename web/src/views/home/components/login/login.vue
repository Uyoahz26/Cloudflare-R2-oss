<template>
  <v-dialog v-model="dialog" class="max-w-500px" persistent>
    <v-card :loading prepend-icon="fa-user-circle-o" title="登 录">
      <v-card-text>
        <v-form ref="formRef" validate-on="submit lazy">
          <v-text-field
            v-model="formValue.name"
            :counter="20"
            :rules="[(v) => !!v || '用户名必填!']"
            label="用户名"
            required
            clearable
          />
          <v-text-field
            v-model="formValue.password"
            :counter="10"
            :rules="[(v) => !!v || '不输密码拿怂登!']"
            label="密码"
            type="password"
            required
            clearable
          />
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="loading"
          text="不登录"
          variant="plain"
          @click="handleClose"
        ></v-btn>
        <v-btn
          :loading
          color="primary"
          text="登录"
          variant="tonal"
          @click="submitForm"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="exitDialog" class="max-w-500px">
    <v-card prepend-icon="fa-sign-out" text="确定退出登录？" title="提示">
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn @click="exitDialog = false"> 取消 </v-btn>
        <v-btn @click="handleExit" color="primary" variant="tonal">
          确定
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { post } from "@/hooks/useRequest";
import { useGetLoading } from "@/hooks/useLoading";
import { useCommonStore } from "@/stores/modules/common";
defineOptions({
  name: "Login",
});

const exitDialog = ref(false);
const dialog = defineModel() as Ref<boolean>;
const loading = useGetLoading();

const formRef = ref();
const formValue = ref({
  name: "",
  password: "",
});

const submitForm = async (): Promise<void> => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  const { name, password } = formValue.value;
  const loginChar = btoa(encodeURIComponent(`${name}:${password}`));
  const loginInfo = await post(
    "/api/login",
    {
      userLoginChar: loginChar,
    },
    {
      requestOptions: {
        globalSuccessMessage: "登录成功",
        globalCheckToken: false,
      },
    }
  );
  const { UUID, ...rest } = loginInfo.userInfo;
  useCommonStore().$patch({
    ...rest,
    token: UUID,
  });
  handleClose();
};

const handleClose = async (): Promise<void> => {
  dialog.value = false;
  formValue.value = {
    name: "",
    password: "",
  };
};

const handleExit = () => {
  useCommonStore().$reset();
  exitDialog.value = false;
};

const handleOpen = () => {
  exitDialog.value = true;
};

defineExpose({
  logout: handleOpen,
});
</script>
