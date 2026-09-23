import { store } from '../store.js';
import { esc, money, toast, fmtLeft } from '../components.js';
import { api } from '../api.js';
import { goto } from '../router.js';

export async function load(s, id) {
  if (!id) { goto('/home'); return; }
  await s.loadAccount(id);
  await s.refreshUser();
}

export function render(s) {
  const a = s.currentAccount;
  if (!a) return `<div class="page-wrap"><div class="empty"><p>账号不存在</p></div></div>`;

  const c = s.gameColor(a.game);
  const dur = s.durations.find(d => d.key === s.state.dur) || s.durations[0];
  const rent = dur.days ? a.dayPrice * dur.days : a.hourPrice * dur.hours;
  const total = Math.round((rent + a.deposit) * 100) / 100;

  const isMine = a.ownerId === 'u_me';
  const rented = a.status === 'rented';
  const enough = s.user.balance >= total;

  let btnText = '立即租用', disabled = '';
  if (isMine) { btnText = '这是您发布的账号'; disabled = 'disabled'; }
  else if (rented) { btnText = '该账号正在出租中'; disabled = 'disabled'; }
  else if (!enough) { btnText = '余额不足，请先充值'; disabled = 'disabled'; }

  const durHTML = s.durations.map(d => {
    const p = d.days ? a.dayPrice * d.days : a.hourPrice * d.hours;
    return `<div class="dur ${s.state.dur === d.key ? 'on' : ''}" data-act="dur" data-key="${d.key}">
      <b>${d.label}</b><span>¥${p}</span></div>`;
  }).join('');

  const canSee = a.canSeeCred;

  return `
    <div class="page-wrap">
      <div class="back" data-act="go" data-page="home">← 返回租号大厅</div>
      <div class="detail-wrap">
        <div>
          <div class="d-cover" style="background:linear-gradient(135deg,${c[0]},${c[1]})">
            <div class="g">${esc(a.game)}</div>
            <div class="l">${esc(a.level)}</div>
          </div>
          <div class="panel" style="margin-top:16px">
            <div class="sec-title">账号信息</div>
            <div class="cred-box">
              游戏账号：<b>${canSee ? esc(a.acc) : '••••••••••'}</b><br>
              游戏密码：<b>${canSee ? esc(a.pwd) : '••••••••'}</b><br>
              <span style="font-size:12px;color:var(--txt3)">※ 下单成功后自动发放完整账号密码</span>
            </div>
            <div style="font-size:12.5px;color:var(--txt3);line-height:1.8">
              号主：${esc(a.ownerName)}<br>
              累计租用：${a.rentCount || 0} 次 · 评分 ${a.rating || 5.0}
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="d-title">${esc(a.title)}</div>
          <div class="card-tags" style="margin-bottom:14px">
            ${(a.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}
          </div>
          <div class="d-meta">
            <div><span>时租价</span><b style="color:var(--acc)">¥${a.hourPrice}/小时</b></div>
            <div><span>日租价</span><b style="color:var(--acc)">¥${a.dayPrice}/天</b></div>
            <div><span>押金</span><b>¥${a.deposit}</b></div>
            <div><span>状态</span><b style="color:${rented ? 'var(--danger)' : 'var(--success)'}">${rented ? '出租中' : '可租用'}</b></div>
          </div>
          <div class="d-desc">${esc(a.desc || '暂无描述')}</div>
          <div class="sec-title">选择租用时长</div>
          <div class="durs">${durHTML}</div>
          <div class="sec-title">费用明细</div>
          <div class="fee">
            <div class="fee-row"><span>租金（${dur.label}）</span><span>${money(rent)}</span></div>
            <div class="fee-row"><span>押金（归还后退回）</span><span>${money(a.deposit)}</span></div>
            <div class="fee-row"><span>合计支付</span><b>${money(total)}</b></div>
          </div>
          <div style="font-size:13px;color:var(--txt3);margin-bottom:16px">
            当前余额：<b style="color:${enough ? 'var(--success)' : 'var(--danger)'}">${money(s.user.balance)}</b>
            ${enough ? '' : ' · <a data-act="recharge" style="color:var(--pri2);font-weight:700">去充值 →</a>'}
          </div>
          <button class="btn primary big" data-act="order" ${disabled}>${btnText}</button>
        </div>
      </div>
    </div>`;
}

export function mounted(s) {
  document.querySelectorAll('[data-act="dur"]').forEach(el => {
    el.addEventListener('click', async () => {
      s.state.dur = el.dataset.key;
      const { navigate } = await import('../router.js');
      navigate();
    });
  });

  const orderBtn = document.querySelector('[data-act="order"]');
  if (orderBtn && !orderBtn.disabled) {
    orderBtn.addEventListener('click', async () => {
      try {
        const res = await api.createOrder(s.currentAccount.id, s.state.dur);
        toast(res.msg);
        await s.refreshUser();
        await s.refreshOrders();
        goto('/user');
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  }

  const rechargeLink = document.querySelector('[data-act="recharge"]');
  if (rechargeLink) {
    rechargeLink.addEventListener('click', () => {
      openRechargeDialog(s);
    });
  }
}

async function openRechargeDialog(s) {
  const { openModal, closeModal } = await import('../components.js');
  openModal(`
    <h3>账户充值</h3>
    <p class="muted">演示环境，充值金额即时到账</p>
    <div class="amounts">
      ${[100, 500, 1000, 2000].map(v => `<div class="amt" data-act="doRecharge" data-v="${v}">¥${v}</div>`).join('')}
    </div>
    <button class="btn big" data-act="closeModal">取消</button>
  `);

  document.querySelectorAll('[data-act="doRecharge"]').forEach(el => {
    el.addEventListener('click', async () => {
      const amount = parseFloat(el.dataset.v);
      try {
        const res = await api.recharge(amount);
        toast(res.msg);
        await s.refreshUser();
        closeModal();
        const { navigate } = await import('../router.js');
        navigate();
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  });
}