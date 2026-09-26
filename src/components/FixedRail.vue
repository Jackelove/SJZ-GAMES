<script setup lang="ts">
import { useRouter } from 'vue-router';
import { toast } from './ToastHost.vue';

const router = useRouter();

const items = [
  { ico: '📢', label: '发布出租', action: () => router.push('/publish') },
  { ico: '👤', label: '个人中心', action: () => router.push('/user') },
  { ico: '💎', label: '云股东', action: () => toast('云股东开发中', 'warn') },
  { ico: '🔔', label: '消息中心', action: () => toast('消息中心开发中', 'warn') },
  { ico: '💬', label: '联系客服', action: () => toast('客服功能演示', 'warn') }
];
</script>

<template>
  <div class="fixed-rail">
    <div class="rail-logo" @click="router.push('/home')"><b>蒙</b>CLUB</div>
    <div
      v-for="it in items"
      :key="it.label"
      class="rail-item"
      @click="it.action"
    >
      <span class="ri">{{ it.ico }}</span>
      <span>{{ it.label }}</span>
    </div>
  </div>
</template>