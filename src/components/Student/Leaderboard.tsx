import { usePlayerStore } from '@/store/playerStore';
import { useStockStore } from '@/store/stockStore';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/utils/format';
import { Card } from '@/components/UI/Card';
import { cn } from '@/utils/cn';

export function Leaderboard() {
  const { players, currentPlayer } = usePlayerStore();
  const { stocks } = useStockStore();
  const { config } = useGameStore();

  if (!config.leaderboardVisible) {
    return (
      <div className="px-4">
        <Card>
          <p className="text-center text-gray-400 py-8">현재 순위판이 비공개 상태입니다</p>
        </Card>
      </div>
    );
  }

  // 현재 주가 기준으로 총 자산을 실시간 계산
  const calcTotalAssets = (player: typeof players[string]) => {
    let total = player.cash;
    for (const [stockId, qty] of Object.entries(player.holdings || {})) {
      if (stocks[stockId]) {
        total += qty * stocks[stockId].currentPrice;
      }
    }
    return total;
  };

  const sorted = Object.values(players)
    .map((p) => ({ ...p, totalAssets: calcTotalAssets(p) }))
    .sort((a, b) => b.totalAssets - a.totalAssets)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="px-4">
      <Card title="순위판">
        <div className="space-y-2">
          {sorted.map((player) => {
            const isMe = currentPlayer?.id === player.id;
            const profit = player.totalAssets - 100000;
            const profitRate = ((profit / 100000) * 100).toFixed(1);

            return (
              <div
                key={player.id}
                className={cn(
                  'flex items-center justify-between py-3 px-3 rounded-lg transition-colors',
                  isMe ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('text-lg font-bold w-8 text-center', player.rank <= 3 ? medalColors[player.rank - 1] : 'text-gray-400')}>
                    {player.rank}
                  </span>
                  <div>
                    <p className={cn('font-medium', isMe && 'text-blue-700')}>
                      {player.name} {isMe && '(나)'}
                    </p>
                    <p className={cn('text-xs', profit >= 0 ? 'text-red-400' : 'text-blue-400')}>
                      {profit >= 0 ? '+' : ''}{profitRate}%
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-800">{formatCurrency(player.totalAssets)}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
