<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="page-wrap">
    <div class="back" @click="router.push('/home')">← 返回首页</div>
    <div class="panel" style="max-width:800px;margin:0 auto">
      <h2 style="font-size:20px;font-weight:900;margin-bottom:20px">常见问题</h2>
      <div style="line-height:2;color:var(--txt2);font-size:14px">
        <p><b style="color:var(--txt)">Q：租号安全吗？</b><br>A：平台全程担保，账号经过审核，下单后资金由平台托管，订单结束押金秒退。</p>
        <p style="margin-top:16px"><b style="color:var(--txt)">Q：如何租号？</b><br>A：在租号大厅选择心仪账号，选择时长，支付租金和押金后即可获得账号密码。</p>
        <p style="margin-top:16px"><b style="color:var(--txt)">Q：押金什么时候退？</b><br>A：订单到期或您主动归还后，押金立即退回账户余额。</p>
        <p style="margin-top:16px"><b style="color:var(--txt)">Q：怎么出租账号？</b><br>A：点击顶部「发布出租」，填写账号信息即可上架。</p>
      </div>
    </div>
  </div>
</template>