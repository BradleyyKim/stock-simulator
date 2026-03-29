import { useState } from 'react';
import { useScenarioStore } from '@/store/scenarioStore';
import { Button } from '@/components/UI/Button';
import { INITIAL_STOCKS } from '@/data/scenarios';
import type { Scenario, ScenarioRound, IntelItem } from '@/types';

const EMPTY_ROUND = (round: number): ScenarioRound => ({
  round,
  news: '',
  hint1: '',
  hint2: '',
  hint3: '',
  analysis: '',
  priceChanges: Object.fromEntries(INITIAL_STOCKS.map((s) => [s.id, 0])),
  intels: [
    { id: 'c1', grade: 'C', content: '' },
    { id: 'c2', grade: 'C', content: '' },
    { id: 'c3', grade: 'C', content: '' },
    { id: 'b1', grade: 'B', content: '' },
    { id: 'b2', grade: 'B', content: '' },
    { id: 'a1', grade: 'A', content: '' },
  ],
});

interface ScenarioEditorProps {
  scenario: Scenario | null;
  onClose: () => void;
}

export function ScenarioEditor({ scenario, onClose }: ScenarioEditorProps) {
  const { saveScenario } = useScenarioStore();
  const [form, setForm] = useState<Scenario>(
    scenario || {
      id: `scenario-${Date.now()}`,
      name: '',
      description: '',
      rounds: [EMPTY_ROUND(1)],
    }
  );
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const updateRound = (roundIdx: number, field: string, value: unknown) => {
    const rounds = [...form.rounds];
    rounds[roundIdx] = { ...rounds[roundIdx], [field]: value };
    setForm({ ...form, rounds });
  };

  const updatePriceChange = (roundIdx: number, stockId: string, value: number) => {
    const rounds = [...form.rounds];
    rounds[roundIdx] = {
      ...rounds[roundIdx],
      priceChanges: { ...rounds[roundIdx].priceChanges, [stockId]: value / 100 },
    };
    setForm({ ...form, rounds });
  };

  const updateIntel = (roundIdx: number, intelIdx: number, content: string) => {
    const rounds = [...form.rounds];
    const intels = [...(rounds[roundIdx].intels || [])];
    intels[intelIdx] = { ...intels[intelIdx], content };
    rounds[roundIdx] = { ...rounds[roundIdx], intels };
    setForm({ ...form, rounds });
  };

  const addRound = () => {
    const nextRound = form.rounds.length + 1;
    setForm({ ...form, rounds: [...form.rounds, EMPTY_ROUND(nextRound)] });
    setExpandedRound(form.rounds.length);
  };

  const removeRound = (idx: number) => {
    if (form.rounds.length <= 1) return;
    const rounds = form.rounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, round: i + 1 }));
    setForm({ ...form, rounds });
    setExpandedRound(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await saveScenario(form);
    setSaving(false);
    onClose();
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
      <div className="max-w-3xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{scenario ? '시나리오 편집' : '새 시나리오'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">시나리오 이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 시나리오 1: 기본 시장 체험"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">설명</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="간단한 설명"
              className={inputClass}
            />
          </div>
        </div>

        {/* Rounds */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-700">라운드 ({form.rounds.length}개)</h3>
            <Button variant="secondary" size="sm" onClick={addRound}>+ 라운드 추가</Button>
          </div>

          {form.rounds.map((round, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Round Header */}
              <button
                onClick={() => setExpandedRound(expandedRound === idx ? null : idx)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">라운드 {round.round}</span>
                  {round.news && <span className="text-xs text-gray-400 truncate max-w-[200px]">{round.news}</span>}
                </div>
                <span className="text-gray-400">{expandedRound === idx ? '▲' : '▼'}</span>
              </button>

              {/* Round Detail */}
              {expandedRound === idx && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                  {/* News & Hints */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">뉴스 헤드라인</label>
                    <input
                      value={round.news}
                      onChange={(e) => updateRound(idx, 'news', e.target.value)}
                      placeholder="라운드 종료 후 발표될 뉴스"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {(['hint1', 'hint2', 'hint3'] as const).map((hintKey, i) => (
                      <div key={hintKey}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {['속보 (1단계)', '추가 보도 (2단계)', '긴급 속보 (3단계)'][i]}
                        </label>
                        <textarea
                          value={(round[hintKey] as string) || ''}
                          onChange={(e) => updateRound(idx, hintKey, e.target.value)}
                          rows={2}
                          className={textareaClass}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">결과 분석</label>
                    <textarea
                      value={round.analysis || ''}
                      onChange={(e) => updateRound(idx, 'analysis', e.target.value)}
                      rows={3}
                      placeholder="뉴스 정답 분석 (reviewing 단계에서 학생에게 표시)"
                      className={textareaClass}
                    />
                  </div>

                  {/* Price Changes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">종목별 변동률 (%)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {INITIAL_STOCKS.map((stock) => (
                        <div key={stock.id}>
                          <label className="block text-[10px] text-gray-400 mb-0.5 text-center">{stock.name}</label>
                          <input
                            type="number"
                            step={0.1}
                            value={parseFloat(((round.priceChanges[stock.id] || 0) * 100).toFixed(1))}
                            onChange={(e) => updatePriceChange(idx, stock.id, Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intel Items */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">정보 거래소 아이템</label>
                    <div className="space-y-2">
                      {(round.intels || EMPTY_ROUND(0).intels!).map((intel: IntelItem, iIdx: number) => (
                        <div key={intel.id} className="flex items-start gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-1 rounded shrink-0 mt-1 ${
                            intel.grade === 'A' ? 'bg-amber-200 text-amber-700' :
                            intel.grade === 'B' ? 'bg-blue-200 text-blue-600' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {intel.grade}{intel.id.slice(1)}
                          </span>
                          <textarea
                            value={intel.content}
                            onChange={(e) => updateIntel(idx, iIdx, e.target.value)}
                            rows={1}
                            placeholder={`${intel.grade}등급 정보 내용`}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delete Round */}
                  {form.rounds.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (window.confirm('이 라운드를 삭제하시겠습니까?')) removeRound(idx); }}
                      className="text-red-400 hover:text-red-600"
                    >
                      이 라운드 삭제
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Save / Cancel */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>취소</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
