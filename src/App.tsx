import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { StudentView } from '@/pages/StudentView';
import { AdminView } from '@/pages/AdminView';
import { useGameStore } from '@/store/gameStore';
import { useStockStore } from '@/store/stockStore';
import { usePlayerStore } from '@/store/playerStore';
import { useOrderStore } from '@/store/orderStore';

function AppContent() {
  const subscribeGame = useGameStore((s) => s.subscribe);
  const subscribeStocks = useStockStore((s) => s.subscribe);
  const subscribePlayers = usePlayerStore((s) => s.subscribe);
  const subscribeOrders = useOrderStore((s) => s.subscribe);

  useEffect(() => {
    const unsubs = [
      subscribeGame(),
      subscribeStocks(),
      subscribePlayers(),
      subscribeOrders(),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [subscribeGame, subscribeStocks, subscribePlayers, subscribeOrders]);

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
