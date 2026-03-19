import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/UI/Card';

export function HintPanel() {
  const { hints, config } = useGameStore();

  // Show analysis during reviewing phase
  if (config.phase === 'reviewing' && hints.analysis) {
    return (
      <div className="px-4">
        <Card title={`라운드 ${config.currentRound} 결과 분석`}>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-indigo-600 mb-2">뉴스 정답 분석</p>
            <p className="text-sm text-indigo-800 whitespace-pre-line leading-relaxed">{hints.analysis}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (config.phase === 'waiting' || config.phase === 'ended') return null;
  if (hints.visibleHints === 0 && !hints.hint1) return null;

  return (
    <div className="px-4">
      <Card title={`라운드 ${config.currentRound} 뉴스`}>
        <div className="space-y-3">
          {hints.visibleHints >= 1 && hints.hint1 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-yellow-600 mb-1">속보</p>
              <p className="text-sm text-yellow-800">{hints.hint1}</p>
            </div>
          )}
          {hints.visibleHints >= 2 && hints.hint2 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-orange-600 mb-1">추가 보도</p>
              <p className="text-sm text-orange-800">{hints.hint2}</p>
            </div>
          )}
          {hints.visibleHints >= 3 && hints.hint3 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">긴급 속보</p>
              <p className="text-sm text-red-800">{hints.hint3}</p>
            </div>
          )}
          {hints.visibleHints < 3 && (
            <p className="text-center text-xs text-gray-400">
              다음 뉴스를 기다려주세요...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
