import { create } from 'zustand';
import { ref, onValue, update, set as fbSet } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Stock, PricePoint } from '@/types';
import { INITIAL_STOCKS } from '@/data/scenarios';

interface StockState {
  stocks: Record<string, Stock>;
  isLoading: boolean;
  subscribe: () => () => void;
  initializeStocks: () => Promise<void>;
  updatePrice: (stockId: string, newPrice: number, round: number) => Promise<void>;
  applyPriceChanges: (changes: Record<string, number>, round: number) => Promise<void>;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: {},
  isLoading: true,

  subscribe: () => {
    const stocksRef = ref(db, 'stocks');
    const unsub = onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        set({ stocks: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    });
    return unsub;
  },

  initializeStocks: async () => {
    const stocksData: Record<string, Stock> = {};
    for (const s of INITIAL_STOCKS) {
      stocksData[s.id] = {
        ...s,
        priceHistory: [{ round: 0, open: s.currentPrice, high: s.currentPrice, low: s.currentPrice, close: s.currentPrice }],
      };
    }
    await fbSet(ref(db, 'stocks'), stocksData);
  },

  updatePrice: async (stockId, newPrice, round) => {
    const stock = get().stocks[stockId];
    if (!stock) return;

    const prevPrice = stock.currentPrice;
    const high = Math.max(prevPrice, newPrice);
    const low = Math.min(prevPrice, newPrice);
    const newPoint: PricePoint = { round, open: prevPrice, high, low, close: newPrice };

    const history = [...(stock.priceHistory || []), newPoint];

    await update(ref(db, `stocks/${stockId}`), {
      currentPrice: newPrice,
      previousPrice: prevPrice,
      priceHistory: history,
    });
  },

  applyPriceChanges: async (changes, round) => {
    const { stocks } = get();
    const updates: Record<string, unknown> = {};

    for (const [stockId, changeRate] of Object.entries(changes)) {
      const stock = stocks[stockId];
      if (!stock) continue;

      const prevPrice = stock.currentPrice;
      const newPrice = Math.round(prevPrice * (1 + changeRate));
      const high = Math.max(prevPrice, newPrice);
      const low = Math.min(prevPrice, newPrice);
      const newPoint: PricePoint = { round, open: prevPrice, high, low, close: newPrice };
      const history = [...(stock.priceHistory || []), newPoint];

      updates[`stocks/${stockId}/currentPrice`] = newPrice;
      updates[`stocks/${stockId}/previousPrice`] = prevPrice;
      updates[`stocks/${stockId}/priceHistory`] = history;
    }

    await update(ref(db), updates);
  },
}));
