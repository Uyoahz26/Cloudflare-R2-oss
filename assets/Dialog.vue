<script setup>
defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="dialog-mask"
      @click="emit('update:modelValue', false)"
    >
      <div class="dialog-container">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
  background-color: #9c9c9cb3;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
}

.dialog-container {
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: -1px 4px 16px 0px #27272778;
  margin-top: 80px;
}
</style>
