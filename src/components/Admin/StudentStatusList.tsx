import { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useStockStore } from '@/store/stockStore';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';

interface EditTarget {
  id: string;
  name: string;
  pin: string;
  cash: number;
}

export function StudentStatusList() {
  const { players, setPlayerCash, updatePlayer, removePlayer } = usePlayerStore();
  const { stocks } = useStockStore();
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [cashInput, setCashInput] = useState('');

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
    .sort((a, b) => b.totalAssets - a.totalAssets);

  const handleEditClick = (player: typeof sorted[number]) => {
    setEditTarget({
      id: player.id,
      name: player.name,
      pin: player.pinLast4,
      cash: player.cash,
    });
    setCashInput(String(player.cash));
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const player = players[editTarget.id];
    if (!player) return;

    if (editTarget.name !== player.name || editTarget.pin !== player.pinLast4) {
      await updatePlayer(editTarget.id, { name: editTarget.name, pinLast4: editTarget.pin });
    }

    const newCash = Number(cashInput);
    if (!isNaN(newCash) && newCash !== player.cash) {
      await setPlayerCash(editTarget.id, newCash);
    }

    setEditTarget(null);
  };

  const handleRemove = async () => {
    if (!editTarget) return;
    if (window.confirm(`${editTarget.name} 학생을 정말 삭제하시겠습니까?\n모든 데이터가 삭제됩니다.`)) {
      await removePlayer(editTarget.id);
      setEditTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold">학생 현황</h2>
        <span className="text-xs text-gray-400">{sorted.length}명 | 클릭하여 수정</span>
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
                <tr
                  key={player.id}
                  onClick={() => handleEditClick(player)}
                  className="border-b border-gray-50 last:border-0 hover:bg-blue-50 cursor-pointer transition-colors"
                >
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
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">등록된 학생이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="학생 정보 수정">
        {editTarget && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이름</label>
              <input
                value={editTarget.name}
                onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호 (4자리)</label>
              <input
                value={editTarget.pin}
                onChange={(e) => setEditTarget({ ...editTarget, pin: e.target.value })}
                maxLength={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">보유 현금 (원)</label>
              <input
                type="number"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">금액을 직접 변경하면 총자산에도 반영됩니다.</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">저장</Button>
              <Button variant="danger" onClick={handleRemove} className="flex-1">학생 삭제</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
