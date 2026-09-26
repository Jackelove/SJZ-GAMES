<script setup lang="ts">
import { useUserView } from '@/composables/useUserView';

const {
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
} = useUserView();
</script>

<!-- 你原来的 <template> 放这里，一行不改 -->