import { store } from './store.js';
import { navigate } from './router.js';
import { setupGlobalEvents, fmtLeft, toast } from './components.js';

async function boot() {
  try {
    await store.refreshConfig();
    await store.refreshUser();
    await store.refreshOrders();
  } catch (e) {
    console.error('初始化失败:', e);
    toast('连接服务器失败，请检查后端是否启动', 'err');
  }

  setupGlobalEvents();
  await navigate();

  window.addEventListener('hashchange', navigate);

  // 倒计时与到期刷新
  setInterval(async () => {
    const now = Date.now();
    let needRefresh = false;

    for (const o of store.orders) {
      if (o.status === 'ongoing' && now >= o.endAt) {
        needRefresh = true;
      }
    }

    if (needRefresh) {
      await store.refreshOrders();
      await store.refreshUser();
      await store.refreshAccounts();
      navigate();
      toast('有订单已到期自动归还，押金已退回余额');
      return;
    }

    document.querySelectorAll('[data-countdown]').forEach(el => {
      const o = store.orders.find(x => x.id === el.dataset.countdown);
      if (o && o.status === 'ongoing') {
        el.textContent = fmtLeft(o.endAt - now);
      }
    });
  }, 1000);
}

boot();