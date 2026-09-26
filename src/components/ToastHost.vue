<script lang="ts">
import { ref } from 'vue';

export interface ToastItem {
  id: number;
  msg: string;
  type: 'ok' | 'warn' | 'err';
}

const toasts = ref<ToastItem[]>([]);
let seq = 0;

export function toast(msg: string, type: ToastItem['type'] = 'ok') {
  const id = ++seq;
  toasts.value.push({ id, msg, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 2600);
}

export default {
  name: 'ToastHost',
  setup() {
    return { toasts };
  }
};
</script>

<template>
  <div id="toast">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="['toast', t.type === 'ok' ? '' : t.type]"
    >{{ t.msg }}</div>
  </div>
</template>