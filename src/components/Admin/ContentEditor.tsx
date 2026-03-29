import { useState, useEffect } from 'react';
import { useScenarioStore } from '@/store/scenarioStore';
import { Button } from '@/components/UI/Button';
import { INITIAL_STOCKS } from '@/data/scenarios';
import type { Scenario, ScenarioRound, IntelItem } from '@/types';

const EMPTY_INTELS: IntelItem[] = [
  { id: 'c1', grade: 'C', content: '' },
  { id: 'c2', grade: 'C', content: '' },
  { id: 'c3', grade: 'C', content: '' },
  { id: 'b1', grade: 'B', content: '' },
  { id: 'b2', grade: 'B', content: '' },
  { id: 'a1', grade: 'A', content: '' },
];

const GRADE_LABEL: Record<string, { label: string; color: string }> = {
  C: { label: 'C등급 (일반)', color: 'bg-gray-100 text-gray-600' },
  B: { label: 'B등급 (좋은)', color: 'bg-blue-100 text-blue-600' },
  A: { label: 'A등급 (핵심)', color: 'bg-amber-100 text-amber-700' },
};

export function ContentEditor() {
  const { scenarios, saveScenario } = useScenarioStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);
  const [form, setForm] = useState<ScenarioRound | null>(null);
  const [saved, setSaved] = useState(false);

  const scenario = scenarios.find((s) => s.id === selectedScenarioId);

  // 시나리오 or 라운드 변경 시 폼 동기화
  useEffect(() => {
    if (scenario && scenario.rounds[selectedRoundIdx]) {
      const round = scenario.rounds[selectedRoundIdx];
      setForm({
        ...round,
        intels: round.intels?.length ? round.intels : EMPTY_INTELS.map((e) => ({ ...e })),
      });
    } else {
      setForm(null);
    }
  }, [selectedScenarioId, selectedRoundIdx, scenario]);

  // 첫 시나리오 자동 선택
  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(scenarios[0].id);
    }
  }, [scenarios, selectedScenarioId]);

  const updateField = (field: string, value: string) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const updatePriceChange = (stockId: string, percent: number) => {
    if (!form) return;
    setForm({ ...form, priceChanges: { ...form.priceChanges, [stockId]: percent / 100 } });
  };

  const updateIntel = (idx: number, content: string) => {
    if (!form?.intels) return;
    const intels = [...form.intels];
    intels[idx] = { ...intels[idx], content };
    setForm({ ...form, intels });
  };

  const handleSave = async () => {
    if (!scenario || !form) return;
    const updated: Scenario = {
      ...scenario,
      rounds: scenario.rounds.map((r, i) => (i === selectedRoundIdx ? form : r)),
    };
    await saveScenario(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-4">
      {/* 시나리오 + 라운드 선택 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">시나리오</label>
            <select
              value={selectedScenarioId}
              onChange={(e) => { setSelectedScenarioId(e.target.value); setSelectedRoundIdx(0); }}
              className={inputClass}
            >
              <option value="">선택하세요</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">라운드</label>
            <div className="flex gap-1 flex-wrap">
              {scenario?.rounds.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedRoundIdx(i)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    selectedRoundIdx === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  R{r.round}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!form ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center text-gray-400">
          시나리오를 선택하세요
        </div>
      ) : (
        <>
          {/* 뉴스 검색 도우미 */}
          {form.dateRange && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-700">이 라운드의 실제 기간: {form.dateRange.start} ~ {form.dateRange.end}</p>
                  <p className="text-[10px] text-blue-500 mt-0.5">해당 기간의 실제 뉴스를 검색하여 힌트와 정보 거래소에 입력하세요.</p>
                </div>
                <a
                  href={`https://www.bigkinds.or.kr/v2/news/search.do?searchWord=${encodeURIComponent('경제 증시')}&searchStartDate=${form.dateRange.start}&searchEndDate=${form.dateRange.end}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  관련 뉴스 찾기
                </a>
              </div>
            </div>
          )}

          {/* 뉴스 & 힌트 */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-700">뉴스 & 힌트</h3>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">뉴스 헤드라인 (라운드 종료 시 공개)</label>
              <input value={form.news} onChange={(e) => updateField('news', e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                { key: 'hint1', label: '1단계 - 속보', color: 'border-l-yellow-400' },
                { key: 'hint2', label: '2단계 - 추가 보도', color: 'border-l-orange-400' },
                { key: 'hint3', label: '3단계 - 긴급 속보', color: 'border-l-red-400' },
              ].map(({ key, label, color }) => (
                <div key={key} className={`border-l-4 ${color} pl-3`}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <textarea
                    value={(form[key as keyof ScenarioRound] as string) || ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">결과 분석 (reviewing 단계에서 학생에게 표시)</label>
              <textarea
                value={form.analysis || ''}
                onChange={(e) => updateField('analysis', e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* 종목별 변동률 */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-2">종목별 변동률 (%)</h3>
            <div className="grid grid-cols-5 gap-2">
              {INITIAL_STOCKS.map((stock) => (
                <div key={stock.id} className="text-center">
                  <label className="block text-[10px] text-gray-400 mb-1">{stock.name}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={parseFloat(((form.priceChanges[stock.id] || 0) * 100).toFixed(1))}
                    onChange={(e) => updatePriceChange(stock.id, Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 정보 거래소 아이템 */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2">
            <h3 className="font-bold text-gray-700">정보 거래소 아이템</h3>
            <p className="text-xs text-gray-400">학생이 현금으로 구매할 수 있는 정보입니다. 등급이 높을수록 핵심적인 정보를 제공하세요.</p>

            {(form.intels || EMPTY_INTELS).map((intel, idx) => (
              <div key={intel.id} className="flex items-start gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 mt-1.5 ${GRADE_LABEL[intel.grade].color}`}>
                  {intel.grade}{intel.id.slice(1)}
                </span>
                <textarea
                  value={intel.content}
                  onChange={(e) => updateIntel(idx, e.target.value)}
                  rows={1}
                  placeholder={`${GRADE_LABEL[intel.grade].label} 정보 내용을 입력하세요`}
                  className={`flex-1 ${inputClass} resize-none`}
                />
              </div>
            ))}
          </div>

          {/* 저장 */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>라운드 {form.round} 저장</Button>
            {saved && <span className="text-sm text-green-600">저장되었습니다</span>}
          </div>
        </>
      )}
    </div>
  );
}
