import { create } from 'zustand';
import { ref, onValue, set as fbSet, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Scenario } from '@/types';
import { scenarios as defaultScenarios } from '@/data/scenarios';

interface ScenarioState {
  scenarios: Scenario[];
  isLoading: boolean;
  subscribe: () => () => void;
  saveScenario: (scenario: Scenario) => Promise<void>;
  deleteScenario: (id: string) => Promise<void>;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: [],
  isLoading: true,

  subscribe: () => {
    const scenariosRef = ref(db, 'scenarios');
    let seeded = false;

    const unsub = onValue(scenariosRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data) as Scenario[];
        set({ scenarios: list, isLoading: false });
      } else if (!seeded) {
        seeded = true;
        const seedData: Record<string, Scenario> = {};
        for (const s of defaultScenarios) {
          seedData[s.id] = s;
        }
        await fbSet(scenariosRef, seedData);
      } else {
        set({ scenarios: [], isLoading: false });
      }
    });
    return unsub;
  },

  saveScenario: async (scenario) => {
    await fbSet(ref(db, `scenarios/${scenario.id}`), scenario);
  },

  deleteScenario: async (id) => {
    await remove(ref(db, `scenarios/${id}`));
  },
}));
