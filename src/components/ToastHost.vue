<script lang="ts">
import { ref } from 'vue';

export type ToastType = 'ok' | 'warn' | 'err';

interface ToastItem {
  id: number;
  msg: string;
  type: ToastType;
}

const toasts = ref<ToastItem[]>([]);
let seed = 0;

export function toast(msg: string, type: ToastType = 'ok') {
  const id = ++seed;
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
  <div class="toast-host">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="t.type"
    >
      {{ t.msg }}
    </div>
  </div>
</template>