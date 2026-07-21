import { NPCS } from "./npcs";

export interface QuestCheckContext {
  flags: string[];
  npcDialogueProgress: Record<string, { completedNodeIds: string[] }>;
  unlockedNpcs: { id: string }[];
}

export interface QuestDef {
  id: string;
  name: string;
  npcId?: string;
  startCondition: (ctx: QuestCheckContext) => boolean;
}

export const QUESTS: QuestDef[] = [
  {
    id: "managers-in-motion",
    name: "Managers in Motion",
    npcId: "mantle-of-logic",
    startCondition: (ctx) =>
      ctx.npcDialogueProgress["mantle-of-logic"]?.completedNodeIds.includes("intro") ?? false,
  },
  {
    id: "keep-an-eye-on-that-gaige",
    name: "Keep An Eye on That Gaige",
    npcId: "gaige",
    startCondition: (ctx) => ctx.unlockedNpcs.some((u) => u.id === "gaige"),
  },
  {
    id: "over-torqued",
    name: "Over-Torqued",
    startCondition: () => false,
  },
  {
    id: "perpetua-in-perpetutity",
    name: "Perpetua in Perpetutity",
    startCondition: () => false,
  },
];

export function getCurrentQuest(ctx: QuestCheckContext): QuestDef | null {
  let current: QuestDef | null = null;
  for (const quest of QUESTS) {
    if (quest.startCondition(ctx)) current = quest;
  }
  return current;
}

for (const quest of QUESTS) {
  if (quest.npcId && !NPCS.some((npc) => npc.id === quest.npcId)) {
    throw new Error(`Quest "${quest.id}" references unknown NPC "${quest.npcId}"`);
  }
}
