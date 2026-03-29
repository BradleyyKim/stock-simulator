import { create } from 'zustand';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { GameConfig } from '@/types';

const DEFAULT_CONFIG: GameConfig = {
  currentRound: 0,
  totalRounds: 6,
  phase: 'waiting',
  startingCash: 100000,
  leaderboardVisible: true,
  scenarioId: null,
  roundDuration: 0,
  maxOrdersPerRound: 0,
  session: 1,
  roundAllowance: 100000,
  intelPrices: { A: 5000, B: 3000, C: 1000 },
};

interface HintState {
  hint1: string;
  hint2: string;
  hint3: string;
  visibleHints: number;
  analysis: string;
}

interface GameState {
  config: GameConfig;
  hints: HintState;
  isLoading: boolean;
  subscribe: () => () => void;
  updateConfig: (partial: Partial<GameConfig>) => Promise<void>;
  startRound: () => Promise<void>;
  endRound: () => Promise<void>;
  nextRound: () => Promise<void>;
  setPhase: (phase: GameConfig['phase']) => Promise<void>;
  setHints: (hints: Partial<HintState>) => Promise<void>;
  revealNextHint: () => Promise<void>;
  resetCurrentRound: () => Promise<void>;
  toggleLeaderboard: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  config: DEFAULT_CONFIG,
  hints: { hint1: '', hint2: '', hint3: '', visibleHints: 0, analysis: '' },
  isLoading: true,

  subscribe: () => {
    const gameRef = ref(db, 'game');
    const hintsRef = ref(db, 'hints');

    const unsubGame = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        set({ config: { ...DEFAULT_CONFIG, ...data }, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    });

    const unsubHints = onValue(hintsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        set({ hints: { ...get().hints, ...data } });
      }
    });

    return () => {
      unsubGame();
      unsubHints();
    };
  },

  updateConfig: async (partial) => {
    await update(ref(db, 'game'), partial);
  },

  startRound: async () => {
    const { config } = get();
    await update(ref(db, 'game'), {
      currentRound: config.currentRound + 1,
      phase: 'trading',
    });
    await update(ref(db, 'hints'), { visibleHints: 0, hint1: '', hint2: '', hint3: '' });
  },

  endRound: async () => {
    await update(ref(db, 'game'), { phase: 'reviewing' });
  },

  nextRound: async () => {
    await update(ref(db, 'game'), { phase: 'waiting' });
    await update(ref(db, 'hints'), { visibleHints: 0 });
  },

  setPhase: async (phase) => {
    await update(ref(db, 'game'), { phase });
  },

  setHints: async (hints) => {
    await update(ref(db, 'hints'), hints);
  },

  revealNextHint: async () => {
    const { hints } = get();
    const next = Math.min(hints.visibleHints + 1, 3);
    await update(ref(db, 'hints'), { visibleHints: next });
  },

  resetCurrentRound: async () => {
    const { config } = get();
    await update(ref(db, 'game'), {
      currentRound: Math.max(0, config.currentRound - 1),
      phase: 'waiting',
    });
    await update(ref(db, 'hints'), {
      hint1: '',
      hint2: '',
      hint3: '',
      visibleHints: 0,
      analysis: '',
    });
  },

  toggleLeaderboard: async () => {
    const { config } = get();
    await update(ref(db, 'game'), { leaderboardVisible: !config.leaderboardVisible });
  },
}));
