<script lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const html = ref('');

export function openModal(content: string) {
  html.value = content;
  visible.value = true;
}

export function closeModal() {
  visible.value = false;
  html.value = '';
}

export default {
  name: 'ModalHost',
  setup() {
    return { visible, html, closeModal };
  }
};
</script>

<template>
  <div id="modal" :class="{ show: visible }">
    <div class="modal-mask" @click="closeModal"></div>
    <div class="modal-box" v-html="html"></div>
  </div>
</template>