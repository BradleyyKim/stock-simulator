import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/UI/Button';

export function LoginPage() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, players } = usePlayerStore();
  const navigate = useNavigate();

  const playerNames = Object.values(players).map((p) => p.name);

  const handleLogin = async () => {
    if (!name) {
      setError('이름을 선택해주세요.');
      return;
    }
    if (pin.length !== 4) {
      setError('비밀번호 4자리를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    const success = await login(name, pin);
    setLoading(false);

    if (success) {
      navigate('/student');
    } else {
      setError('이름 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">모의투자</h1>
          <p className="text-gray-500">시뮬레이션에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">이름을 선택하세요</option>
              {playerNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 (휴대폰 뒷자리 4자리)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button onClick={handleLogin} loading={loading} className="w-full" size="lg">
            시작하기
          </Button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            관리자 입장
          </button>
        </div>
      </div>
    </div>
  );
}
