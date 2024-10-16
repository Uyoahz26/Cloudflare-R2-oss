<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import { useGetLoading } from "@/hooks/useLoading";
const getShowLoading = useGetLoading();
watch(getShowLoading, (value) => {
  console.log("getShowLoading value: ", value);
});
</script>
