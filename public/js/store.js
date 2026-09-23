import { api } from './api.js';

export const store = {
  state: {
    page: 'home',
    detailId: null,
    game: '全部',
    keyword: '',
    dur: '1h',
    userTab: 'rent',
    pubGame: null,
    pubForm: null
  },

  games: [],
  durations: [],
  accounts: [],
  orders: [],
  currentAccount: null,
  user: { balance: 0, totalEarn: 0, totalSpend: 0, name: '我的账号' },
  gameMap: {},

  setState(patch) { Object.assign(this.state, patch); },

  async refreshConfig() {
    const data = await api.getConfig();
    this.games = data.data.games;
    this.durations = data.data.durations;
    this.gameMap = {};
    this.games.forEach(g => { this.gameMap[g.name] = g; });
    if (!this.state.pubGame && this.games.length > 0) {
      this.state.pubGame = this.games[0].name;
    }
  },

  async refreshUser() {
    const res = await api.getUser();
    this.user = res.data;
  },

  async refreshAccounts() {
    const params = {};
    if (this.state.game && this.state.game !== '全部') params.game = this.state.game;
    if (this.state.keyword) params.keyword = this.state.keyword;
    const res = await api.getAccounts(params);
    this.accounts = res.data;
  },

  async refreshOrders() {
    const res = await api.getOrders();
    this.orders = res.data;
  },

  async loadAccount(id) {
    const res = await api.getAccount(id);
    this.currentAccount = res.data;
    return this.currentAccount;
  },

  gameConfig(name) {
    return this.gameMap[name] || this.games[0] || { color: ['#1e3a8a','#3b82f6'], term: {} };
  },

  gameColor(name) {
    const cfg = this.gameMap[name];
    return cfg ? cfg.color : ['#1e3a8a', '#3b82f6'];
  }
};