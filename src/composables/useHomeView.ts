import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useShopStore } from '@/stores/shop';
import { toast } from '@/components/ToastHost.vue';

export function useHomeView() {
  const router = useRouter();
  const store = useShopStore();

  const {
    user,
    accounts,
    games,
    gameFilter,
    keyword,
    isSingleGame
  } = storeToRefs(store);

  const activeMenu = ref('');

  const selectGame = async (game: string) => {
    store.gameFilter = game;
    await store.refreshAccounts();
  };

  const search = async () => {
    await store.refreshAccounts();
  };

  const goDetail = (id: string) => {
    router.push(`/detail/${id}`);
  };

  const menuClick = (name: string) => {
    toast(`${name} 功能开发中`, 'warn');
  };

  const scrollToCards = () => {
    document.querySelector('.grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goUser = () => {
    router.push('/user');
  };

  onMounted(async () => {
    await store.refreshConfig();
    await store.refreshUser();
    await store.refreshAccounts();
  });

  return {
    user,
    accounts,
    games,
    gameFilter,
    keyword,
    isSingleGame,
    activeMenu,
    selectGame,
    search,
    goDetail,
    menuClick,
    scrollToCards,
    goUser
  };
}