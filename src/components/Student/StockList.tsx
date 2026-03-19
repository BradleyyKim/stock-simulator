import { useStockStore } from '@/store/stockStore';
import { SECTOR_COLORS, SECTOR_ICONS } from '@/data/scenarios';
import { formatCurrency, formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/UI/Badge';

interface StockListProps {
  onSelectStock: (stockId: string) => void;
}

export function StockList({ onSelectStock }: StockListProps) {
  const { stocks } = useStockStore();

  return (
    <div className="space-y-2 px-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">종목 현황</h2>
      {Object.values(stocks).map((stock) => {
        const change = stock.currentPrice - stock.previousPrice;
        const isUp = change > 0;
        const isDown = change < 0;

        return (
          <button
            key={stock.id}
            onClick={() => onSelectStock(stock.id)}
            className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm active:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: SECTOR_COLORS[stock.sector] }}
                >
                  {(() => { const Icon = SECTOR_ICONS[stock.sector]; return Icon ? <Icon size={20} /> : stock.name[0]; })()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{stock.name}</p>
                  <Badge variant={isUp ? 'up' : isDown ? 'down' : 'neutral'}>
                    {formatPercent(stock.currentPrice, stock.previousPrice)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className={cn('text-lg font-bold', isUp && 'text-red-500', isDown && 'text-blue-500')}>
                  {formatCurrency(stock.currentPrice)}
                </p>
                <p className={cn('text-sm', isUp && 'text-red-400', isDown && 'text-blue-400')}>
                  {change > 0 ? '+' : ''}{change.toLocaleString()}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
