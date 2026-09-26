import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useShopStore } from '@/stores/shop';
import { api } from '@/api';
import { toast } from '@/components/ToastHost.vue';
import { openModal, closeModal } from '@/components/ModalHost.vue';

export function useUserView() {
  const router = useRouter();
  const store = useShopStore();

  const { user, orders, accounts } = storeToRefs(store);

  const tab = ref<'rent' | 'rentout'>('rent');
  const now = ref(Date.now());
  let timer: number | undefined;

  const rentOrders = computed(() =>
    orders.value.filter(o => o.renterId === user.value.id)
  );

  const rentoutOrders = computed(() =>
    orders.value.filter(o => o.ownerId === user.value.id)
  );

  const myAccounts = computed(() =>
    accounts.value.filter(a => a.ownerId === user.value.id)
  );

  const switchTab = (t: 'rent' | 'rentout') => {
    tab.value = t;
  };

  const openRecharge = () => {
    openModal(`
      <h3>账户充值</h3>
      <p class="muted">演示环境，充值金额即时到账</p>
      <div class="amounts">
        ${[100, 500, 1000, 2000]
          .map(v => `<div class="amt" data-v="${v}">¥${v}</div>`)
          .join('')}
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

  const returnOrder = async (id: string) => {
    try {
      await api.returnOrder(id);
      toast('归还成功');
      await store.refreshUser();
      await store.refreshOrders();
      await store.refreshAccounts();
    } catch (e: any) {
      toast(e.message, 'err');
    }
  };

  const simulateRent = async (id: string) => {
    try {
      await api.simulateRent(id);
      toast('模拟租客下单成功');
      await store.refreshUser();
      await store.refreshOrders();
      await store.refreshAccounts();
    } catch (e: any) {
      toast(e.message, 'err');
    }
  };

  const goDetail = (id: string) => {
    router.push(`/detail/${id}`);
  };

  const goPublish = () => {
    router.push('/publish');
  };

  onMounted(async () => {
    await store.refreshUser();
    await store.refreshOrders();
    await store.refreshAccounts();

    timer = window.setInterval(() => {
      now.value = Date.now();
    }, 1000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return {
    user,
    orders,
    accounts,
    tab,
    now,
    rentOrders,
    rentoutOrders,
    myAccounts,
    switchTab,
    openRecharge,
    returnOrder,
    simulateRent,
    goDetail,
    goPublish
  };
}