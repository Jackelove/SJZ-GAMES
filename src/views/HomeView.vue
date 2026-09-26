<script setup lang="ts">
import { useHomeView } from '@/composables/useHomeView';

const {
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
} = useHomeView();
</script>

<!-- 你原来的 <template> 放这里，一行不改 -->