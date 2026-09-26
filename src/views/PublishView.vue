<script setup lang="ts">
import { usePublishView } from '@/composables/usePublishView';

const { form, submitting, goBack, submit } = usePublishView();
</script>

<!-- 你原来的 <template> 放这里，一行不改 -->