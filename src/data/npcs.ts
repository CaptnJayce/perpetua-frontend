export interface NpcDef {
  id: string;
  name: string;
  portrait?: string;
  unlocked: boolean;
}

export const NPCS: NpcDef[] = [
  { id: "npc1", name: "NPC 1", unlocked: true },
  { id: "npc2", name: "NPC 2", unlocked: false },
  { id: "npc3", name: "NPC 3", unlocked: false },
  { id: "npc4", name: "NPC 4", unlocked: false },
  { id: "npc5", name: "NPC 5", unlocked: false },
];

export const PORTRAIT_PLACEHOLDER = "/portrait-placeholder.jpg";
