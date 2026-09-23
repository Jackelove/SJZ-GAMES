import { store } from '../store.js';
import { esc, money, fmtTime, fmtLeft, toast } from '../components.js';
import { api } from '../api.js';
import { navigate } from '../router.js';

export async function load(s) {
  await s.refreshUser();
  await s.refreshOrders();
  await s.refreshAccounts();
}

function orderRentHTML(o, s) {
  const c = s.gameColor(o.game);
  const ongoing = o.status === 'ongoing';
  const credHTML = ongoing
    ? `<div class="o-cred">
         <span>账号：<b>${esc(o.acc)}</b></span>
         <span>密码：<b>${esc(o.pwd)}</b></span>
         <button class="mini" data-act="copy" data-val="${esc(o.acc)}|${esc(o.pwd)}">复制</button>
       </div>
       <div class="o-count">剩余时间：<b data-countdown="${o.id}">${fmtLeft(o.endAt - Date.now())}</b> · 到期自动归还并退回押金</div>`
    : `<div class="o-sub" style="margin-bottom:0">完成时间：${fmtTime(o.finishedAt || o.endAt)} · 押金 ${money(o.deposit)} 已退回余额</div>`;

  return `
    <div class="order">
      <div class="o-head">
        <span class="o-id">订单号 ${o.id}</span>
        <span class="o-status ${o.status}">${ongoing ? '进行中' : '已完成'}</span>
      </div>
      <div class="o-body">
        <div class="o-cover" style="background:linear-gradient(135deg,${c[0]},${c[1]})">${esc(o.game)}</div>
        <div class="o-info">
          <div class="o-title">${esc(o.title)}</div>
          <div class="o-sub">时长 ${o.durLabel} · 租金 ${money(o.rent)} · 押金 ${money(o.deposit)} · 下单 ${fmtTime(o.startAt)}</div>
          ${credHTML}
        </div>
        <div class="o-right">
          <div class="o-total">${money(o.total)}</div>
          ${ongoing ? `<button class="btn small danger" data-act="return" data-id="${o.id}">立即归还</button>` : ''}
        </div>
      </div>
    </div>`;
}

function orderRentOutHTML(o, s) {
  const c = s.gameColor(o.game);
  return `
    <div class="order">
      <div class="o-head">
        <span class="o-id">订单号 ${o.id} · 租客 ${esc(o.renterName)}</span>
        <span class="o-status ${o.status}">${o.status === 'ongoing' ? '进行中' : '已结算'}</span>
      </div>
      <div class="o-body">
        <div class="o-cover" style="background:linear-gradient(135deg,${c[0]},${c[1]})">${esc(o.game)}</div>
        <div class="o-info">
          <div class="o-title">${esc(o.title)}</div>
          <div class="o-sub">时长 ${o.durLabel} · 租客支付 ${money(o.total)}（含押金 ${money(o.deposit)}）</div>
          <div class="o-sub" style="margin-bottom:0;color:var(--success)">收益 ${money(o.rent)} 已入账 · ${fmtTime(o.finishedAt || o.endAt)}</div>
        </div>
        <div class="o-right"><div class="o-total" style="color:var(--success)">+${money(o.rent)}</div></div>
      </div>
    </div>`;
}

export function render(s) {
  const myRentOrders = s.orders.filter(o => o.renterId === 'u_me');
  const myOutOrders = s.orders.filter(o => o.ownerId === 'u_me');
  const myAccounts = s.accounts.filter(a => a.ownerId === 'u_me');
  const tab = s.state.userTab;

  let body = '';

  if (tab === 'rent') {
    body = myRentOrders.length
      ? myRentOrders.map(o => orderRentHTML(o, s)).join('')
      : `<div class="empty"><div class="ico">🎮</div><p>还没有租过账号，去市场看看吧</p>
         <button class="btn primary" data-act="go" data-page="home">去租号</button></div>`;
  } else {
    const listHTML = myAccounts.length
      ? `<div class="grid" style="margin-bottom:26px">${myAccounts.map(a => {
          const c = s.gameColor(a.game);
          const badgeStyle = a.status === 'rented'
            ? 'background:linear-gradient(135deg,#64748b,#94a3b8)'
            : 'background:linear-gradient(135deg,#10b981,#059669)';
          const badgeTxt = a.status === 'rented' ? '出租中' : '在架';
          return `
            <div class="card" style="cursor:default">
              <div class="card-cover">
                <div class="game-bg" style="background:linear-gradient(135deg,${c[0]},${c[1]})"></div>
                <div class="game-txt">${esc(a.game)}</div>
                <div class="level-txt">${esc(a.level)}</div>
                <div class="discount-badge" style="${badgeStyle}">${badgeTxt}</div>
              </div>
              <div class="card-body">
                <div class="card-title" style="height:auto;margin-bottom:10px">${esc(a.title)}</div>
                <div class="card-foot" style="border-top:none;padding-top:0;margin-bottom:10px">
                  <div class="card-price"><em>¥</em><b>${a.hourPrice}</b><span>/小时</span></div>
                  <div class="card-dep">押金 ¥${a.deposit}</div>
                </div>
                <button class="btn acc small" style="width:100%" data-act="sim" data-id="${a.id}">模拟租客下单（演示）</button>
              </div>
            </div>`;
        }).join('')}</div>`
      : `<div class="empty"><div class="ico">📦</div><p>还没有出租中的账号</p>
         <button class="btn primary" data-act="go" data-page="publish">去发布账号</button></div>`;

    body = listHTML
      + `<div class="sec-title" style="margin:26px 0 14px">出租订单记录</div>`
      + (myOutOrders.length
          ? myOutOrders.map(o => orderRentOutHTML(o, s)).join('')
          : `<div class="empty" style="padding:40px 20px"><p>暂无出租订单<br>点击上方「模拟租客下单」体验收益结算</p></div>`);
  }

  return `
    <div class="page-wrap">
      <div class="back" data-act="go" data-page="home">← 返回首页</div>
      <div class="u-hero">
        <div class="u-avatar">我</div>
        <div>
          <div class="u-name">${esc(s.user.name)}<span class="u-uid">UID: 100086</span></div>
          <div class="u-badge">✔ 实名认证 · 信用极好</div>
        </div>
        <div class="u-stats">
          <div><b>${money(s.user.balance)}</b><span>账户余额</span></div>
          <div><b>${money(s.user.totalEarn)}</b><span>累计收益</span></div>
          <div><b>${money(s.user.totalSpend)}</b><span>累计消费</span></div>
          <button class="btn small" data-act="recharge" style="padding:10px 18px;background:#fff;color:#1e3a8a;border:none;font-weight:800">充值</button>
        </div>
      </div>
      <div class="tabs">
        <a data-act="userTab" data-tab="rent" class="${tab === 'rent' ? 'on' : ''}">我租的账号 (${myRentOrders.length})</a>
        <a data-act="userTab" data-tab="rentout" class="${tab === 'rentout' ? 'on' : ''}">我出租的账号 (${myAccounts.length})</a>
      </div>
      <div>${body}</div>
    </div>`;
}

export function mounted(s) {
  document.querySelectorAll('[data-act="userTab"]').forEach(el => {
    el.addEventListener('click', async () => {
      s.state.userTab = el.dataset.tab;
      await s.refreshOrders();
      await s.refreshAccounts();
      navigate();
    });
  });

  document.querySelectorAll('[data-act="return"]').forEach(el => {
    el.addEventListener('click', async () => {
      try {
        const res = await api.returnOrder(el.dataset.id);
        toast(res.msg);
        await s.refreshUser();
        await s.refreshOrders();
        await s.refreshAccounts();
        navigate();
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  });

  document.querySelectorAll('[data-act="sim"]').forEach(el => {
    el.addEventListener('click', async () => {
      try {
        const res = await api.simulateRent(el.dataset.id);
        toast(res.msg);
        await s.refreshUser();
        await s.refreshOrders();
        navigate();
      } catch (e) {
        toast(e.message, 'err');
      }
    });
  });

  const rechargeBtn = document.querySelector('[data-act="recharge"]');
  if (rechargeBtn) {
    rechargeBtn.addEventListener('click', async () => {
      const { openModal, closeModal } = await import('../components.js');
      openModal(`
        <h3>账户充值</h3>
        <p class="muted">演示环境，充值金额即时到账</p>
        <div class="amounts">
          ${[100, 500, 1000, 2000].map(v => `<div class="amt" data-act="doRecharge" data-v="${v}">¥${v}</div>`).join('')}
        </div>
        <button class="btn big" data-act="closeModal">取消</button>
      `);
      document.querySelectorAll('[data-act="doRecharge"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const res = await api.recharge(parseFloat(btn.dataset.v));
            toast(res.msg);
            await s.refreshUser();
            closeModal();
            navigate();
          } catch (e) { toast(e.message, 'err'); }
        });
      });
    });
  }
}