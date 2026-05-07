import { useMemo, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useStockStore } from '@/store/stockStore';
import { useOrderStore } from '@/store/orderStore';
import { useScenarioStore } from '@/store/scenarioStore';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { SECTOR_LABELS } from '@/data/scenarios';

interface EditTarget {
  id: string;
  name: string;
  pin: string;
  cash: number;
}

type DetailTab = 'edit' | 'intels' | 'orders';

const GRADE_BADGE: Record<'A' | 'B' | 'C', string> = {
  A: 'bg-amber-100 text-amber-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-gray-100 text-gray-600',
};

export function StudentStatusList() {
  const { players, setPlayerCash, updatePlayer, removePlayer } = usePlayerStore();
  const { stocks } = useStockStore();
  const { orders } = useOrderStore();
  const { scenarios } = useScenarioStore();
  const { config } = useGameStore();
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [cashInput, setCashInput] = useState('');
  const [detailTab, setDetailTab] = useState<DetailTab>('edit');
  const [orderRoundFilter, setOrderRoundFilter] = useState<number | 'all'>('all');

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
    setDetailTab('edit');
    setOrderRoundFilter('all');
  };

  const targetPlayer = editTarget ? players[editTarget.id] : null;

  const purchasedIntelEntries = useMemo(() => {
    if (!targetPlayer) return [];
    const purchased = targetPlayer.purchasedIntels || [];
    if (purchased.length === 0) return [];
    const scenario = scenarios.find((s) => s.id === config.scenarioId);
    if (!scenario) return [];
    const result: { round: number; grade: 'A' | 'B' | 'C'; content: string; key: string }[] = [];
    for (const r of scenario.rounds) {
      for (const intel of r.intels || []) {
        const key = `${r.round}-${intel.id}`;
        if (purchased.includes(key)) {
          result.push({ round: r.round, grade: intel.grade, content: intel.content, key });
        }
      }
    }
    return result.sort((a, b) => a.round - b.round || a.grade.localeCompare(b.grade));
  }, [targetPlayer, scenarios, config.scenarioId]);

  const playerOrders = useMemo(() => {
    if (!editTarget) return [];
    return orders
      .filter((o) => o.playerId === editTarget.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, editTarget]);

  const availableRounds = useMemo(
    () => Array.from(new Set(playerOrders.map((o) => o.round))).sort((a, b) => a - b),
    [playerOrders]
  );

  const filteredOrders = useMemo(
    () => (orderRoundFilter === 'all' ? playerOrders : playerOrders.filter((o) => o.round === orderRoundFilter)),
    [playerOrders, orderRoundFilter]
  );

  const intelSpent = purchasedIntelEntries.reduce(
    (sum, e) => sum + (config.intelPrices?.[e.grade] ?? { A: 5000, B: 3000, C: 1000 }[e.grade]),
    0
  );

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

      {/* Detail Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `${editTarget.name} 학생 상세` : ''}
        className="max-w-2xl"
      >
        {editTarget && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4 -mt-1">
              {([
                { key: 'edit', label: '정보 수정' },
                { key: 'intels', label: `정보 구매 내역${purchasedIntelEntries.length ? ` (${purchasedIntelEntries.length})` : ''}` },
                { key: 'orders', label: `거래내역${playerOrders.length ? ` (${playerOrders.length})` : ''}` },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                    detailTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Edit */}
            {detailTab === 'edit' && (
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

            {/* Tab: Intels */}
            {detailTab === 'intels' && (
              <div className="space-y-3">
                {purchasedIntelEntries.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">구매한 정보가 없습니다.</p>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline text-xs text-gray-500 px-1">
                      <span>총 {purchasedIntelEntries.length}건 구매</span>
                      <span>누적 지출 {formatCurrency(intelSpent)}</span>
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {purchasedIntelEntries.map((entry) => (
                        <div key={entry.key} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500">R{entry.round}</span>
                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded', GRADE_BADGE[entry.grade])}>
                              {entry.grade}등급
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{entry.content}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab: Orders */}
            {detailTab === 'orders' && (
              <div className="space-y-3">
                {playerOrders.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">거래 내역이 없습니다.</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">라운드</label>
                        <select
                          value={orderRoundFilter}
                          onChange={(e) =>
                            setOrderRoundFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                          }
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">전체</option>
                          {availableRounds.map((r) => (
                            <option key={r} value={r}>R{r}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-xs text-gray-400">{filteredOrders.length}건</span>
                    </div>

                    <div className="overflow-x-auto max-h-[55vh] overflow-y-auto border border-gray-100 rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-500 sticky top-0">
                          <tr>
                            <th className="px-2 py-2 text-left">R</th>
                            <th className="px-2 py-2 text-left">시각</th>
                            <th className="px-2 py-2 text-left">종목</th>
                            <th className="px-2 py-2 text-center">구분</th>
                            <th className="px-2 py-2 text-right">수량</th>
                            <th className="px-2 py-2 text-right">단가</th>
                            <th className="px-2 py-2 text-right">총액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((o) => {
                            const stock = stocks[o.stockId];
                            const stockName = stock ? SECTOR_LABELS[stock.sector] : o.stockId;
                            const time = new Date(o.timestamp);
                            const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
                            const total = o.price * o.quantity;
                            return (
                              <tr key={o.id} className="border-t border-gray-50">
                                <td className="px-2 py-1.5 text-gray-500">R{o.round}</td>
                                <td className="px-2 py-1.5 text-gray-400">{timeStr}</td>
                                <td className="px-2 py-1.5 font-medium">{stockName}</td>
                                <td className="px-2 py-1.5 text-center">
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 rounded text-[10px] font-bold',
                                      o.type === 'buy' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    )}
                                  >
                                    {o.type === 'buy' ? '매수' : '매도'}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5 text-right">{o.quantity}</td>
                                <td className="px-2 py-1.5 text-right text-gray-500">{formatCurrency(o.price)}</td>
                                <td className="px-2 py-1.5 text-right font-semibold">{formatCurrency(total)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
