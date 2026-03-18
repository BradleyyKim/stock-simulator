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

export interface Player {
  id: string;
  name: string;
  pinLast4: string;
  cash: number;
  holdings: Record<string, number>;
  totalAssets: number;
  isOnline: boolean;
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
  priceChanges: Record<string, number>;
}

export interface SessionResult {
  session: number;
  date: string;
  rankings: { playerId: string; playerName: string; totalAssets: number; rank: number }[];
}
