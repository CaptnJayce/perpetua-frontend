import { useGameStore } from "../store";

export const INTRO_NPC_ID = "mantle-of-logic";

export type IntroRevealLevel = "none" | "actions" | "resources" | "full";

export function useIntroRevealLevel(): IntroRevealLevel {
  const saveStatus = useGameStore((s) => s.saveStatus);
  const isReturningPlayer = useGameStore((s) => s.isReturningPlayer);
  const introCompleted = useGameStore((s) =>
    s.npcDialogueProgress[INTRO_NPC_ID]?.completedNodeIds.includes("intro") ?? false,
  );
  const currentNodeId = useGameStore(
    (s) => s.npcDialogueStates[INTRO_NPC_ID]?.currentNodeId,
  );

  if (saveStatus === "pending") return "none";

  if (isReturningPlayer) return "full";

  if (introCompleted) return "full";
  if (currentNodeId === "npc_display") return "actions";
  if (currentNodeId && currentNodeId !== "intro") return "resources";
  return "none";
}

export function useIntroActive(): boolean {
  return useIntroRevealLevel() !== "full";
}
