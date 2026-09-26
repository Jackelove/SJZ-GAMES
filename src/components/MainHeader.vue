<script setup lang="ts">
import { useRouter } from 'vue-router';
import { toast } from './ToastHost.vue';

const router = useRouter();
const go = (p: string) => router.push('/' + p);
const contact = () => toast('客服功能演示', 'warn');
</script>

<template>
  <header class="main-header">
    <div class="header-in">
      <div class="logo" @click="go('home')">
        <div class="logo-icon">蒙</div>
        蒙多商行
      </div>
      <div class="header-actions">
        <button class="btn-header dark" @click="go('publish')">发布出租</button>
        <button class="btn-header gold" @click="contact">收售AWM</button>
        <button class="btn-header outline" @click="contact">客服</button>
      </div>
    </div>
  </header>
</template>