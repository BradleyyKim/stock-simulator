import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/UI/Button';

export function LeaderboardControl() {
  const { config, toggleLeaderboard } = useGameStore();

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-3">
      <h2 className="text-lg font-bold">순위판 설정</h2>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          학생 순위판 {config.leaderboardVisible ? '공개 중' : '비공개'}
        </span>
        <Button
          variant={config.leaderboardVisible ? 'danger' : 'primary'}
          size="sm"
          onClick={toggleLeaderboard}
        >
          {config.leaderboardVisible ? '비공개' : '공개'}
        </Button>
      </div>
    </div>
  );
}
