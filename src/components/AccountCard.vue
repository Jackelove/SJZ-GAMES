<script setup lang="ts">
import type { Account } from '@/types';
import { useShopStore } from '@/stores/shop';
import { useRouter } from 'vue-router';

const props = defineProps<{ account: Account }>();
const store = useShopStore();
const router = useRouter();

const goDetail = () => router.push('/detail/' + props.account.id);
</script>

<template>
  <div
    class="card"
    :class="{ 'is-rented': account.status === 'rented' }"
    @click="goDetail"
  >
    <div class="card-cover">
      <div
        class="game-bg"
        :style="{
          background: `linear-gradient(135deg, ${store.gameColor(account.game)[0]}, ${store.gameColor(account.game)[1]})`
        }"
      ></div>
      <div class="game-txt">{{ account.game }}</div>
      <div class="level-txt">{{ account.level }}</div>

      <div
        v-if="account.status === 'rented'"
        class="discount-badge"
        style="background:linear-gradient(135deg,#64748b,#94a3b8)"
      >出租中</div>
      <div
        v-else-if="account.ownerId === 'u_me'"
        class="discount-badge"
        style="background:linear-gradient(135deg,#10b981,#059669)"
      >我的</div>
      <div v-else-if="account.discount" class="discount-badge">{{ account.discount }}</div>

      <div v-if="account.online" class="online-badge">号主在线</div>
    </div>

    <div class="card-body">
      <div class="card-title">{{ account.title }}</div>
      <div class="card-tags">
        <span v-for="t in (account.tags || []).slice(0, 3)" :key="t">{{ t }}</span>
      </div>
      <div class="card-foot">
        <div class="card-price"><em>¥</em><b>{{ account.hourPrice }}</b><span>/小时</span></div>
        <div class="card-dep">押金 ¥{{ account.deposit }}</div>
      </div>
      <div class="insure-tag">🛡️ 押金秒退 · 订单结束押金秒退</div>
    </div>
  </div>
</template>