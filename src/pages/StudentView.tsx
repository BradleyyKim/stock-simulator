import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { StockList } from '@/components/Student/StockList';
import { Portfolio } from '@/components/Student/Portfolio';
import { Leaderboard } from '@/components/Student/Leaderboard';
import { OrderForm } from '@/components/Student/OrderForm';
import { HintPanel } from '@/components/Student/HintPanel';
import { TabBar } from '@/components/UI/TabBar';
import { Badge } from '@/components/UI/Badge';
import { formatCurrency } from '@/utils/format';
import { BarChart3, Briefcase, Trophy } from 'lucide-react';

export function StudentView() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const { currentPlayer, logout } = usePlayerStore();
  const { config } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/');
    }
  }, [currentPlayer, navigate]);

  if (!currentPlayer) return null;

  const phaseLabels: Record<string, string> = {
    waiting: '대기 중',
    trading: '거래 가능',
    paused: '일시정지',
    reviewing: '결과 확인',
    ended: '종료',
  };

  const tabs = [
    { id: 'stocks', label: '종목', icon: <BarChart3 size={20} /> },
    { id: 'portfolio', label: '내 자산', icon: <Briefcase size={20} /> },
    { id: 'leaderboard', label: '순위', icon: <Trophy size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800">{currentPlayer.name}</p>
            <p className="text-xs text-gray-400">{formatCurrency(currentPlayer.cash)} 보유</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={config.phase === 'trading' ? 'trading' : 'waiting'}>
              R{config.currentRound} {phaseLabels[config.phase]}
            </Badge>
            <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-400 ml-2">
              나가기
            </button>
          </div>
        </div>
      </div>

      {/* Hint Panel */}
      <div className="pt-3">
        <HintPanel />
      </div>

      {/* Content */}
      <div className="pt-3">
        {activeTab === 'stocks' && <StockList onSelectStock={setSelectedStock} />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>

      {/* Order Form Modal */}
      <OrderForm stockId={selectedStock} onClose={() => setSelectedStock(null)} />

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
