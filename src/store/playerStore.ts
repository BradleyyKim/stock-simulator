import { create } from 'zustand';
import { ref, onValue, update, set as fbSet, get as fbGet } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Player } from '@/types';

interface PlayerState {
  currentPlayer: Player | null;
  players: Record<string, Player>;
  isLoading: boolean;
  subscribe: () => () => void;
  login: (name: string, pin: string) => Promise<boolean>;
  logout: () => void;
  initializePlayers: (playerList: { name: string; pin: string }[]) => Promise<void>;
  updatePlayerCash: (playerId: string, amount: number) => Promise<void>;
  updatePlayerHolding: (playerId: string, stockId: string, quantityDelta: number) => Promise<void>;
  recalculateTotalAssets: (playerId: string, stockPrices: Record<string, number>) => Promise<void>;
  recalculateAllAssets: (stockPrices: Record<string, number>, round: number) => Promise<void>;
  resetAllPlayers: (startingCash: number) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentPlayer: null,
  players: {},
  isLoading: true,

  subscribe: () => {
    const playersRef = ref(db, 'players');
    const unsub = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        set({ players: data, isLoading: false });
        const current = get().currentPlayer;
        if (current && data[current.id]) {
          set({ currentPlayer: data[current.id] });
        }
      } else {
        set({ isLoading: false });
      }
    });
    return unsub;
  },

  login: async (name, pin) => {
    const snapshot = await fbGet(ref(db, 'players'));
    const players = snapshot.val() as Record<string, Player> | null;
    if (!players) return false;

    const player = Object.values(players).find(
      (p) => p.name === name && p.pinLast4 === pin
    );
    if (player) {
      await update(ref(db, `players/${player.id}`), { isOnline: true });
      set({ currentPlayer: player });
      return true;
    }
    return false;
  },

  logout: () => {
    const current = get().currentPlayer;
    if (current) {
      update(ref(db, `players/${current.id}`), { isOnline: false });
    }
    set({ currentPlayer: null });
  },

  initializePlayers: async (playerList) => {
    const playersData: Record<string, Player> = {};
    playerList.forEach((p, i) => {
      const id = `player-${i + 1}`;
      playersData[id] = {
        id,
        name: p.name,
        pinLast4: p.pin,
        cash: 100000,
        holdings: {},
        totalAssets: 100000,
        assetHistory: [{ round: 0, totalAssets: 100000 }],
        isOnline: false,
      };
    });
    await fbSet(ref(db, 'players'), playersData);
  },

  updatePlayerCash: async (playerId, amount) => {
    const player = get().players[playerId];
    if (!player) return;
    await update(ref(db, `players/${playerId}`), { cash: player.cash + amount });
  },

  updatePlayerHolding: async (playerId, stockId, quantityDelta) => {
    const player = get().players[playerId];
    if (!player) return;
    const currentQty = player.holdings[stockId] || 0;
    const newQty = currentQty + quantityDelta;
    await update(ref(db, `players/${playerId}/holdings`), { [stockId]: newQty });
  },

  recalculateTotalAssets: async (playerId, stockPrices) => {
    const player = get().players[playerId];
    if (!player) return;

    let total = player.cash;
    for (const [stockId, qty] of Object.entries(player.holdings || {})) {
      if (stockPrices[stockId]) {
        total += qty * stockPrices[stockId];
      }
    }
    await update(ref(db, `players/${playerId}`), { totalAssets: total });
  },

  recalculateAllAssets: async (stockPrices, round) => {
    const { players } = get();
    const updates: Record<string, unknown> = {};

    for (const player of Object.values(players)) {
      let total = player.cash;
      for (const [stockId, qty] of Object.entries(player.holdings || {})) {
        if (stockPrices[stockId]) {
          total += qty * stockPrices[stockId];
        }
      }
      updates[`players/${player.id}/totalAssets`] = total;
      const history = [...(player.assetHistory || []), { round, totalAssets: total }];
      updates[`players/${player.id}/assetHistory`] = history;
    }
    await update(ref(db), updates);
  },

  resetAllPlayers: async (startingCash) => {
    const { players } = get();
    const updates: Record<string, unknown> = {};

    for (const player of Object.values(players)) {
      updates[`players/${player.id}/cash`] = startingCash;
      updates[`players/${player.id}/holdings`] = {};
      updates[`players/${player.id}/totalAssets`] = startingCash;
      updates[`players/${player.id}/assetHistory`] = [{ round: 0, totalAssets: startingCash }];
    }
    await update(ref(db), updates);
  },
}));
