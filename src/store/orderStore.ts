import { create } from 'zustand';
import { ref, onValue, push, update, get as fbGet } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Order } from '@/types';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  subscribe: () => () => void;
  submitOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<{ success: boolean; message: string }>;
  getPlayerOrders: (playerId: string) => Order[];
  getRoundOrders: (round: number) => Order[];
  clearOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: true,

  subscribe: () => {
    const ordersRef = ref(db, 'orders');
    const unsub = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.entries(data).map(([id, val]) => ({
          ...(val as Order),
          id,
        }));
        set({ orders: orderList, isLoading: false });
      } else {
        set({ orders: [], isLoading: false });
      }
    });
    return unsub;
  },

  submitOrder: async (orderData) => {
    const playerSnap = await fbGet(ref(db, `players/${orderData.playerId}`));
    const player = playerSnap.val();
    if (!player) return { success: false, message: '플레이어를 찾을 수 없습니다.' };

    const totalCost = orderData.price * orderData.quantity;

    if (orderData.type === 'buy') {
      if (player.cash < totalCost) {
        return { success: false, message: '현금이 부족합니다.' };
      }
      await update(ref(db, `players/${orderData.playerId}`), {
        cash: player.cash - totalCost,
      });
      const currentHolding = player.holdings?.[orderData.stockId] || 0;
      await update(ref(db, `players/${orderData.playerId}/holdings`), {
        [orderData.stockId]: currentHolding + orderData.quantity,
      });
    } else {
      const currentHolding = player.holdings?.[orderData.stockId] || 0;
      if (currentHolding < orderData.quantity) {
        return { success: false, message: '보유 수량이 부족합니다.' };
      }
      await update(ref(db, `players/${orderData.playerId}`), {
        cash: player.cash + totalCost,
      });
      await update(ref(db, `players/${orderData.playerId}/holdings`), {
        [orderData.stockId]: currentHolding - orderData.quantity,
      });
    }

    const order: Omit<Order, 'id'> = {
      ...orderData,
      timestamp: Date.now(),
      status: 'filled',
    };

    await push(ref(db, 'orders'), order);
    return { success: true, message: '주문이 체결되었습니다.' };
  },

  getPlayerOrders: (playerId) => {
    return get().orders.filter((o) => o.playerId === playerId);
  },

  getRoundOrders: (round) => {
    return get().orders.filter((o) => o.round === round);
  },

  clearOrders: async () => {
    const { default: fbRemove } = await import('firebase/database').then(m => ({ default: m.remove }));
    await fbRemove(ref(db, 'orders'));
  },
}));
