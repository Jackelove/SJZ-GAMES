import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useShopStore } from '@/stores/shop';
import { api } from '@/api';
import { toast } from '@/components/ToastHost.vue';

export function usePublishView() {
  const router = useRouter();
  const store = useShopStore();

  const form = ref({
    game: '',
    title: '',
    desc: '',
    level: '',
    hourPrice: 0,
    dayPrice: 0,
    deposit: 0,
    acc: '',
    pwd: '',
    tags: ''
  });

  const submitting = ref(false);

  const goBack = () => {
    router.push('/home');
  };

  const submit = async () => {
    if (submitting.value) return;
    submitting.value = true;

    try {
      const account = await api.createAccount({
        ...form.value,
        tags: form.value.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      });

      toast('上架成功');
      await store.refreshUser();
      await store.refreshAccounts();
      router.push('/user');

      setTimeout(async () => {
        try {
          await api.simulateRent(account.id);
          await store.refreshUser();
          await store.refreshOrders();
        } catch {
          // 演示用，静默失败
        }
      }, 4000);
    } catch (e: any) {
      toast(e.message, 'err');
    } finally {
      submitting.value = false;
    }
  };

  return {
    form,
    submitting,
    goBack,
    submit
  };
}