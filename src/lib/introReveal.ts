import { useGameStore } from "../store";

export const INTRO_NPC_ID = "mantle-of-logic";

// Stages line up with what the "intro" dialogue tree is narrating at each
// node, so the matching panel fades in exactly when the NPC starts
// describing it (see DIALOGUE_TREES["mantle-of-logic"] in data/dialogue.ts).
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

  // Until we actually know whether this account has a save, stay hidden
  // rather than guessing — guessing wrong means either flashing the
  // tutorial back open for a returning player or briefly showing empty
  // panels to a new one.
  if (saveStatus === "pending") return "none";

  // Returning players skip the staged reveal/forced-intro entirely; the
  // page-level fade in index.css is their only "on load" animation.
  if (isReturningPlayer) return "full";

  if (introCompleted) return "full";
  if (currentNodeId === "npc_display") return "actions";
  if (currentNodeId && currentNodeId !== "intro") return "resources";
  return "none";
}

export function useIntroActive(): boolean {
  return useIntroRevealLevel() !== "full";
}
