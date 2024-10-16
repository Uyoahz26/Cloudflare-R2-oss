<template>
  <v-progress-circular
    :model-value="props.value"
    :rotate="360"
    :size="90"
    :width="13"
    color="teal"
  >
    <template #default>
      {{ value === 100 ? "上传成功" : value + " %" }}
    </template>
  </v-progress-circular>
</template>
<script setup lang="ts">
defineOptions({
  name: "Progress",
});
const props = defineProps<{
  value: number;
}>();
</script>
