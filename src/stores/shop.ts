import { defineStore } from 'pinia';
import { api } from '@/api';
import type { User, Account, Order, GameConfig, Duration } from '@/types';

export const useShopStore = defineStore('shop', {
  state: () => ({
    user: { id: 'u_me', name: '我的账号', balance: 0, totalEarn: 0, totalSpend: 0 } as User,
    accounts: [] as Account[],
    orders: [] as Order[],
    games: [] as GameConfig[],
    durations: [] as Duration[],

    gameFilter: '全部',
    keyword: '',
    currentDur: '1h',
    currentAccount: null as Account | null,

    publishForm: null as null | Record<string, string>
  }),

  getters: {
    gameMap(state): Record<string, GameConfig> {
      const m: Record<string, GameConfig> = {};
      state.games.forEach(g => { m[g.name] = g; });
      return m;
    },
    isSingleGame(state) {
      return state.games.length === 1;
    }
  },

  actions: {
    async refreshConfig() {
      const { games, durations } = await api.getConfig();
      this.games = games;
      this.durations = durations;
    },
    async refreshUser() {
      this.user = await api.getUser();
    },
    async refreshAccounts() {
      const params: { game?: string; keyword?: string } = {};
      if (this.gameFilter && this.gameFilter !== '全部') params.game = this.gameFilter;
      if (this.keyword) params.keyword = this.keyword;
      this.accounts = await api.getAccounts(params);
    },
    async refreshOrders() {
      this.orders = await api.getOrders();
    },
    async loadAccount(id: string) {
      this.currentAccount = await api.getAccount(id);
      return this.currentAccount;
    },
    gameColor(name: string): [string, string] {
      const cfg = this.gameMap[name];
      return cfg ? cfg.color : ['#1e3a8a', '#3b82f6'];
    },
    gameConfig(name: string): GameConfig | null {
      return this.gameMap[name] || this.games[0] || null;
    }
  }
});