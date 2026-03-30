import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStockStore } from '@/store/stockStore';
import { usePlayerStore } from '@/store/playerStore';
import { useScenarioStore } from '@/store/scenarioStore';
import { Button } from '@/components/UI/Button';

export function ScenarioSelector() {
  const { config, updateConfig } = useGameStore();
  const { initializeStocks } = useStockStore();
  const { resetAllPlayers, addAllowanceToAll } = usePlayerStore();
  const { scenarios } = useScenarioStore();
  const [continueMode, setContinueMode] = useState(false);

  const handleSelectScenario = async (scenarioId: string) => {
    await updateConfig({
      scenarioId,
      currentRound: 0,
      phase: 'waiting',
      totalRounds: scenarios.find((s) => s.id === scenarioId)?.rounds.length || 6,
    });
    await initializeStocks();
    if (!continueMode) {
      await resetAllPlayers(config.startingCash);
    }
    if (config.roundAllowance > 0) {
      await addAllowanceToAll(config.roundAllowance);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-3">
      <h2 className="text-lg font-bold">시나리오 선택</h2>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={continueMode}
          onChange={(e) => setContinueMode(e.target.checked)}
          className="rounded"
        />
        이전 자산 이어서 시작
      </label>
      <div className="space-y-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelectScenario(s.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              config.scenarioId === s.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <p className="font-medium text-sm">{s.name}</p>
            <p className="text-xs text-gray-500 mt-1">{s.description}</p>
            <p className="text-xs text-gray-400 mt-1">{s.rounds.length}라운드</p>
          </button>
        ))}
      </div>
      {config.scenarioId && config.phase === 'waiting' && config.currentRound === 0 && (
        <Button variant="secondary" className="w-full" onClick={() => initializeStocks()}>
          종목 초기화
        </Button>
      )}
    </div>
  );
}
