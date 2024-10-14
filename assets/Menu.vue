<script setup>
defineProps({
  modelValue: Boolean,
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "click"]);
</script>

<template>
  <div class="menu">
    <Transition name="fade">
      <div
        v-show="modelValue"
        class="menu-modal"
        @click="emit('update:modelValue', false)"
      ></div>
    </Transition>
    <div v-show="modelValue" class="menu-content">
      <ul>
        <li
          v-for="(item, index) in items"
          :key="index"
          @click="
            emit('update:modelValue', false);
            emit('click', item.text);
          "
        >
          <template v-if="item.type === 'dividingLine'">
            <div style="height: 1px; border-top: 1px black solid"></div>
          </template>
          <span v-text="item.text"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.menu-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #00000030;
  z-index: 1;
}

.menu-content {
  position: absolute;
  background-color: white;
  z-index: 2;
  border-radius: 6px;
  right: -100%;
  min-width: 120px;
  box-shadow: 0px 6px 20px #7b7b7b75;
}

.menu-content li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 10px 15px;
}

.menu-content li:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
