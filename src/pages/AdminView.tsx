import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { RoundControl } from '@/components/Admin/RoundControl';
import { ScenarioSelector } from '@/components/Admin/ScenarioSelector';
import { StudentStatusList } from '@/components/Admin/StudentStatusList';
import { LeaderboardControl } from '@/components/Admin/LeaderboardControl';
import { Button } from '@/components/UI/Button';

export function AdminView() {
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [playerInput, setPlayerInput] = useState('');
  const { initializePlayers } = usePlayerStore();
  const { config } = useGameStore();
  const navigate = useNavigate();

  const handleInitPlayers = async () => {
    const lines = playerInput.trim().split('\n').filter(Boolean);
    const playerList = lines.map((line) => {
      const [name, pin] = line.split(',').map((s) => s.trim());
      return { name, pin: pin || '0000' };
    });
    await initializePlayers(playerList);
    setShowPlayerSetup(false);
    setPlayerInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-800">관리자 대시보드</h1>
            <p className="text-sm text-gray-500">차시 {config.session} | 라운드 {config.currentRound}/{config.totalRounds}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowPlayerSetup(!showPlayerSetup)}>
              학생 등록
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              학생 화면
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Player Setup */}
        {showPlayerSetup && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-6">
            <h2 className="text-lg font-bold mb-3">학생 등록</h2>
            <p className="text-sm text-gray-500 mb-2">한 줄에 하나씩: 이름, 비밀번호(4자리)</p>
            <textarea
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder={`홍길동, 1234\n김철수, 5678\n이영희, 9012`}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleInitPlayers} className="mt-3">
              학생 등록하기
            </Button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="space-y-6">
            <ScenarioSelector />
            <RoundControl />
            <LeaderboardControl />
          </div>

          {/* Right: Student Status */}
          <div className="lg:col-span-2">
            <StudentStatusList />
          </div>
        </div>
      </div>
    </div>
  );
}
