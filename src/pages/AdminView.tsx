import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { RoundControl } from '@/components/Admin/RoundControl';
import { ScenarioSelector } from '@/components/Admin/ScenarioSelector';
import { StudentStatusList } from '@/components/Admin/StudentStatusList';
import { LeaderboardControl } from '@/components/Admin/LeaderboardControl';
import { GameSettings } from '@/components/Admin/GameSettings';
import { ScenarioManager } from '@/components/Admin/ScenarioManager';
import { RealDataImport } from '@/components/Admin/RealDataImport';
import { ContentEditor } from '@/components/Admin/ContentEditor';
import { Button } from '@/components/UI/Button';

const ADMIN_PIN = '930919';

export function AdminView() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [playerInput, setPlayerInput] = useState('');
  const [adminTab, setAdminTab] = useState<'operation' | 'content' | 'settings'>('operation');
  const { addPlayers, resetAllPlayers, players } = usePlayerStore();
  const { config } = useGameStore();
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    if (adminPin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError('');
    } else {
      setPinError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleAddPlayers = async () => {
    const lines = playerInput.trim().split('\n').filter(Boolean);
    const playerList = lines.map((line) => {
      const [name, pin] = line.split(',').map((s) => s.trim());
      return { name, pin: pin || '0000' };
    });
    if (playerList.length === 0) return;
    await addPlayers(playerList, config.startingCash);
    setShowPlayerSetup(false);
    setPlayerInput('');
  };

  const handleResetAll = async () => {
    if (!window.confirm('정말 전체 학생 데이터를 초기화하시겠습니까?\n현금, 보유종목, 자산 기록이 모두 리셋됩니다.')) return;
    await resetAllPlayers(config.startingCash);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">관리자 인증</h1>
            <p className="text-gray-500 text-sm">관리자 비밀번호를 입력해주세요</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="비밀번호"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {pinError && <p className="text-red-500 text-sm text-center">{pinError}</p>}
            <Button onClick={handleAdminLogin} className="w-full" size="lg">
              입장하기
            </Button>
          </div>
          <div className="text-center mt-4">
            <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600">
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Tabs */}
        <div className="flex gap-1 mt-3 max-w-7xl mx-auto">
          <button
            onClick={() => setAdminTab('operation')}
            className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${
              adminTab === 'operation' ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            운영
          </button>
          <button
            onClick={() => setAdminTab('content')}
            className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${
              adminTab === 'content' ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            콘텐츠
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${
              adminTab === 'settings' ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            설정
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Player Setup */}
        {showPlayerSetup && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">학생 추가</h2>
              <span className="text-xs text-gray-400">현재 {Object.keys(players).length}명 등록됨</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">한 줄에 하나씩: 이름, 비밀번호(4자리) — 기존 학생은 유지됩니다</p>
            <textarea
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder={`홍길동, 1234\n김철수, 5678\n이영희, 9012`}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={handleAddPlayers}>학생 추가하기</Button>
              <Button variant="danger" size="sm" onClick={handleResetAll}>
                전체 자산 초기화
              </Button>
            </div>
          </div>
        )}

        {adminTab === 'operation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <ScenarioSelector />
              <RoundControl />
              <LeaderboardControl />
            </div>
            <div className="lg:col-span-2">
              <StudentStatusList />
            </div>
          </div>
        )}
        {adminTab === 'content' && (
          <div className="max-w-3xl">
            <ContentEditor />
          </div>
        )}
        {adminTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <GameSettings />
              <RealDataImport />
            </div>
            <ScenarioManager />
          </div>
        )}
      </div>
    </div>
  );
}
