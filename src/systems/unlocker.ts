import type { GameState } from "../store";
import { NPCS } from "../data/npcs";

export interface UnlockEvent {
  id: string;
  name: string;
  description: string;
}

export function checkUnlocks(state: GameState): UnlockEvent[] {
  const newlyUnlocked: UnlockEvent[] = [];
  for (const npc of NPCS) {
    const alreadyUnlocked = state.unlockedNpcs.some((u) => u.id === npc.id);
    if (!alreadyUnlocked && npc.unlockCondition(state.resources)) {
      newlyUnlocked.push({ id: npc.id, name: npc.name, description: npc.description });
    }
  }
  return newlyUnlocked;
}
