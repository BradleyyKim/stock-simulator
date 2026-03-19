import { useGameStore } from '@/store/gameStore';
import { useStockStore } from '@/store/stockStore';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { scenarios } from '@/data/scenarios';

export function RoundControl() {
  const { config, startRound, endRound, nextRound, revealNextHint, setHints, hints, resetCurrentRound } = useGameStore();
  const { applyPriceChanges } = useStockStore();
  const { recalculateAllAssets } = usePlayerStore();
  const { stocks } = useStockStore();

  const scenario = scenarios.find((s) => s.id === config.scenarioId);
  const currentScenarioRound = scenario?.rounds.find((r) => r.round === config.currentRound);
  const nextScenarioRound = scenario?.rounds.find((r) => r.round === config.currentRound + 1);

  const phaseLabels: Record<string, string> = {
    waiting: '대기 중',
    trading: '거래 진행 중',
    paused: '일시정지',
    reviewing: '결과 확인',
    ended: '종료',
  };

  const phaseVariants: Record<string, 'waiting' | 'trading' | 'paused'> = {
    waiting: 'waiting',
    trading: 'trading',
    paused: 'paused',
    reviewing: 'waiting',
    ended: 'waiting',
  };

  const handleStartRound = async () => {
    await startRound();
    if (nextScenarioRound) {
      await setHints({
        hint1: nextScenarioRound.hint1 || '',
        hint2: nextScenarioRound.hint2 || '',
        hint3: nextScenarioRound.hint3 || '',
        visibleHints: 0,
        analysis: '',
      });
    }
  };

  const handleEndRound = async () => {
    if (currentScenarioRound) {
      await applyPriceChanges(currentScenarioRound.priceChanges, config.currentRound);
      const stockPrices: Record<string, number> = {};
      for (const [id, stock] of Object.entries(stocks)) {
        const change = currentScenarioRound.priceChanges[id] || 0;
        stockPrices[id] = Math.round(stock.currentPrice * (1 + change));
      }
      await recalculateAllAssets(stockPrices, config.currentRound);
      if (currentScenarioRound.analysis) {
        await setHints({ analysis: currentScenarioRound.analysis });
      }
    }
    await endRound();
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">라운드 제어</h2>
        <Badge variant={phaseVariants[config.phase] || 'waiting'}>
          {phaseLabels[config.phase]}
        </Badge>
      </div>

      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">현재 라운드</p>
        <p className="text-4xl font-bold text-gray-800">
          {config.currentRound} <span className="text-lg text-gray-400">/ {config.totalRounds}</span>
        </p>
      </div>

      {config.phase === 'trading' && currentScenarioRound && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-600 mb-1">이번 라운드 뉴스</p>
          <p className="text-sm text-amber-800">{currentScenarioRound.news}</p>
        </div>
      )}

      <div className="space-y-2">
        {config.phase === 'waiting' && (
          <Button onClick={handleStartRound} className="w-full" disabled={config.currentRound >= config.totalRounds}>
            라운드 {config.currentRound + 1} 시작
          </Button>
        )}

        {config.phase === 'trading' && (
          <>
            <Button onClick={revealNextHint} variant="secondary" className="w-full" disabled={hints.visibleHints >= 3}>
              힌트 {hints.visibleHints + 1}단계 공개
            </Button>
            <Button onClick={handleEndRound} variant="danger" className="w-full">
              거래 마감 및 결과 반영
            </Button>
            <Button
              onClick={() => { if (window.confirm('현재 라운드를 초기화하시겠습니까?\n학생 화면의 뉴스가 모두 사라집니다.')) resetCurrentRound(); }}
              variant="ghost"
              size="sm"
              className="w-full text-gray-400"
            >
              라운드 초기화
            </Button>
          </>
        )}

        {config.phase === 'reviewing' && (
          <Button onClick={nextRound} className="w-full">
            다음 라운드 준비
          </Button>
        )}
      </div>
    </div>
  );
}
