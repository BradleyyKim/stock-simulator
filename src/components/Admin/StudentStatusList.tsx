import { usePlayerStore } from '@/store/playerStore';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

export function StudentStatusList() {
  const { players } = usePlayerStore();

  const sorted = Object.values(players).sort((a, b) => b.totalAssets - a.totalAssets);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="font-bold">학생 현황</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-4 py-2 text-left">순위</th>
              <th className="px-4 py-2 text-left">이름</th>
              <th className="px-4 py-2 text-right">현금</th>
              <th className="px-4 py-2 text-right">총자산</th>
              <th className="px-4 py-2 text-right">수익률</th>
              <th className="px-4 py-2 text-center">상태</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => {
              const profit = player.totalAssets - 100000;
              const profitRate = ((profit / 100000) * 100).toFixed(1);

              return (
                <tr key={player.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{player.name}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(player.cash)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(player.totalAssets)}</td>
                  <td className={cn('px-4 py-3 text-right font-medium', profit >= 0 ? 'text-red-500' : 'text-blue-500')}>
                    {profit >= 0 ? '+' : ''}{profitRate}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('w-2 h-2 rounded-full inline-block', player.isOnline ? 'bg-green-400' : 'bg-gray-300')} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
