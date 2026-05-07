import { useState } from 'react';
import { useStockStore } from '@/store/stockStore';
import { usePlayerStore } from '@/store/playerStore';
import { useOrderStore } from '@/store/orderStore';
import { useGameStore } from '@/store/gameStore';
import { StockChart } from '@/components/Student/StockChart';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { SECTOR_LABELS, SECTOR_COLORS, SECTOR_ICONS } from '@/data/scenarios';
import { formatCurrency, formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';

interface StockDetailProps {
  stockId: string | null;
  onClose: () => void;
}

export function StockDetail({ stockId, onClose }: StockDetailProps) {
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

  const change = stock.currentPrice - stock.previousPrice;
  const isUp = change > 0;
  const isDown = change < 0;
  const totalCost = stock.currentPrice * quantity;
  const maxBuy = Math.floor(currentPlayer.cash / stock.currentPrice);
  const maxSell = currentPlayer.holdings?.[stock.id] || 0;
  const maxQuantity = orderType === 'buy' ? maxBuy : maxSell;
  const canTrade = config.phase === 'trading';
  const Icon = SECTOR_ICONS[stock.sector];

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
        setMessage('');
        setQuantity(1);
      }, 800);
    }
  };

  const handleClose = () => {
    setMessage('');
    setQuantity(1);
    setOrderType('buy');
    onClose();
  };

  return (
    <Modal isOpen={!!stockId} onClose={handleClose} title={SECTOR_LABELS[stock.sector]} className="max-w-lg">
      {/* 종목 요약 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: SECTOR_COLORS[stock.sector] }}
          >
            {Icon ? <Icon size={20} /> : stock.name[0]}
          </div>
          <div>
            <p className={cn('text-2xl font-bold', isUp && 'text-red-500', isDown && 'text-blue-500')}>
              {formatCurrency(stock.currentPrice)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={isUp ? 'up' : isDown ? 'down' : 'neutral'}>
                {formatPercent(stock.currentPrice, stock.previousPrice)}
              </Badge>
              <span className={cn('text-sm', isUp && 'text-red-400', isDown && 'text-blue-400')}>
                {change > 0 ? '+' : ''}{change.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        {maxSell > 0 && (
          <p className="text-xs text-gray-400">{maxSell}주 보유</p>
        )}
      </div>

      {/* 차트 */}
      <div className="mb-4 -mx-1">
        <StockChart stockId={stock.id} />
      </div>

      {/* 주문 영역 */}
      {canTrade && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => { setOrderType('buy'); setQuantity(1); setMessage(''); }}
              className={`flex-1 py-2.5 font-semibold text-center text-sm transition-colors ${orderType === 'buy' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500'}`}
            >
              매수
            </button>
            <button
              onClick={() => { setOrderType('sell'); setQuantity(1); setMessage(''); }}
              className={`flex-1 py-2.5 font-semibold text-center text-sm transition-colors ${orderType === 'sell' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-500'}`}
            >
              매도
            </button>
          </div>

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

          <div className="flex justify-between text-sm text-gray-500">
            <span>총 {orderType === 'buy' ? '매수' : '매도'} 금액</span>
            <span className="font-bold text-gray-800">{formatCurrency(totalCost)}</span>
          </div>
          <p className="text-xs text-gray-400 text-right">
            최대 {maxQuantity}주 {orderType === 'buy' ? '매수' : '매도'} 가능
          </p>

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
            disabled={quantity <= 0 || quantity > maxQuantity}
          >
            {quantity}주 {orderType === 'buy' ? '매수' : '매도'}하기
          </Button>
        </div>
      )}

      {!canTrade && (
        <p className="text-center text-sm text-gray-400 border-t border-gray-100 pt-4">
          거래 시간이 아닙니다
        </p>
      )}
    </Modal>
  );
}
