<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useShopStore } from '@/stores/shop';
import { api } from '@/api';
import { toast } from '@/components/ToastHost.vue';
import { openModal, closeModal } from '@/components/ModalHost.vue';

const store = useShopStore();
const router = useRouter();
const tab = ref<'rent' | 'rentout'>('rent');

onMounted(async () => {
  await Promise.all([store.refreshUser(), store.refreshOrders(), store.refreshAccounts()]);
});

const money = (n: number) => '¥' + Number(n).toFixed(2);
const fmtTime = (ts: number) => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fmtLeft = (ms: number) => {
  if (ms <= 0) return '已到期';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60), ss = s % 60;
  if (d > 0) return `${d}天${h}小时`;
  if (h > 0) return `${h}小时${m}分`;
  if (m > 0) return `${m}分${ss}秒`;
  return `${ss}秒`;
};

const myRentOrders = computed(() => store.orders.filter(o => o.renterId === 'u_me'));
const myOutOrders = computed(() => store.orders.filter(o => o.ownerId === 'u_me'));
const myAccounts = computed(() => store.accounts.filter(a => a.ownerId === 'u_me'));

const returnOrder = async (id: string) => {
  try {
    await api.returnOrder(id);
    toast('归还成功，押金已退回');
    await store.refreshUser();
    await store.refreshOrders();
    await store.refreshAccounts();
  } catch (e: any) {
    toast(e.message, 'err');
  }
};

const simulate = async (id: string) => {
  try {
    await api.simulateRent(id);
    toast('模拟租客下单成功');
    await store.refreshUser();
    await store.refreshOrders();
  } catch (e: any) {
    toast(e.message, 'err');
  }
};

const copyCred = (acc: string, pwd: string) => {
  const text = `${acc}  密码：${pwd}`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('账号信息已复制'));
};

const openRecharge = () => {
  openModal(`
    <h3>账户充值</h3>
    <p class="muted">演示环境，充值金额即时到账</p>
    <div class="amounts">
      ${[100, 500, 1000, 2000].map(v => `<div class="amt" data-v="${v}">¥${v}</div>`).join('')}
    </div>
    <button class="btn big" data-close>取消</button>
  `);
  setTimeout(() => {
    document.querySelectorAll('.amt').forEach(el => {
      el.addEventListener('click', async () => {
        const amount = parseFloat((el as HTMLElement).dataset.v!);
        await api.recharge(amount);
        toast('充值成功');
        await store.refreshUser();
        closeModal();
      });
    });
    document.querySelector('[data-close]')?.addEventListener('click', closeModal);
  });
};
</script>

<template>
  <div class="page-wrap">
    <div class="back" @click="router.push('/home')">← 返回首页</div>

    <div class="u-hero">
      <div class="u-avatar">我</div>
      <div>
        <div class="u-name">{{ store.user.name }}<span class="u-uid">UID: 100086</span></div>
        <div class="u-badge">✔ 实名认证 · 信用极好</div>
      </div>
      <div class="u-stats">
        <div><b>{{ money(store.user.balance) }}</b><span>账户余额</span></div>
        <div><b>{{ money(store.user.totalEarn) }}</b><span>累计收益</span></div>
        <div><b>{{ money(store.user.totalSpend) }}</b><span>累计消费</span></div>
        <button class="btn small" style="padding:10px 18px;background:#fff;color:#1e3a8a;border:none;font-weight:800" @click="openRecharge">充值</button>
      </div>
    </div>

    <div class="tabs">
      <a :class="{ on: tab === 'rent' }" @click="tab = 'rent'">我租的账号 ({{ myRentOrders.length }})</a>
      <a :class="{ on: tab === 'rentout' }" @click="tab = 'rentout'">我出租的账号 ({{ myAccounts.length }})</a>
    </div>

    <!-- 我租的账号 -->
    <template v-if="tab === 'rent'">
      <div v-if="myRentOrders.length">
        <div v-for="o in myRentOrders" :key="o.id" class="order">
          <div class="o-head">
            <span class="o-id">订单号 {{ o.id }}</span>
            <span class="o-status" :class="o.status">{{ o.status === 'ongoing' ? '进行中' : '已完成' }}</span>
          </div>
          <div class="o-body">
            <div class="o-cover" :style="{ background: `linear-gradient(135deg, ${store.gameColor(o.game)[0]}, ${store.gameColor(o.game)[1]})` }">{{ o.game }}</div>
            <div class="o-info">
              <div class="o-title">{{ o.title }}</div>
              <div class="o-sub">时长 {{ o.durLabel }} · 租金 {{ money(o.rent) }} · 押金 {{ money(o.deposit) }} · 下单 {{ fmtTime(o.startAt) }}</div>
              <div v-if="o.status === 'ongoing'" class="o-cred">
                <span>账号：<b>{{ o.acc }}</b></span>
                <span>密码：<b>{{ o.pwd }}</b></span>
                <button class="mini" @click="copyCred(o.acc!, o.pwd!)">复制</button>
              </div>
              <div v-if="o.status === 'ongoing'" class="o-count">到期自动归还并退回押金</div>
              <div v-else class="o-sub" style="margin-bottom:0">完成时间：{{ fmtTime(o.finishedAt || o.endAt) }} · 押金已退回</div>
            </div>
            <div class="o-right">
              <div class="o-total">{{ money(o.total) }}</div>
              <button v-if="o.status === 'ongoing'" class="btn small danger" @click="returnOrder(o.id)">立即归还</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <div class="ico">🎮</div><p>还没有租过账号</p>
        <button class="btn primary" @click="router.push('/home')">去租号</button>
      </div>
    </template>

    <!-- 我出租的账号 -->
    <template v-else>
      <div v-if="myAccounts.length" class="grid" style="margin-bottom:26px">
        <div v-for="a in myAccounts" :key="a.id" class="card" style="cursor:default">
          <div class="card-cover">
            <div class="game-bg" :style="{ background: `linear-gradient(135deg, ${store.gameColor(a.game)[0]}, ${store.gameColor(a.game)[1]})` }"></div>
            <div class="game-txt">{{ a.game }}</div>
            <div class="level-txt">{{ a.level }}</div>
            <div class="discount-badge" :style="{ background: a.status === 'rented' ? 'linear-gradient(135deg,#64748b,#94a3b8)' : 'linear-gradient(135deg,#10b981,#059669)' }">
              {{ a.status === 'rented' ? '出租中' : '在架' }}
            </div>
          </div>
          <div class="card-body">
            <div class="card-title" style="height:auto;margin-bottom:10px">{{ a.title }}</div>
            <div class="card-foot" style="border-top:none;padding-top:0;margin-bottom:10px">
              <div class="card-price"><em>¥</em><b>{{ a.hourPrice }}</b><span>/小时</span></div>
              <div class="card-dep">押金 ¥{{ a.deposit }}</div>
            </div>
            <button class="btn acc small" style="width:100%" @click="simulate(a.id)">模拟租客下单（演示）</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <div class="ico">📦</div><p>还没有出租中的账号</p>
        <button class="btn primary" @click="router.push('/publish')">去发布账号</button>
      </div>

      <div class="sec-title" style="margin:26px 0 14px">出租订单记录</div>
      <div v-if="myOutOrders.length">
        <div v-for="o in myOutOrders" :key="o.id" class="order">
          <div class="o-head">
            <span class="o-id">订单号 {{ o.id }} · 租客 {{ o.renterName }}</span>
            <span class="o-status" :class="o.status">{{ o.status === 'ongoing' ? '进行中' : '已结算' }}</span>
          </div>
          <div class="o-body">
            <div class="o-cover" :style="{ background: `linear-gradient(135deg, ${store.gameColor(o.game)[0]}, ${store.gameColor(o.game)[1]})` }">{{ o.game }}</div>
            <div class="o-info">
              <div class="o-title">{{ o.title }}</div>
              <div class="o-sub">时长 {{ o.durLabel }} · 租客支付 {{ money(o.total) }}</div>
              <div class="o-sub" style="color:var(--success)">收益 {{ money(o.rent) }} 已入账</div>
            </div>
            <div class="o-right"><div class="o-total" style="color:var(--success)">+{{ money(o.rent) }}</div></div>
          </div>
        </div>
      </div>
      <div v-else class="empty" style="padding:40px 20px"><p>暂无出租订单</p></div>
    </template>
  </div>
</template>