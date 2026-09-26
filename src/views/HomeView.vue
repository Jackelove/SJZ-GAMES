<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useShopStore } from '@/stores/shop';
import AccountCard from '@/components/AccountCard.vue';

const store = useShopStore();
const router = useRouter();

onMounted(async () => {
  await Promise.all([store.refreshAccounts(), store.refreshUser()]);
});

const gamesChips = computed(() => ['全部', ...store.games.map(g => g.name)]);
const isSingle = computed(() => store.games.length === 1);

const setGame = async (g: string) => {
  store.gameFilter = g;
  await store.refreshAccounts();
};

const goHall = () => router.push('/hall');
const goPublish = () => router.push('/publish');
const goUser = () => router.push('/user');
</script>

<template>
  <div class="main-wrap">
    <!-- 左侧菜单 -->
    <div class="side-menu">
      <div class="side-menu-item"><div class="ico">🏆</div>俱乐部入驻<div class="arrow">›</div></div>
      <div class="side-menu-item"><div class="ico">💰</div>云股东分红<div class="arrow">›</div></div>
      <div class="side-menu-item"><div class="ico">📢</div>重要公告<div class="arrow">›</div></div>
      <div class="side-menu-item"><div class="ico">📈</div>哈弗币行情<div class="arrow">›</div></div>
      <div class="side-menu-item"><div class="ico">🛡️</div>免押申请<div class="arrow">›</div></div>
    </div>

    <!-- 中间内容 -->
    <div class="center-col">
      <div class="banner">
        <span class="tag">🔥 {{ isSingle ? store.games[0].name : '游戏账号租赁' }}</span>
        <h2>专业安全的游戏交易平台</h2>
        <p>海量优质账号 <i>·</i> 安全交易 <i>·</i> 找回包赔</p>
        <button class="btn-banner" @click="goHall">立即查看</button>
        <div class="banner-dots">
          <span class="on"></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="section-head">
        <h3>
          <span class="fire">🔥</span>特价推荐
          <small>精品优质账号，租售特价推荐</small>
        </h3>
        <button class="btn-more" @click="goHall">查看更多 ›</button>
      </div>

      <div v-if="!isSingle" style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:4px">
        <span
          v-for="g in gamesChips"
          :key="g"
          class="chip-filter"
          :class="{ on: store.gameFilter === g }"
          @click="setGame(g)"
        >{{ g }}</span>
      </div>

      <div v-if="store.accounts.length" class="grid">
        <AccountCard
          v-for="a in store.accounts"
          :key="a.id"
          :account="a"
        />
      </div>
      <div v-else class="empty">
        <div class="ico">🔍</div>
        <p>没有找到符合条件的账号</p>
      </div>

      <div class="flow">
        <h3>交易流程 · 全程担保</h3>
        <div class="flow-grid">
          <div class="flow-item">
            <div class="n">1</div>
            <b>选号下单</b>
            <span>挑选心仪账号，选择租用时长，系统实时计价</span>
          </div>
          <div class="flow-item">
            <div class="n">2</div>
            <b>支付租金押金</b>
            <span>从账户余额扣除租金与押金，资金由平台托管</span>
          </div>
          <div class="flow-item">
            <div class="n">3</div>
            <b>获取账号密码</b>
            <span>下单后立即发放账号密码，可直接登录游戏</span>
          </div>
          <div class="flow-item">
            <div class="n">4</div>
            <b>归还退押金</b>
            <span>到期或提前归还，押金秒退余额，租金结算给号主</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧边栏 -->
    <div class="right-col">
      <div class="user-card">
        <div class="user-top">
          <div class="user-avatar">我</div>
          <div class="user-info">
            <h4>欢迎回来！</h4>
            <span class="badge">普通用户</span>
          </div>
          <div class="user-logout">退出</div>
        </div>
        <div class="balance-row">
          <div class="lbl"><div class="ico">💰</div>余额（元）</div>
          <div class="val">¥{{ store.user.balance.toFixed(2) }}</div>
        </div>
        <div class="balance-row">
          <div class="lbl"><div class="ico">💎</div>云股东余额（元）</div>
          <div class="val">¥ 0.00</div>
        </div>
        <button class="btn-user-main" @click="goUser">进入个人中心 ›</button>
      </div>

      <div class="action-btns">
        <div class="action-btn purple" @click="goHall">
          <div class="ico">🎮</div>
          <div class="ttl">我要租号</div>
          <div class="btn-go">Go ›</div>
        </div>
        <div class="action-btn orange" @click="goPublish">
          <div class="ico">💰</div>
          <div class="ttl">我要出租</div>
          <div class="btn-go">Go ›</div>
        </div>
      </div>
    </div>
  </div>
</template>