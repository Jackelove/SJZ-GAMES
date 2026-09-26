import type {
  User, Account, Order, GameConfig, Duration, ApiResult
} from '@/types';

const BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data: ApiResult<T>;
  try {
    data = await res.json();
  } catch {
    throw new Error('服务器返回异常');
  }
  if (data.code !== 0) throw new Error(data.msg || '请求失败');
  return data.data;
}

export const api = {
  getConfig: () => request<{ games: GameConfig[]; durations: Duration[] }>('/config'),

  getAccounts: (params: { game?: string; keyword?: string } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<Account[]>('/accounts' + (q ? '?' + q : ''));
  },
  getAccount: (id: string) => request<Account>('/accounts/' + id),
  createAccount: (body: Partial<Account> & Record<string, unknown>) =>
    request<Account>('/accounts', { method: 'POST', body: JSON.stringify(body) }),
  simulateRent: (id: string) =>
    request<Order>(`/accounts/${id}/simulate-rent`, { method: 'POST' }),

  getOrders: (type: 'all' | 'rent' | 'rentout' = 'all') =>
    request<Order[]>('/orders?type=' + type),
  createOrder: (accountId: string, durKey: string) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ accountId, durKey })
    }),
  returnOrder: (id: string) =>
    request<Order>(`/orders/${id}/return`, { method: 'POST' }),

  getUser: () => request<User>('/user'),
  recharge: (amount: number) =>
    request<User>('/user/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount })
    })
};