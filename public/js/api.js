const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data;
  try { data = await res.json(); }
  catch { throw new Error('服务器返回异常'); }
  if (data.code !== 0) throw new Error(data.msg || '请求失败');
  return data;
}

export const api = {
  getConfig:    () => request('/config'),
  getAccounts:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('/accounts' + (q ? '?' + q : ''));
  },
  getAccount:   (id) => request('/accounts/' + id),
  createAccount: (body) => request('/accounts', { method: 'POST', body: JSON.stringify(body) }),
  simulateRent: (id) => request('/accounts/' + id + '/simulate-rent', { method: 'POST' }),

  getOrders:    (type = 'all') => request('/orders?type=' + type),
  createOrder:  (accountId, durKey) => request('/orders', {
    method: 'POST',
    body: JSON.stringify({ accountId, durKey })
  }),
  returnOrder:  (id) => request('/orders/' + id + '/return', { method: 'POST' }),

  getUser:      () => request('/user'),
  recharge:     (amount) => request('/user/recharge', {
    method: 'POST',
    body: JSON.stringify({ amount })
  })
};