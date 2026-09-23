const express = require('express');
const store = require('../utils/store');
const router = express.Router();

router.get('/', (req, res) => {
  const db = store.getDb();
  res.json({ code: 0, data: db.user });
});

router.post('/recharge', (req, res) => {
  const db = store.getDb();
  const amount = parseFloat(req.body.amount);
  if (!(amount > 0)) return res.status(400).json({ code: 400, msg: '充值金额不合法' });

  db.user.balance = Math.round((db.user.balance + amount) * 100) / 100;
  store.save();
  res.json({ code: 0, data: db.user, msg: `充值成功，¥${amount} 已到账` });
});

module.exports = router;