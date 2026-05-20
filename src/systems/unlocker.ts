import type { GameState } from "../store";
import { NPCS } from "../data/npcs";

export function checkUnlocks(state: GameState): string[] {
  const newlyUnlocked: string[] = [];
  for (const npc of NPCS) {
    if (
      !state.unlockedNpcs.includes(npc.id) &&
      npc.unlockCondition(state.resources)
    ) {
      newlyUnlocked.push(npc.id);
    }
  }
  return newlyUnlocked;
}
