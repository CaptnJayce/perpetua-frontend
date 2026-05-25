export interface NpcDef {
  id: string;
  name: string;
  description: string;
  portrait: string;
  unlockCondition: (resources: Record<string, number>) => boolean;
  unlocked: boolean;
}

export const NPCS: NpcDef[] = [
  {
    id: "worker",
    name: "Worker",
    description: "A basic worker NPC.",
    portrait: "/portrait-placeholder.jpg",
    unlocked: false,
    unlockCondition: (r) => r.tmp >= 20,
  },
  {
    id: "npc2",
    name: "NPC 2",
    description: "Another NPC.",
    portrait: "/portrait-placeholder.jpg",
    unlocked: false,
    unlockCondition: () => false,
  },
  {
    id: "npc3",
    name: "NPC 3",
    description: "Yet another NPC.",
    portrait: "/portrait-placeholder.jpg",
    unlocked: false,
    unlockCondition: () => false,
  },
  {
    id: "npc4",
    name: "NPC 4",
    description: "Yet another NPC.",
    portrait: "/portrait-placeholder.jpg",
    unlocked: false,
    unlockCondition: () => false,
  },
  {
    id: "npc5",
    name: "NPC 5",
    description: "Yet another NPC.",
    portrait: "/portrait-placeholder.jpg",
    unlocked: false,
    unlockCondition: () => false,
  },
];

export const PORTRAIT_PLACEHOLDER = "/portrait-placeholder.jpg";
