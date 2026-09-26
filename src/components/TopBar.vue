<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useShopStore } from '@/stores/shop';
import { toast } from './ToastHost.vue';

const router = useRouter();
const store = useShopStore();

const goUser = () => router.push('/user');
const contact = () => toast('客服功能演示', 'warn');
const logout = () => toast('已退出登录（演示）', 'warn');
const toggleMode = () => toast('夜间模式开发中');
</script>

<template>
  <div class="top-bar">
    <div class="top-in">
      <div class="top-left">欢迎来到 <span>蒙多商行平台</span>！</div>
      <div class="top-right">
        <a @click="goUser">我的订单</a>
        <a @click="goUser">我的钱包</a>
        <a @click="contact">联系客服</a>
        <span class="divider"></span>
        <div class="mode-toggle" @click="toggleMode"><span>🌙</span><span>夜间</span></div>
        <span class="divider"></span>
        <span>183****2142</span>
        <a @click="goUser">用户</a>
        <a class="logout" @click="logout">退出</a>
      </div>
    </div>
  </div>
</template>