export interface NpcDef {
  id: string;
  name: string;
  portrait?: string;
  unlockCondition: (resources: Record<string, number>) => boolean;
  unlocked: boolean;
}

export const NPCS: NpcDef[] = [
  {
    id: "worker",
    name: "Worker",
    unlocked: false,
    unlockCondition: (r) => r.tmp >= 20,
  },
  { id: "npc2", name: "NPC 2", unlocked: false, unlockCondition: () => false },
  { id: "npc3", name: "NPC 3", unlocked: false, unlockCondition: () => false },
  { id: "npc4", name: "NPC 4", unlocked: false, unlockCondition: () => false },
  { id: "npc5", name: "NPC 5", unlocked: false, unlockCondition: () => false },
];

export const PORTRAIT_PLACEHOLDER = "/portrait-placeholder.jpg";
