import { store } from './store.js';
import { renderNavTabs, renderFixedRail } from './components.js';
import * as home from './pages/home.js';
import * as detail from './pages/detail.js';
import * as publish from './pages/publish.js';
import * as user from './pages/user.js';
import * as faq from './pages/faq.js';

const pages = { home, detail, publish, user, faq, hall: home };

export function goto(path) {
  if (!path.startsWith('/')) path = '/' + path;
  if (location.hash === '#' + path) navigate();
  else location.hash = '#' + path;
}

export async function navigate() {
  const hash = location.hash.slice(1) || '/home';
  const parts = hash.split('/').filter(Boolean);
  const pageName = parts[0] || 'home';
  const param = parts[1] || null;

  store.setState({ page: pageName === 'hall' ? 'hall' : pageName });
  if (pageName === 'detail' && param) store.setState({ detailId: param });

  renderNavTabs();
  renderFixedRail();

  const app = document.getElementById('app');
  const Page = pages[pageName] || home;

  try {
    app.innerHTML = '<div style="padding:80px;text-align:center;color:#94a3b8">加载中...</div>';
    if (Page.load) await Page.load(store, param);
    app.innerHTML = Page.render(store, param);
    if (Page.mounted) Page.mounted(store, param);
  } catch (e) {
    console.error(e);
    app.innerHTML = `<div style="padding:60px;text-align:center;color:#ef4444">加载失败：${e.message}</div>`;
  }

  window.scrollTo(0, 0);
}