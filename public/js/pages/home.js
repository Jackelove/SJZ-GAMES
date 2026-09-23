import { store } from '../store.js';
import { cardHTML, esc } from '../components.js';
import { goto } from '../router.js';

export async function load(s) {
  await s.refreshAccounts();
  await s.refreshUser();
}

export function render(s) {
  const games = s.games;
  const isSingle = games.length === 1;

  const sideMenu = `
    <div class="side-menu">
      <div class="side-menu-item" data-act="contact"><div class="ico">🏆</div>俱乐部入驻<div class="arrow">›</div></div>
      <div class="side-menu-item" data-act="contact"><div class="ico">💰</div>云股东分红<div class="arrow">›</div></div>
      <div class="side-menu-item" data-act="contact"><div class="ico">📢</div>重要公告<div class="arrow">›</div></div>
      <div class="side-menu-item" data-act="contact"><div class="ico">📈</div>哈弗币行情<div class="arrow">›</div></div>
      <div class="side-menu-item" data-act="contact"><div class="ico">🛡️</div>免押申请<div class="arrow">›</div></div>
    </div>`;

  const banner = `
    <div class="banner">
      <span class="tag">🔥 ${isSingle ? esc(games[0].name) : '游戏账号租赁'}</span>
      <h2>专业安全的游戏交易平台</h2>
      <p>海量优质账号 <i>·</i> 安全交易 <i>·</i> 找回包赔</p>
      <button class="btn-banner" data-act="scroll-hall">立即查看</button>
      <div class="banner-dots"><span class="on"></span><span></span><span></span></div>
    </div>`;

  const chips = isSingle ? '' : `
    <div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:4px">
      ${['全部', ...games.map(g => g.name)].map(g => `
        <span class="chip-filter ${s.state.game === g ? 'on' : ''}" data-act="filter-game" data-game="${esc(g)}">${esc(g)}</span>
      `).join('')}
    </div>`;

  const cardsHTML = s.accounts.length
    ? `<div class="grid">${s.accounts.map(cardHTML).join('')}</div>`
    : `<div class="empty"><div class="ico">🔍</div><p>没有找到符合条件的账号</p></div>`;

  const rightCol = `
    <div class="right-col">
      <div class="user-card">
        <div class="user-top">
          <div class="user-avatar">我</div>
          <div class="user-info">
            <h4>欢迎回来！</h4>
            <span class="badge">普通用户</span>
          </div>
          <div class="user-logout" data-act="logout">退出</div>
        </div>
        <div class="balance-row">
          <div class="lbl"><div class="ico">💰</div>余额（元）</div>
          <div class="val">${'¥' + s.user.balance.toFixed(2)}</div>
        </div>
        <div class="balance-row">
          <div class="lbl"><div class="ico">💎</div>云股东余额（元）</div>
          <div class="val">¥ 0.00</div>
        </div>
        <button class="btn-user-main" data-act="go" data-page="user">进入个人中心 ›</button>
      </div>
      <div class="action-btns">
        <div class="action-btn purple" data-act="go" data-page="hall">
          <div class="ico">🎮</div><div class="ttl">我要租号</div><div class="btn-go">Go ›</div>
        </div>
        <div class="action-btn orange" data-act="go" data-page="publish">
          <div class="ico">💰</div><div class="ttl">我要出租</div><div class="btn-go">Go ›</div>
        </div>
      </div>
    </div>`;

  return `
    <div class="main-wrap">
      ${sideMenu}
      <div class="center-col">
        ${banner}
        <div class="section-head">
          <h3><span class="fire">🔥</span>特价推荐 <small>精品优质账号，租售特价推荐</small></h3>
          <button class="btn-more" data-act="go" data-page="hall">查看更多 ›</button>
        </div>
        ${chips}
        ${cardsHTML}
        <div class="flow">
          <h3>交易流程 · 全程担保</h3>
          <div class="flow-grid">
            <div class="flow-item"><div class="n">1</div><b>选号下单</b><span>挑选心仪账号，选择租用时长，系统实时计价</span></div>
            <div class="flow-item"><div class="n">2</div><b>支付租金押金</b><span>从账户余额扣除租金与押金，资金由平台托管</span></div>
            <div class="flow-item"><div class="n">3</div><b>获取账号密码</b><span>下单后立即发放账号密码，可直接登录游戏</span></div>
            <div class="flow-item"><div class="n">4</div><b>归还退押金</b><span>到期或提前归还，押金秒退余额，租金结算给号主</span></div>
          </div>
        </div>
      </div>
      ${rightCol}
    </div>`;
}

export function mounted(s) {
  document.querySelectorAll('[data-act="filter-game"]').forEach(el => {
    el.addEventListener('click', async () => {
      s.state.game = el.dataset.game;
      await s.refreshAccounts();
      const { navigate } = await import('../router.js');
      navigate();
    });
  });

  const scrollBtn = document.querySelector('[data-act="scroll-hall"]');
  if (scrollBtn) scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 400, behavior: 'smooth' });
  });

  const searchInput = document.getElementById('kw');
  if (searchInput) {
    searchInput.addEventListener('keydown', async e => {
      if (e.key === 'Enter') {
        s.state.keyword = e.target.value;
        await s.refreshAccounts();
        const { navigate } = await import('../router.js');
        navigate();
      }
    });
  }
}