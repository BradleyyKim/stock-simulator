import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { StudentView } from '@/pages/StudentView';
import { AdminView } from '@/pages/AdminView';
import { useGameStore } from '@/store/gameStore';
import { useStockStore } from '@/store/stockStore';
import { usePlayerStore } from '@/store/playerStore';
import { useOrderStore } from '@/store/orderStore';
import { useScenarioStore } from '@/store/scenarioStore';
import { ensureAnonymousAuth } from '@/lib/firebase';

function AppContent() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const subscribeGame = useGameStore((s) => s.subscribe);
  const subscribeStocks = useStockStore((s) => s.subscribe);
  const subscribePlayers = usePlayerStore((s) => s.subscribe);
  const subscribeOrders = useOrderStore((s) => s.subscribe);
  const subscribeScenarios = useScenarioStore((s) => s.subscribe);

  useEffect(() => {
    ensureAnonymousAuth()
      .then(() => setAuthReady(true))
      .catch((err) => setAuthError(err?.message ?? '인증 초기화에 실패했습니다.'));
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const unsubs = [
      subscribeGame(),
      subscribeStocks(),
      subscribePlayers(),
      subscribeOrders(),
      subscribeScenarios(),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [authReady, subscribeGame, subscribeStocks, subscribePlayers, subscribeOrders, subscribeScenarios]);

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">접속에 실패했습니다.</p>
          <p className="mt-2 text-sm text-gray-600">{authError}</p>
          <p className="mt-2 text-sm text-gray-600">새로고침 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">접속 준비 중...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/student" element={<StudentView />} />
      <Route path="/admin" element={<AdminView />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
