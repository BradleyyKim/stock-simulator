export interface IntelItem {
  id: string;
  grade: 'A' | 'B' | 'C';
  content: string;
}

export interface Stock {
  id: string;
  name: string;
  sector: 'ai' | 'energy' | 'bio' | 'semi' | 'game';
  currentPrice: number;
  previousPrice: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  round: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface AssetSnapshot {
  round: number;
  totalAssets: number;
}

export interface Player {
  id: string;
  name: string;
  pinLast4: string;
  cash: number;
  holdings: Record<string, number>;
  totalAssets: number;
  assetHistory: AssetSnapshot[];
  isOnline: boolean;
  purchasedIntels?: string[];
}

export interface Order {
  id: string;
  playerId: string;
  playerName: string;
  stockId: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  round: number;
  timestamp: number;
  status: 'filled' | 'cancelled';
}

export interface GameConfig {
  currentRound: number;
  totalRounds: number;
  phase: 'waiting' | 'trading' | 'paused' | 'reviewing' | 'ended';
  startingCash: number;
  leaderboardVisible: boolean;
  scenarioId: string | null;
  roundDuration: number;
  maxOrdersPerRound: number;
  session: number;
  roundAllowance: number;
  intelPrices: { A: number; B: number; C: number };
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  rounds: ScenarioRound[];
}

export interface ScenarioRound {
  round: number;
  news: string;
  hint1?: string;
  hint2?: string;
  hint3?: string;
  analysis?: string;
  priceChanges: Record<string, number>;
  intels?: IntelItem[];
  dateRange?: { start: string; end: string };
}

export interface SessionResult {
  session: number;
  date: string;
  rankings: { playerId: string; playerName: string; totalAssets: number; rank: number }[];
}
