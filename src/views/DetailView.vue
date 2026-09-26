<script setup lang="ts">
import { useDetailView } from '@/composables/useDetailView';

const {
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
} = useDetailView();
</script>

<!-- 你原来的 <template> 放这里，一行不改 -->