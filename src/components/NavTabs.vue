<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const tabs = [
  { key: 'home', label: '首页' },
  { key: 'hall', label: '租号大厅' },
  { key: 'user', label: '个人中心' },
  { key: 'faq', label: '常见问题' }
];

const active = computed(() => {
  const p = route.path.split('/')[1];
  return p === 'detail' ? 'hall' : p;
});

const go = (key: string) => router.push('/' + key);
</script>

<template>
  <div class="nav-tabs-wrap">
    <div class="nav-tabs">
      <a
        v-for="t in tabs"
        :key="t.key"
        :class="{ on: active === t.key }"
        @click="go(t.key)"
      >{{ t.label }}</a>
    </div>
  </div>
</template>