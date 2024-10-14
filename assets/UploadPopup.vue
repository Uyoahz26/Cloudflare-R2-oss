<script setup>
import MimeIcon from "./MimeIcon.vue";
defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "upload", "createFolder"]);
</script>
<template>
  <div class="popup">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="popup-modal"
        @click.stop="emit('update:modelValue', false)"
      ></div>
    </Transition>
    <Transition name="slide-up">
      <div v-if="modelValue" class="popup-content">
        <div class="button-grid">
          <button onclick="this.lastElementChild.click()">
            <MimeIcon thumbnail="assets/images/camera.svg" />
            <span>拍照上传</span>
            <input
              type="file"
              accept="image/*"
              capture="camera"
              hidden
              @change="emit('upload', $event.target)"
            />
          </button>
          <button onclick="this.lastElementChild.click()">
            <MimeIcon thumbnail="assets/images/photo.svg" />
            <span>图片/视频</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              @change="emit('upload', $event.target)"
            />
          </button>
          <button onclick="this.lastElementChild.click()">
            <MimeIcon thumbnail="assets/images/file.svg" />
            <span>文件</span>
            <input
              type="file"
              accept="*"
              multiple
              hidden
              @change="emit('upload', $event.target)"
            />
          </button>
          <button type="button" @click="emit('createFolder')">
            <MimeIcon thumbnail="assets/images/folder.svg" />
            <span>新建文件夹</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.popup-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-color: #0000005e;
  backdrop-filter: blur(3px);
}

.popup-content {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 2;
  border-radius: 16px 16px 0 0;
  background-color: white;
  box-shadow: 0px -3px 20px 0px #0000008a;
  height: 90px;
}

.popup .button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  padding: 8px;
}

.popup button {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: 12px;
}

.popup svg {
  width: 32px;
  height: 32px;
  margin: 8px;
}
</style>
