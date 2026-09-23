const express = require('express');
const path = require('path');
const store = require('./utils/store');

const configRouter   = require('./routes/config');
const accountsRouter = require('./routes/accounts');
const ordersRouter   = require('./routes/orders');
const userRouter     = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/config',   configRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/orders',   ordersRouter);
app.use('/api/user',     userRouter);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, msg: 'ok', time: new Date().toISOString() });
});

// app.get('*', (req, res) => {
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ code: 404, msg: '接口不存在' });
//   }
//   res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ code: 404, msg: '接口不存在' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 定时任务：订单到期自动归还
setInterval(() => {
  const db = store.getDb();
  const now = Date.now();
  let changed = false;

  db.orders.forEach(o => {
    if (o.status === 'ongoing' && now >= o.endAt) {
      o.status = 'finished';
      o.finishedAt = now;
      if (o.renterId === 'u_me') {
        db.user.balance = Math.round((db.user.balance + o.deposit) * 100) / 100;
      }
      const acc = db.accounts.find(a => a.id === o.accountId);
      if (acc) acc.status = 'idle';
      changed = true;
    }
  });

  if (changed) store.save();
}, 5000);

app.listen(PORT, () => {
  console.log('');
  console.log('  ✦ 蒙多商行 · 游戏账号租赁平台');
  console.log('  ─────────────────────────────');
  console.log(`  ➜ 本地访问: http://localhost:${PORT}`);
  console.log('');
});