import { store } from '../store.js';
import { esc, toast } from '../components.js';
import { api } from '../api.js';
import { goto } from '../router.js';

export async function load(s) {
  await s.refreshConfig();
}

export function render(s) {
  const activeGames = s.games;
  const cfg = s.gameConfig(s.state.pubGame);
  const f = s.state.pubForm || {};
  const v = (k, d) => f[k] !== undefined && f[k] !== '' ? f[k] : d;

  const gameSelector = activeGames.length > 1
    ? `<div class="field"><label>选择游戏</label><div style="display:flex;gap:9px;flex-wrap:wrap">
        ${activeGames.map(g => `<span class="chip-filter ${s.state.pubGame === g.name ? 'on' : ''}" data-act="pubGame" data-game="${esc(g.name)}">${esc(g.name)}</span>`).join('')}
      </div></div>`
    : `<div class="field"><label>发布游戏</label><div style="display:inline-block;padding:7px 16px;border-radius:8px;background:#1e3a8a;color:#fff;font-size:13px;font-weight:600">${esc(cfg.name)}</div></div>`;

  const term = cfg.term || {};

  return `
    <div class="page-wrap">
      <div class="back" data-act="go" data-page="home">← 返回首页</div>
      <div style="margin-bottom:20px">
        <h2 style="font-size:22px;font-weight:900;margin-bottom:8px">出租我的${esc(cfg.name)}账号</h2>
        <p style="color:var(--txt2);font-size:14px">上架后立即进入租号市场，租客下单后租金自动结算到您的账户余额</p>
      </div>
      <div class="form-card">
        ${gameSelector}
        <div class="field"><label>账号标题</label>
          <input id="f-title" placeholder="例如：元帅号 全干员满级 战备75" value="${esc(v('title', ''))}"></div>
        <div class="field"><label>账号描述</label>
          <textarea id="f-desc" placeholder="介绍账号亮点、可玩内容、注意事项...">${esc(v('desc', ''))}</textarea></div>
        <div class="field"><label>${esc(term.levelLabel || '段位 / 等级')}</label>
          <input id="f-level" placeholder="${esc(term.levelPlaceholder || '例如：王牌 / 战备70')}" value="${esc(v('level', ''))}"></div>
        <div class="row3">
          <div class="field"><label>时租价（元/小时）</label>
            <input id="f-hour" type="number" min="1" value="${esc(v('hour', cfg.defaultHour))}"></div>
          <div class="field"><label>日租价（元/天）</label>
            <input id="f-day" type="number" min="1" value="${esc(v('day', cfg.defaultDay))}"></div>
          <div class="field"><label>押金（元）</label>
            <input id="f-dep" type="number" min="0" value="${esc(v('dep', cfg.defaultDeposit))}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>游戏账号</label>
            <input id="f-acc" placeholder="租客下单后可见" value="${esc(v('acc', ''))}"></div>
          <div class="field"><label>游戏密码</label>
            <input id="f-pwd" placeholder="租客下单后可见" value="${esc(v('pwd', ''))}"></div>
        </div>
        <div class="field"><label>标签（用逗号分隔，最多 3 个）</label>
          <input id="f-tags" placeholder="${esc(cfg.seedTags || '全干员,满级,秒发')}" value="${esc(v('tags', ''))}">
          <div class="hint">💡 当前游戏：${esc(cfg.name)} · 标签有助于提升曝光</div></div>
        <button class="btn primary big" data-act="publish">立即上架出租</button>
      </div>
    </div>`;
}

export function mounted(s) {
  const captureForm = () => {
    const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    s.state.pubForm = {
      title: get('f-title'), desc: get('f-desc'), level: get('f-level'),
      hour: get('f-hour'), day: get('f-day'), dep: get('f-dep'),
      acc: get('f-acc'), pwd: get('f-pwd'), tags: get('f-tags')
    };
  };

  document.querySelectorAll('[data-act="pubGame"]').forEach(el => {
    el.addEventListener('click', async () => {
      captureForm();
      s.state.pubGame = el.dataset.game;
      s.state.pubForm.hour = '';
      s.state.pubForm.day = '';
      s.state.pubForm.dep = '';
      const { navigate } = await import('../router.js');
      navigate();
    });
  });

  const publishBtn = document.querySelector('[data-act="publish"]');
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      const get = id => (document.getElementById(id).value || '').trim();
      const hour = parseFloat(get('f-hour'));
      const day = parseFloat(get('f-day'));
      const dep = parseFloat(get('f-dep'));
      const title = get('f-title');
      const level = get('f-level');
      const acc = get('f-acc');
      const pwd = get('f-pwd');

      if (!title) return toast('请填写账号标题', 'warn');
      if (!level) return toast('请填写段位 / 战备等级', 'warn');
      if (!(hour > 0)) return toast('请填写有效的时租价', 'warn');
      if (!(day > 0)) return toast('请填写有效的日租价', 'warn');
      if (isNaN(dep) || dep < 0) return toast('请填写有效的押金', 'warn');
      if (!acc || !pwd) return toast('请填写游戏账号与密码', 'warn');

      const tagsRaw = get('f-tags');
      const tags = tagsRaw ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean).slice(0, 3) : [];

      try {
        const res = await api.createAccount({
          game: s.state.pubGame,
          title, desc: get('f-desc'), level,
          hourPrice: hour, dayPrice: day, deposit: dep,
          acc, pwd, tags
        });
        toast(res.msg);
        s.state.pubForm = null;
        s.state.userTab = 'rentout';
        await s.refreshUser();
        goto('/user');
        // 4 秒后模拟租客下单
        setTimeout(async () => {
          try {
            const simRes = await api.simulateRent(res.data.id);
            toast(simRes.msg);
            await s.refreshUser();
            await s.refreshOrders();
            const { navigate } = await import('../router.js');
            navigate();
          } catch (e) {}
        }, 4000);
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  }
}