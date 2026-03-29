import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useScenarioStore } from '@/store/scenarioStore';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { formatCurrency } from '@/utils/format';
import type { IntelItem } from '@/types';

interface IntelMarketProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_STYLES = {
  C: { bg: 'bg-gray-50', border: 'border-gray-300', label: 'C등급', labelColor: 'text-gray-600', badgeBg: 'bg-gray-200' },
  B: { bg: 'bg-blue-50', border: 'border-blue-300', label: 'B등급', labelColor: 'text-blue-600', badgeBg: 'bg-blue-200' },
  A: { bg: 'bg-amber-50', border: 'border-amber-400', label: 'A등급', labelColor: 'text-amber-700', badgeBg: 'bg-amber-200' },
};

export function IntelMarket({ isOpen, onClose }: IntelMarketProps) {
  const [confirmIntel, setConfirmIntel] = useState<IntelItem | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const { config } = useGameStore();
  const { currentPlayer, purchaseIntel } = usePlayerStore();
  const { scenarios } = useScenarioStore();

  const scenario = scenarios.find((s) => s.id === config.scenarioId);
  const roundData = scenario?.rounds.find((r) => r.round === config.currentRound);
  const intels = roundData?.intels || [];
  const purchased = currentPlayer?.purchasedIntels || [];

  const getIntelKey = (intel: IntelItem) => `${config.currentRound}-${intel.id}`;
  const getPrice = (grade: 'A' | 'B' | 'C') => config.intelPrices?.[grade] ?? { A: 5000, B: 3000, C: 1000 }[grade];

  const handlePurchase = async (intel: IntelItem) => {
    if (!currentPlayer) return;
    const cost = getPrice(intel.grade);
    const result = await purchaseIntel(currentPlayer.id, getIntelKey(intel), cost);
    setMessage({ text: result.message, success: result.success });
    setConfirmIntel(null);
    if (result.success) {
      setTimeout(() => setMessage(null), 1500);
    }
  };

  const purchasedIntels = intels.filter((i) => purchased.includes(getIntelKey(i)));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`정보 거래소 (R${config.currentRound})`} className="max-w-lg">
      <div className="space-y-4">
        {intels.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">이번 라운드에는 구매 가능한 정보가 없습니다.</p>
        ) : (
          <>
            {config.phase !== 'trading' && (
              <p className="text-center text-amber-600 text-xs bg-amber-50 rounded-lg py-2">
                거래 시간에만 정보를 구매할 수 있습니다.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {intels.map((intel) => {
                const key = getIntelKey(intel);
                const isPurchased = purchased.includes(key);
                const style = GRADE_STYLES[intel.grade];
                const price = getPrice(intel.grade);

                return (
                  <button
                    key={intel.id}
                    onClick={() => !isPurchased && config.phase === 'trading' && setConfirmIntel(intel)}
                    disabled={isPurchased || config.phase !== 'trading'}
                    className={`${style.bg} border ${style.border} rounded-lg p-3 text-left transition-all ${
                      isPurchased ? 'opacity-60' : config.phase === 'trading' ? 'hover:shadow-md active:scale-[0.98]' : 'opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${style.labelColor} ${style.badgeBg} px-2 py-0.5 rounded`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-gray-500">{formatCurrency(price)}</span>
                    </div>
                    {isPurchased ? (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{intel.content}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">???</p>
                    )}
                    {isPurchased && <p className="text-[10px] text-green-600 mt-1">구매 완료</p>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* 내 정보 목록 */}
        {purchasedIntels.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-sm font-bold text-gray-700 mb-2">내 정보 목록</p>
            <div className="space-y-2">
              {purchasedIntels.map((intel) => {
                const style = GRADE_STYLES[intel.grade];
                return (
                  <div key={intel.id} className={`${style.bg} border ${style.border} rounded-lg p-2`}>
                    <span className={`text-[10px] font-bold ${style.labelColor}`}>{style.label}</span>
                    <p className="text-xs text-gray-700 mt-0.5">{intel.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 잔액 표시 */}
        {currentPlayer && (
          <p className="text-center text-xs text-gray-400">보유 현금: {formatCurrency(currentPlayer.cash)}</p>
        )}

        {/* 메시지 */}
        {message && (
          <p className={`text-center text-sm font-medium ${message.success ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* 구매 확인 팝업 */}
      {confirmIntel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setConfirmIntel(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-5 mx-4 w-full max-w-xs text-center space-y-3">
            <p className="font-bold">{GRADE_STYLES[confirmIntel.grade].label} 정보 구매</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(getPrice(confirmIntel.grade))}</p>
            <p className="text-xs text-gray-500">현금에서 차감됩니다.</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmIntel(null)}>취소</Button>
              <Button className="flex-1" onClick={() => handlePurchase(confirmIntel)}>구매</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
