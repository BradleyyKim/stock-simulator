import { useState } from 'react';
import { useStockStore } from '@/store/stockStore';
import { usePlayerStore } from '@/store/playerStore';
import { useOrderStore } from '@/store/orderStore';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { SECTOR_LABELS } from '@/data/scenarios';

interface OrderFormProps {
  stockId: string | null;
  onClose: () => void;
}

export function OrderForm({ stockId, onClose }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { stocks } = useStockStore();
  const { currentPlayer } = usePlayerStore();
  const { submitOrder } = useOrderStore();
  const { config } = useGameStore();

  const stock = stockId ? stocks[stockId] : null;

  if (!stock || !currentPlayer) return null;

  const totalCost = stock.currentPrice * quantity;
  const maxBuy = Math.floor(currentPlayer.cash / stock.currentPrice);
  const maxSell = currentPlayer.holdings?.[stock.id] || 0;
  const maxQuantity = orderType === 'buy' ? maxBuy : maxSell;
  const canTrade = config.phase === 'trading';

  const handleSubmit = async () => {
    if (!canTrade) {
      setMessage('현재 거래가 불가능한 상태입니다.');
      return;
    }
    setLoading(true);
    setMessage('');

    const result = await submitOrder({
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      stockId: stock.id,
      type: orderType,
      quantity,
      price: stock.currentPrice,
      round: config.currentRound,
    });

    setLoading(false);
    setMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        onClose();
        setMessage('');
        setQuantity(1);
      }, 800);
    }
  };

  return (
    <Modal isOpen={!!stockId} onClose={onClose} title={`${SECTOR_LABELS[stock.sector]} 주문`}>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{formatCurrency(stock.currentPrice)}</p>
          <p className="text-sm text-gray-400">현재가</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => { setOrderType('buy'); setQuantity(1); }}
            className={`flex-1 py-3 font-semibold text-center transition-colors ${orderType === 'buy' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500'}`}
          >
            매수
          </button>
          <button
            onClick={() => { setOrderType('sell'); setQuantity(1); }}
            className={`flex-1 py-3 font-semibold text-center transition-colors ${orderType === 'sell' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500'}`}
          >
            매도
          </button>
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">수량</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg bg-gray-100 font-bold text-lg"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))}
              className="flex-1 text-center text-xl font-bold border border-gray-200 rounded-lg py-2"
              inputMode="numeric"
            />
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              className="w-10 h-10 rounded-lg bg-gray-100 font-bold text-lg"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            최대 {maxQuantity}주 {orderType === 'buy' ? '매수' : '매도'} 가능
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 {orderType === 'buy' ? '매수' : '매도'} 금액</span>
            <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
          </div>
          {orderType === 'buy' && (
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>주문 후 잔여 현금</span>
              <span>{formatCurrency(currentPlayer.cash - totalCost)}</span>
            </div>
          )}
        </div>

        {message && (
          <p className={`text-center text-sm font-medium ${message.includes('체결') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <Button
          variant={orderType === 'buy' ? 'buy' : 'sell'}
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          loading={loading}
          disabled={!canTrade || quantity <= 0 || quantity > maxQuantity}
        >
          {quantity}주 {orderType === 'buy' ? '매수' : '매도'}하기
        </Button>
      </div>
    </Modal>
  );
}
