const express = require('express');
const store = require('../utils/store');
const DURATIONS = require('../config/durations');
const router = express.Router();

const ME = 'u_me';

router.get('/', (req, res) => {
  const db = store.getDb();
  const type = req.query.type || 'all';
  let list = db.orders;
  if (type === 'rent') list = list.filter(o => o.renterId === ME);
  else if (type === 'rentout') list = list.filter(o => o.ownerId === ME);
  res.json({ code: 0, data: list });
});

router.post('/', (req, res) => {
  const db = store.getDb();
  const { accountId, durKey } = req.body;

  const acc = db.accounts.find(a => a.id === accountId);
  if (!acc) return res.status(404).json({ code: 404, msg: '账号不存在' });
  if (acc.ownerId === ME) return res.status(400).json({ code: 400, msg: '不能租用自己发布的账号' });
  if (acc.status === 'rented') return res.status(400).json({ code: 400, msg: '该账号正在出租中' });

  const dur = DURATIONS.find(d => d.key === durKey) || DURATIONS[0];
  const rent = dur.days ? acc.dayPrice * dur.days : acc.hourPrice * dur.hours;
  const total = Math.round((rent + acc.deposit) * 100) / 100;

  if (db.user.balance < total) return res.status(400).json({ code: 400, msg: '余额不足，请先充值' });

  db.user.balance = Math.round((db.user.balance - total) * 100) / 100;
  db.user.totalSpend = Math.round((db.user.totalSpend + rent) * 100) / 100;
  acc.status = 'rented';
  acc.rentCount = (acc.rentCount || 0) + 1;

  const now = Date.now();
  const order = {
    id: 'ORD' + String(now).slice(-8),
    accountId: acc.id,
    title: acc.title,
    game: acc.game,
    renterId: ME,
    renterName: db.user.name,
    ownerId: acc.ownerId,
    ownerName: acc.ownerName,
    rent,
    deposit: acc.deposit,
    total,
    hours: dur.hours,
    durLabel: dur.label,
    startAt: now,
    endAt: now + dur.hours * 3600 * 1000,
    status: 'ongoing',
    acc: acc.acc,
    pwd: acc.pwd
  };

  db.orders.unshift(order);
  store.save();

  res.json({ code: 0, data: order, msg: '租用成功！' });
});

router.post('/:id/return', (req, res) => {
  const db = store.getDb();
  const o = db.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ code: 404, msg: '订单不存在' });
  if (o.status !== 'ongoing') return res.status(400).json({ code: 400, msg: '订单已结束' });

  o.status = 'finished';
  o.finishedAt = Date.now();

  if (o.renterId === ME) {
    db.user.balance = Math.round((db.user.balance + o.deposit) * 100) / 100;
  }

  const acc = db.accounts.find(a => a.id === o.accountId);
  if (acc) acc.status = 'idle';

  store.save();
  res.json({ code: 0, data: o, msg: `归还成功，押金 ¥${o.deposit} 已退回余额` });
});

module.exports = router;