// src/composables/useDetailView.ts
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShopStore } from '@/stores/shop';
import { api } from '@/api';
import { toast } from '@/components/ToastHost.vue';

export function useDetailView() {
  const route = useRoute();
  const router = useRouter();
  const store = useShopStore();

  /** 加载状态 */
  const loading = ref(false);
  /** 下单提交状态 */
  const submitting = ref(false);

  /** 当前账号 */
  const account = computed(() => store.currentAccount);

  /** 当前选中时长（双向绑定到 store） */
  const currentDur = computed({
    get: () => store.currentDur,
    set: (v: string) => {
      store.currentDur = v;
    }
  });

  /** 当前时长配置对象 */
  const duration = computed(() =>
    store.durations.find(d => d.key === store.currentDur)
  );

  /** 租金（按小时或按天） */
  const rent = computed(() => {
    if (!account.value || !duration.value) return 0;
    const d = duration.value;
    if (d.days) return account.value.dayPrice * d.days;
    return account.value.hourPrice * d.hours;
  });

  /** 押金 */
  const deposit = computed(() => account.value?.deposit ?? 0);

  /** 合计 = 租金 + 押金 */
  const total = computed(() => rent.value + deposit.value);

  /** 是否可以租用 */
  const canRent = computed(() => {
    if (!account.value) return false;
    if (account.value.ownerId === store.user.id) return false;
    if (account.value.status === 'rented') return false;
    return store.user.balance >= total.value;
  });

  /** 按钮文案 */
  const buttonText = computed(() => {
    if (!account.value) return '加载中';
    if (account.value.ownerId === store.user.id) return '这是您发布的账号';
    if (account.value.status === 'rented') return '该账号正在出租中';
    if (store.user.balance < total.value) return '余额不足';
    return '立即租用';
  });

  /** 加载账号详情 */
  const load = async () => {
    loading.value = true;
    try {
      await store.loadAccount(route.params.id as string);
    } catch (e: any) {
      toast(e.message || '加载失败', 'err');
    } finally {
      loading.value = false;
    }
  };

  /** 下单 */
  const submit = async () => {
    if (!account.value || !canRent.value || submitting.value) return;

    submitting.value = true;
    try {
      await api.createOrder(account.value.id, store.currentDur);
      toast('租用成功');
      await store.refreshUser();
      await store.refreshAccounts();
      await store.refreshOrders();
      router.push('/user');
    } catch (e: any) {
      toast(e.message || '租用失败', 'err');
    } finally {
      submitting.value = false;
    }
  };

  /** 返回上一页 */
  const goBack = () => {
    router.back();
  };

  onMounted(load);

  /** 路由 id 变化时重新加载（例如同一页面切换不同账号） */
  watch(
    () => route.params.id,
    () => {
      if (route.params.id) load();
    }
  );

  return {
    loading,
    submitting,
    account,
    currentDur,
    duration,
    rent,
    deposit,
    total,
    canRent,
    buttonText,
    submit,
    goBack
  };
}