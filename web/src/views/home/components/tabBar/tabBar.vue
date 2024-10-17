<template>
  <div
    class="w-100vw bg-#ffffff p-8px shadow-[0px_-3px_13px_0px_#00000073] backdrop-blur-10px z-1 h-50px flex justify-between items-center gap-x-10px"
  >
    <img
      v-if="store.QQ"
      width="35"
      class="rounded-full cursor-pointer"
      :src="`https://q1.qlogo.cn/g?b=qq&nk=${store.QQ}&s=640`"
      @click="loginRef.logout()"
    />
    <v-btn
      v-else
      size="small"
      variant="tonal"
      class="w-20px! h-35px! rounded-full!"
      @click="showDialog = true"
    >
      登录
    </v-btn>
    <input
      type="search"
      class="bg-#f1f1f1d6 border-none flex-1 py-5px px-10px"
      v-model="searchKeyword"
      placeholder="输入文件名检索文件"
    />
    <v-menu location="start">
      <template #activator="{ props }">
        <v-btn
          density="compact"
          variant="text"
          :icon="sortWay ? sortWay.icon : 'fa-reorder'"
          v-bind="props"
        />
      </template>

      <v-list>
        <v-list-item
          v-for="item in sortMethod"
          :key="item.value"
          :value="item.value"
        >
          <v-list-item-title
            class="flex justify-between items-center gap-x-6px"
            @click="sortWay = item"
          >
            <p>{{ item.text }}</p>
            <v-icon size="x-small" :icon="item.icon"></v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
  <v-bottom-sheet v-model="sortPanel" inset persistent>
    <v-card class="text-center" height="280" title="选择排序方式">
      <v-list>
        <v-list-item
          v-for="(item, i) in [
            { text: 'Real-Time', icon: 'mdi-clock' },
            { text: 'Audience', icon: 'mdi-account' },
            { text: 'Conversions', icon: 'mdi-flag' },
          ]"
          :key="i"
          :value="item"
          color="primary"
        >
          <v-list-item-title>
            <v-icon class="w-30px" :icon="item.icon" />
            {{ item.text }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn variant="text" block @click="sortPanel = false">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
  <Login ref="loginRef" v-model="showDialog" />
</template>
<script setup lang="ts">
import { debouncedRef } from "@/hooks";
import Login from "../login/login.vue";
import { useCommonStore } from "@/stores/modules/common";
defineOptions({
  name: "TabBar",
});

const props = defineProps<{
  keyword: string;
  sortWay: { value: string; text: string; icon: string } | null;
}>();

const emit = defineEmits(["update:keyword", "onSortWay"]);

const searchKeyword = debouncedRef(props.keyword, 300);
const sortWay = defineModel("sortWay") as Ref<{
  value: string;
  text: string;
  icon: string;
} | null>;
const store = useCommonStore();
const loginRef = ref();
const showDialog = ref(false);
const sortPanel = ref(false);
const sortMethod = readonly([
  {
    value: "name",
    text: "名称a→z",
    icon: "fa-sort-alpha-asc",
  },
  {
    value: "bigToSmall",
    text: "从大到小",
    icon: "fa-sort-amount-desc",
  },
  {
    value: "smallToBig",
    text: "从小到大",
    icon: "fa-sort-amount-asc",
  },
]);

watch(searchKeyword, (value) => {
  console.log("value: ", value);
  emit("update:keyword", value);
});
</script>
<style lang="scss" scoped>
// ::deep(.search-input)  {
//   .v-field__overlay
// }
</style>
