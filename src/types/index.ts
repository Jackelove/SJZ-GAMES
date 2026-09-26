export interface User {
  id: string;
  name: string;
  balance: number;
  totalEarn: number;
  totalSpend: number;
}

export interface Account {
  id: string;
  game: string;
  title: string;
  desc: string;
  level: string;
  hourPrice: number;
  dayPrice: number;
  deposit: number;
  hot: number;
  rentCount: number;
  rating: number;
  tags: string[];
  discount?: string;
  ownerId: string;
  ownerName: string;
  acc?: string | null;
  pwd?: string | null;
  canSeeCred?: boolean;
  status: 'idle' | 'rented';
  online?: boolean;
}

export interface Order {
  id: string;
  accountId: string;
  title: string;
  game: string;
  renterId: string;
  renterName: string;
  ownerId: string;
  ownerName: string;
  rent: number;
  deposit: number;
  total: number;
  hours: number;
  durLabel: string;
  startAt: number;
  endAt: number;
  finishedAt?: number;
  status: 'ongoing' | 'finished';
  acc?: string;
  pwd?: string;
}

export interface GameConfig {
  key: string;
  name: string;
  color: [string, string];
  defaultHour: number;
  defaultDay: number;
  defaultDeposit: number;
  seedTags: string;
  term?: { levelLabel?: string; levelPlaceholder?: string };
}

export interface Duration {
  key: string;
  label: string;
  hours: number;
  days?: number;
}

export interface ApiResult<T> {
  code: number;
  msg?: string;
  data: T;
}