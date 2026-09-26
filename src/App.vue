<script setup lang="ts">
import TopBar from '@/components/TopBar.vue';
import MainHeader from '@/components/MainHeader.vue';
import NavTabs from '@/components/NavTabs.vue';
import FixedRail from '@/components/FixedRail.vue';
import ToastHost from '@/components/ToastHost.vue';
import ModalHost from '@/components/ModalHost.vue';
</script>

<template>
  <TopBar />
  <MainHeader />
  <NavTabs />
  <router-view />
  <FixedRail />
  <ToastHost />
  <ModalHost />
</template>