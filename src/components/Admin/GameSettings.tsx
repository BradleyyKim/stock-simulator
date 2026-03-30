import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/UI/Button';

export function GameSettings() {
  const { config, updateConfig } = useGameStore();
  const [form, setForm] = useState({
    startingCash: config.startingCash,
    roundAllowance: config.roundAllowance,
    intelA: config.intelPrices?.A ?? 5000,
    intelB: config.intelPrices?.B ?? 3000,
    intelC: config.intelPrices?.C ?? 1000,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      startingCash: config.startingCash,
      roundAllowance: config.roundAllowance ?? 100000,
      intelA: config.intelPrices?.A ?? 5000,
      intelB: config.intelPrices?.B ?? 3000,
      intelC: config.intelPrices?.C ?? 1000,
    });
  }, [config]);

  const handleSave = async () => {
    await updateConfig({
      startingCash: form.startingCash,
      roundAllowance: form.roundAllowance,
      intelPrices: { A: form.intelA, B: form.intelB, C: form.intelC },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
      <h2 className="text-lg font-bold">게임 설정</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">시작 자금 (원)</label>
          <input
            type="number"
            value={form.startingCash}
            onChange={(e) => setForm({ ...form, startingCash: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">시나리오 용돈 (원)</label>
          <input
            type="number"
            value={form.roundAllowance}
            onChange={(e) => setForm({ ...form, roundAllowance: Number(e.target.value) })}
            className={inputClass}
          />
          <p className="text-[10px] text-gray-400 mt-0.5">시나리오 시작 시 1회 지급. 0이면 미지급</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">정보 거래소 가격 (원)</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">C등급</label>
            <input
              type="number"
              value={form.intelC}
              onChange={(e) => setForm({ ...form, intelC: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">B등급</label>
            <input
              type="number"
              value={form.intelB}
              onChange={(e) => setForm({ ...form, intelB: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">A등급</label>
            <input
              type="number"
              value={form.intelA}
              onChange={(e) => setForm({ ...form, intelA: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} size="sm">설정 저장</Button>
        {saved && <span className="text-sm text-green-600">저장되었습니다</span>}
      </div>
    </div>
  );
}
