const express = require('express');
const store = require('../utils/store');
const GAME_CONFIG = require('../config/games');
const router = express.Router();

const ME = 'u_me';
const NICK = ['小明','夜风','阿泽','橘猫','阿凯','咕咕','清风','阿杰','小北','橙子'];
const activeGameNames = () => GAME_CONFIG.filter(g => g.enabled).map(g => g.name);

router.get('/', (req, res) => {
  const db = store.getDb();
  const { game, keyword } = req.query;
  const games = activeGameNames();

  let list = db.accounts.filter(a => games.includes(a.game));
  if (game && game !== '全部') list = list.filter(a => a.game === game);
  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter(a =>
      a.title.toLowerCase().includes(kw) ||
      a.game.toLowerCase().includes(kw) ||
      (a.tags || []).join(',').toLowerCase().includes(kw)
    );
  }
  res.json({ code: 0, data: list });
});

router.get('/:id', (req, res) => {
  const db = store.getDb();
  const acc = db.accounts.find(a => a.id === req.params.id);
  if (!acc) return res.status(404).json({ code: 404, msg: '账号不存在' });

  const isOwner = acc.ownerId === ME;
  const isRentedByMe = db.orders.some(o =>
    o.accountId === acc.id && o.renterId === ME && o.status === 'ongoing'
  );
  const canSee = isOwner || isRentedByMe;

  res.json({
    code: 0,
    data: {
      ...acc,
      acc: canSee ? acc.acc : null,
      pwd: canSee ? acc.pwd : null,
      canSeeCred: canSee
    }
  });
});

router.post('/', (req, res) => {
  const db = store.getDb();
  const { game, title, desc, level, hourPrice, dayPrice, deposit, acc, pwd, tags } = req.body;

  const games = activeGameNames();
  if (!games.includes(game)) return res.status(400).json({ code: 400, msg: '游戏未启用' });
  if (!title || !level || !acc || !pwd) return res.status(400).json({ code: 400, msg: '请填写完整信息' });
  if (!(hourPrice > 0) || !(dayPrice > 0)) return res.status(400).json({ code: 400, msg: '价格不合法' });

  const newAcc = {
    id: 'a' + Date.now(),
    game, title,
    desc: desc || '号主暂未填写详细描述。',
    level,
    hourPrice: Math.round(hourPrice),
    dayPrice: Math.round(dayPrice),
    deposit: Math.max(0, Math.round(deposit || 0)),
    hot: 0, rentCount: 0, rating: 5.0,
    tags: Array.isArray(tags) && tags.length ? tags.slice(0, 3) : ['新上架', '秒发'],
    discount: '9.9折',
    ownerId: ME,
    ownerName: db.user.name,
    acc, pwd,
    status: 'idle',
    online: true
  };

  db.accounts.unshift(newAcc);
  store.save();
  res.json({ code: 0, data: newAcc, msg: '上架成功' });
});

router.post('/:id/simulate-rent', (req, res) => {
  const db = store.getDb();
  const acc = db.accounts.find(a => a.id === req.params.id);
  if (!acc) return res.status(404).json({ code: 404, msg: '账号不存在' });
  if (acc.ownerId !== ME) return res.status(403).json({ code: 403, msg: '无权操作' });
  if (acc.status === 'rented') return res.status(400).json({ code: 400, msg: '账号正在出租中' });

  const hourOptions = [2, 3, 6, 24];
  const hours = hourOptions[Math.floor(Math.random() * hourOptions.length)];
  const rent = hours >= 24
    ? Math.round(acc.dayPrice * (hours / 24) * 100) / 100
    : Math.round(acc.hourPrice * hours * 100) / 100;
  const durLabel = hours >= 24 ? (hours / 24) + '天' : hours + '小时';
  const now = Date.now();

  const order = {
    id: 'ORD' + String(now).slice(-8),
    accountId: acc.id,
    title: acc.title,
    game: acc.game,
    renterId: 'u_guest_' + Math.floor(Math.random() * 9000 + 1000),
    renterName: NICK[Math.floor(Math.random() * NICK.length)] + '**',
    ownerId: ME,
    ownerName: db.user.name,
    rent, deposit: acc.deposit,
    total: Math.round((rent + acc.deposit) * 100) / 100,
    hours, durLabel,
    startAt: now - hours * 3600 * 1000,
    endAt: now,
    finishedAt: now,
    status: 'finished'
  };

  db.orders.unshift(order);
  db.user.balance = Math.round((db.user.balance + rent) * 100) / 100;
  db.user.totalEarn = Math.round((db.user.totalEarn + rent) * 100) / 100;
  acc.rentCount = (acc.rentCount || 0) + 1;
  store.save();

  res.json({
    code: 0,
    data: order,
    msg: `租客「${order.renterName}」租用了「${acc.title}」${durLabel}，租金 ¥${rent} 已入账`
  });
});

module.exports = router;