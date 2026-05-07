import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { StockList } from '@/components/Student/StockList';
import { Portfolio } from '@/components/Student/Portfolio';
import { Leaderboard } from '@/components/Student/Leaderboard';
import { StockDetail } from '@/components/Student/StockDetail';
import { HintPanel } from '@/components/Student/HintPanel';
import { GameEventNotification, type Notification } from '@/components/Student/GameEventNotification';
import { IntelMarket } from '@/components/Student/IntelMarket';
import { TabBar } from '@/components/UI/TabBar';
import { Badge } from '@/components/UI/Badge';
import { formatCurrency } from '@/utils/format';
import { BarChart3, Briefcase, Trophy, Store } from 'lucide-react';

export function StudentView() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [showIntelMarket, setShowIntelMarket] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const { currentPlayer, logout } = usePlayerStore();
  const { config, hints } = useGameStore();
  const navigate = useNavigate();

  const prevPhaseRef = useRef(config.phase);
  const prevHintsRef = useRef(hints.visibleHints);
  const notificationIdRef = useRef(0);
  const initializedRef = useRef(false);

  const showNotification = useCallback((title: string, type: Notification['type'], subtitle?: string) => {
    notificationIdRef.current += 1;
    setNotification({ id: notificationIdRef.current, title, type, subtitle });
  }, []);

  // Skip notifications on initial mount
  useEffect(() => {
    initializedRef.current = true;
  }, []);

  // Watch phase changes
  useEffect(() => {
    if (!initializedRef.current) {
      prevPhaseRef.current = config.phase;
      return;
    }
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = config.phase;

    if (prev === config.phase) return;

    if (config.phase === 'trading') {
      showNotification(`라운드 ${config.currentRound} 시작!`, 'round-start', '거래가 가능합니다');
    } else if (config.phase === 'reviewing') {
      showNotification('거래 마감', 'trade-close', '결과를 확인하세요');
    } else if (config.phase === 'waiting' && prev === 'reviewing') {
      showNotification('라운드 종료', 'round-end', '다음 라운드를 준비하세요');
    }
  }, [config.phase, config.currentRound, showNotification]);

  // Watch hint reveals
  useEffect(() => {
    if (!initializedRef.current) {
      prevHintsRef.current = hints.visibleHints;
      return;
    }
    const prev = prevHintsRef.current;
    prevHintsRef.current = hints.visibleHints;

    if (hints.visibleHints > prev && hints.visibleHints > 0) {
      showNotification(`힌트 ${hints.visibleHints}단계 공개!`, 'hint', '새로운 정보를 확인하세요');
    }
  }, [hints.visibleHints, showNotification]);

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
    { id: 'intel', label: '거래소', icon: <Store size={20} /> },
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

      {/* Stock Detail Modal */}
      <StockDetail stockId={selectedStock} onClose={() => setSelectedStock(null)} />

      {/* Intel Market Modal */}
      <IntelMarket isOpen={showIntelMarket} onClose={() => { setShowIntelMarket(false); setActiveTab('stocks'); }} />

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => {
        if (id === 'intel') {
          setShowIntelMarket(true);
        } else {
          setActiveTab(id);
        }
      }} />

      {/* Game Event Notification */}
      <GameEventNotification notification={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
