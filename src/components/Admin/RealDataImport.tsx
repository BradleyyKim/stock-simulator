import { useState } from 'react';
import { useScenarioStore } from '@/store/scenarioStore';
import { Button } from '@/components/UI/Button';
import type { Scenario, ScenarioRound, IntelItem } from '@/types';

interface StockInput {
  sectorId: string;
  sectorName: string;
  code: string;
  defaultCode: string;
}

const DEFAULT_STOCKS: StockInput[] = [
  { sectorId: 'semi', sectorName: '반도체', code: '005930', defaultCode: '005930' },
  { sectorId: 'ai', sectorName: '인공지능', code: '035420', defaultCode: '035420' },
  { sectorId: 'energy', sectorName: '에너지', code: '373220', defaultCode: '373220' },
  { sectorId: 'bio', sectorName: '바이오', code: '207940', defaultCode: '207940' },
  { sectorId: 'game', sectorName: '게임', code: '263750', defaultCode: '263750' },
];

const STOCK_PRESETS: Record<string, string> = {
  '005930': '삼성전자',
  '035420': 'NAVER',
  '373220': 'LG에너지솔루션',
  '207940': '삼성바이오로직스',
  '263750': '펄어비스',
  '000660': 'SK하이닉스',
  '035720': '카카오',
  '006400': '삼성SDI',
  '068270': '셀트리온',
  '251270': '넷마블',
};

const EMPTY_INTELS: IntelItem[] = [
  { id: 'c1', grade: 'C', content: '' },
  { id: 'c2', grade: 'C', content: '' },
  { id: 'c3', grade: 'C', content: '' },
  { id: 'b1', grade: 'B', content: '' },
  { id: 'b2', grade: 'B', content: '' },
  { id: 'a1', grade: 'A', content: '' },
];

interface WeekData {
  startDate: string;
  endDate: string;
  open: number;
  close: number;
  changeRate: number;
}

interface FetchedStock {
  code: string;
  name: string;
  weeks: WeekData[];
}

export function RealDataImport() {
  const { saveScenario } = useScenarioStore();
  const [stocks, setStocks] = useState<StockInput[]>(DEFAULT_STOCKS.map((s) => ({ ...s })));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weeks, setWeeks] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Record<string, FetchedStock> | null>(null);
  const [created, setCreated] = useState(false);

  const updateStockCode = (idx: number, code: string) => {
    const updated = [...stocks];
    updated[idx] = { ...updated[idx], code };
    setStocks(updated);
  };

  const handleFetch = async () => {
    if (!startDate || !endDate) {
      setError('시작일과 종료일을 입력하세요.');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const codes = stocks.map((s) => s.code).join(',');
      const res = await fetch(`/api/stock-data?codes=${codes}&start=${startDate}&end=${endDate}&weeks=${weeks}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `API 오류 (${res.status})`);
      }

      const data = await res.json();
      setPreview(data.stocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 수집 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = async () => {
    if (!preview) return;

    const rounds: ScenarioRound[] = [];

    for (let i = 0; i < weeks; i++) {
      const priceChanges: Record<string, number> = {};
      let dateRange: { start: string; end: string } | undefined;

      for (const stock of stocks) {
        const fetched = preview[stock.code];
        if (fetched?.weeks[i]) {
          priceChanges[stock.sectorId] = fetched.weeks[i].changeRate;
          if (!dateRange) {
            dateRange = { start: fetched.weeks[i].startDate, end: fetched.weeks[i].endDate };
          }
        } else {
          priceChanges[stock.sectorId] = 0;
        }
      }

      rounds.push({
        round: i + 1,
        news: '',
        hint1: '',
        hint2: '',
        hint3: '',
        analysis: '',
        priceChanges,
        intels: EMPTY_INTELS.map((e) => ({ ...e })),
        dateRange,
      });
    }

    const scenario: Scenario = {
      id: `real-${Date.now()}`,
      name: `실제 시장 (${startDate} ~ ${endDate})`,
      description: `실제 한국 주식 데이터 기반 (${stocks.map((s) => STOCK_PRESETS[s.code] || s.code).join(', ')})`,
      rounds,
    };

    await saveScenario(scenario);
    setCreated(true);
    setTimeout(() => setCreated(false), 3000);
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold">실제 데이터로 시나리오 생성</h2>
        <p className="text-xs text-gray-400 mt-1">실제 한국 주식 데이터를 가져와 변동률이 자동 적용된 시나리오를 만듭니다.</p>
      </div>

      {/* 종목 선택 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">종목 (6자리 코드)</label>
        <div className="space-y-1.5">
          {stocks.map((stock, idx) => (
            <div key={stock.sectorId} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-14 shrink-0">{stock.sectorName}</span>
              <input
                value={stock.code}
                onChange={(e) => updateStockCode(idx, e.target.value)}
                placeholder="종목코드"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-gray-400 w-24 truncate">
                {STOCK_PRESETS[stock.code] || ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 기간 + 라운드 수 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">시작일</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">종료일</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">라운드 수</label>
          <input type="number" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} min={1} max={12} className={inputClass} />
        </div>
      </div>

      {/* 가져오기 버튼 */}
      <Button onClick={handleFetch} disabled={loading} className="w-full">
        {loading ? '데이터 수집 중...' : '데이터 가져오기'}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* 미리보기 */}
      {preview && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-700">미리보기 (라운드별 변동률)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1.5 px-1 text-gray-500">라운드</th>
                  <th className="text-left py-1.5 px-1 text-gray-500">기간</th>
                  {stocks.map((s) => (
                    <th key={s.sectorId} className="text-center py-1.5 px-1 text-gray-500">
                      {STOCK_PRESETS[s.code] || s.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: weeks }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 px-1 font-medium">R{i + 1}</td>
                    <td className="py-1.5 px-1 text-gray-400">
                      {stocks.some((s) => preview[s.code]?.weeks[i])
                        ? `${preview[stocks[0].code]?.weeks[i]?.startDate?.slice(5) || ''} ~ ${preview[stocks[0].code]?.weeks[i]?.endDate?.slice(5) || ''}`
                        : '-'}
                    </td>
                    {stocks.map((s) => {
                      const week = preview[s.code]?.weeks[i];
                      const rate = week ? (week.changeRate * 100).toFixed(1) : '-';
                      const isPositive = week && week.changeRate > 0;
                      const isNegative = week && week.changeRate < 0;
                      return (
                        <td key={s.sectorId} className={`text-center py-1.5 px-1 font-medium ${
                          isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : 'text-gray-400'
                        }`}>
                          {rate === '-' ? '-' : `${isPositive ? '+' : ''}${rate}%`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={handleCreateScenario} className="w-full">
            시나리오 생성
          </Button>

          {created && (
            <p className="text-sm text-green-600 text-center">
              시나리오가 생성되었습니다! "콘텐츠" 탭에서 뉴스/힌트를 입력하세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
