import { usePlayerStore } from '@/store/playerStore';
import { useStockStore } from '@/store/stockStore';
import { formatCurrency } from '@/utils/format';
import { Card } from '@/components/UI/Card';
import { cn } from '@/utils/cn';
import { SECTOR_COLORS, SECTOR_LABELS, SECTOR_ICONS } from '@/data/scenarios';
import { AssetChart } from '@/components/Student/AssetChart';

export function Portfolio() {
  const { currentPlayer } = usePlayerStore();
  const { stocks } = useStockStore();

  if (!currentPlayer) return null;

  const holdings = Object.entries(currentPlayer.holdings || {}).filter(([, qty]) => qty > 0);

  // 현재 주가 기준으로 총 자산을 실시간 계산
  const investmentValue = holdings.reduce((sum, [stockId, qty]) => {
    const stock = stocks[stockId];
    return sum + (stock ? qty * stock.currentPrice : 0);
  }, 0);
  const totalAssets = currentPlayer.cash + investmentValue;

  return (
    <div className="px-4 space-y-3">
      <Card>
        <div className="text-center">
          <p className="text-sm text-gray-500">총 자산</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
          <div className="flex justify-center gap-6 mt-3">
            <div>
              <p className="text-xs text-gray-400">보유 현금</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(currentPlayer.cash)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">투자금</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(investmentValue)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <AssetChart />

      <Card title="보유 종목">
        {holdings.length === 0 ? (
          <p className="text-center text-gray-400 py-4">보유 종목이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {holdings.map(([stockId, qty]) => {
              const stock = stocks[stockId];
              if (!stock) return null;
              const value = qty * stock.currentPrice;

              return (
                <div key={stockId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: SECTOR_COLORS[stock.sector] }}
                    >
                      {(() => { const Icon = SECTOR_ICONS[stock.sector]; return Icon ? <Icon size={16} /> : stock.name[0]; })()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{SECTOR_LABELS[stock.sector]}</p>
                      <p className="text-xs text-gray-400">{qty}주 보유</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(value)}</p>
                    <p className={cn('text-xs', stock.currentPrice >= stock.previousPrice ? 'text-red-400' : 'text-blue-400')}>
                      현재가 {formatCurrency(stock.currentPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
