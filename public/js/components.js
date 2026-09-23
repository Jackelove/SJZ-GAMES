import { store } from './store.js';
import { api } from './api.js';
import { goto } from './router.js';

export function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
export function money(n) { return '¥' + Number(n).toFixed(2); }
export function fmtTime(ts) {
  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');
  return `${d.getMonth()+1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function fmtLeft(ms) {
  if (ms <= 0) return '已到期';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60), ss = s % 60;
  if (d > 0) return `${d}天${h}小时`;
  if (h > 0) return `${h}小时${m}分`;
  if (m > 0) return `${m}分${ss}秒`;
  return `${ss}秒`;
}

export function toast(msg, type = 'ok') {
  const box = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px)';
  }, 2600);
  setTimeout(() => el.remove(), 3050);
}

export function copyText(text) {
  const val = String(text).replace('|', '  密码：');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val).then(
      () => toast('账号信息已复制'),
      () => toast('复制失败，请手动选择', 'warn')
    );
  } else {
    const ta = document.createElement('textarea');
    ta.value = val; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('账号信息已复制'); }
    catch { toast('复制失败，请手动选择', 'warn'); }
    ta.remove();
  }
}

export function openModal(html) {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-mask" data-act="closeModal"></div><div class="modal-box">${html}</div>`;
  m.classList.add('show');
}
export function closeModal() {
  const m = document.getElementById('modal');
  m.classList.remove('show');
  m.innerHTML = '';
}

export function cardHTML(a) {
  const c = store.gameColor(a.game);
  const rented = a.status === 'rented';
  const isMine = a.ownerId === 'u_me';

  let badge = '';
  if (rented) badge = '<div class="discount-badge" style="background:linear-gradient(135deg,#64748b,#94a3b8)">出租中</div>';
  else if (isMine) badge = '<div class="discount-badge" style="background:linear-gradient(135deg,#10b981,#059669)">我的</div>';
  else if (a.discount) badge = `<div class="discount-badge">${esc(a.discount)}</div>`;

  const onlineBadge = a.online ? '<div class="online-badge">号主在线</div>' : '';
  const tags = (a.tags || []).slice(0, 3).map(t => `<span>${esc(t)}</span>`).join('');

  return `
    <div class="card ${rented ? 'is-rented' : ''}" data-act="detail" data-id="${a.id}">
      <div class="card-cover">
        <div class="game-bg" style="background:linear-gradient(135deg,${c[0]},${c[1]})"></div>
        <div class="game-txt">${esc(a.game)}</div>
        <div class="level-txt">${esc(a.level)}</div>
        ${badge}${onlineBadge}
      </div>
      <div class="card-body">
        <div class="card-title">${esc(a.title)}</div>
        <div class="card-tags">${tags}</div>
        <div class="card-foot">
          <div class="card-price"><em>¥</em><b>${a.hourPrice}</b><span>/小时</span></div>
          <div class="card-dep">押金 ¥${a.deposit}</div>
        </div>
        <div class="insure-tag">🛡️ 押金秒退 · 订单结束押金秒退</div>
      </div>
    </div>`;
}

export function renderNavTabs() {
  const tabs = [
    { key: 'home', label: '首页' },
    { key: 'hall', label: '租号大厅' },
    { key: 'user', label: '个人中心' },
    { key: 'faq', label: '常见问题' }
  ];
  const active = store.state.page === 'detail' ? 'hall' : store.state.page;
  let html = '<div class="nav-tabs">';
  tabs.forEach(t => {
    html += `<a data-act="go" data-page="${t.key}" class="${active === t.key ? 'on' : ''}">${t.label}</a>`;
  });
  html += '</div>';
  document.getElementById('navTabsWrap').innerHTML = html;
}

export function renderFixedRail() {
  const items = [
    { ico: '📢', label: '发布出租', act: 'go', page: 'publish' },
    { ico: '👤', label: '个人中心', act: 'go', page: 'user' },
    { ico: '💎', label: '云股东', act: 'contact' },
    { ico: '🔔', label: '消息中心', act: 'contact' },
    { ico: '💬', label: '联系客服', act: 'contact' }
  ];
  let html = '<div class="rail-logo" data-act="go" data-page="home"><b>蒙</b>CLUB</div>';
  items.forEach(it => {
    html += `<div class="rail-item" data-act="${it.act}"${it.page ? ` data-page="${it.page}"` : ''}>
      <span class="ri">${it.ico}</span><span>${it.label}</span></div>`;
  });
  document.getElementById('fixedRail').innerHTML = html;
}

/* 全局事件委托 */
export function setupGlobalEvents() {
  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act;

    switch (act) {
      case 'go':
        goto('/' + t.dataset.page);
        break;
      case 'detail':
        goto('/detail/' + t.dataset.id);
        break;
      case 'contact':
        toast('客服功能演示，请添加实际联系方式', 'warn');
        break;
      case 'logout':
        toast('已退出登录（演示）', 'warn');
        break;
      case 'toggle-mode':
        toast('夜间模式开发中');
        break;
      case 'copy':
        copyText(t.dataset.val);
        break;
      case 'closeModal':
        closeModal();
        break;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}