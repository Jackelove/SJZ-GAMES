<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useShopStore } from '@/stores/shop';
import TopBar from '@/components/TopBar.vue';
import MainHeader from '@/components/MainHeader.vue';
import NavTabs from '@/components/NavTabs.vue';
import FixedRail from '@/components/FixedRail.vue';
import ToastHost, { toast } from '@/components/ToastHost.vue';
import ModalHost from '@/components/ModalHost.vue';

const store = useShopStore();
const route = useRoute();
const ready = ref(false);

onMounted(async () => {
  try {
    await Promise.all([
      store.refreshConfig(),
      store.refreshUser(),
      store.refreshOrders()
    ]);
    ready.value = true;
  } catch (e) {
    toast('连接服务器失败，请检查后端是否启动', 'err');
    // 即使后端挂了也让路由渲染出来，方便调试
    ready.value = true;
  }
});

watch(
  () => route.path,
  () => window.scrollTo(0, 0)
);
</script>

<template>
  <TopBar />
  <MainHeader />
  <NavTabs />
  <router-view v-if="ready" />
  <FixedRail />
  <ToastHost />
  <ModalHost />
</template>