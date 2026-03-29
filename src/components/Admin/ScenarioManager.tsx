import { useState } from 'react';
import { useScenarioStore } from '@/store/scenarioStore';
import { ScenarioEditor } from './ScenarioEditor';
import { Button } from '@/components/UI/Button';
import type { Scenario } from '@/types';

export function ScenarioManager() {
  const { scenarios, deleteScenario } = useScenarioStore();
  const [editingScenario, setEditingScenario] = useState<Scenario | null | 'new'>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('이 시나리오를 삭제하시겠습니까?')) {
      await deleteScenario(id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">시나리오 관리</h2>
        <Button variant="secondary" size="sm" onClick={() => setEditingScenario('new')}>
          + 새 시나리오
        </Button>
      </div>

      <div className="space-y-2">
        {scenarios.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-gray-400">{s.rounds.length}라운드 | {s.description}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setEditingScenario(s)}>편집</Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-red-400">삭제</Button>
            </div>
          </div>
        ))}
        {scenarios.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">등록된 시나리오가 없습니다.</p>
        )}
      </div>

      {/* Scenario Editor */}
      {editingScenario && (
        <ScenarioEditor
          scenario={editingScenario === 'new' ? null : editingScenario}
          onClose={() => setEditingScenario(null)}
        />
      )}
    </div>
  );
}
