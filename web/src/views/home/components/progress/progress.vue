<template>
  <v-progress-circular
    :model-value="props.value"
    :rotate="360"
    :size="160"
    :width="20"
    :color="value === 100 ? 'teal' : 'blue-grey'"
  >
    <template #default>
      <span class="text-22px font-bold">
        {{ value === 100 ? "上传成功" : value.toFixed() + " %" }}
      </span>
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
