const fs = require('fs');
const path = require('path');
const seed = require('../data/seed');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
let cache = null;

function initData() {
  const data = JSON.parse(JSON.stringify(seed));
  data.accounts = data.accounts.map(a => ({
    ...a,
    status: 'idle',
    rentCount: a.hot || 0
  }));
  return data;
}

function getDb() {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_FILE)) {
      cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } else {
      cache = initData();
      save();
    }
  } catch (e) {
    console.error('[store] 读取失败，使用初始数据:', e.message);
    cache = initData();
  }
  return cache;
}

function save() {
  if (!cache) return;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (e) {
    console.error('[store] 保存失败:', e.message);
  }
}

module.exports = { getDb, save };