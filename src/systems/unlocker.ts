import type { GameState } from "../store";
import { NPCS } from "../data/npcs";

export interface UnlockEvent {
  id: string;
  name: string;
}

export function checkUnlocks(state: GameState): UnlockEvent[] {
  const newlyUnlocked: UnlockEvent[] = [];
  for (const npc of NPCS) {
    const alreadyUnlocked = state.unlockedNpcs.some((u) => u.id === npc.id);
    if (!alreadyUnlocked && npc.unlockCondition(state.resources)) {
      const flagMet = !npc.requireFlag || state.flags.includes(npc.requireFlag);
      if (flagMet) {
        newlyUnlocked.push({ id: npc.id, name: npc.name });
      }
    }
  }
  return newlyUnlocked;
}
