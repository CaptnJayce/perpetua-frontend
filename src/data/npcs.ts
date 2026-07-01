export interface NpcDef {
  id: string;
  name: string;
  description: string;
  portrait: string;
  bodyShot: string;
  unlockCondition: (resources: Record<string, number>, flags: string[]) => boolean;
  unlocked: boolean;
  role: "story" | "worker";
}

export const NPCS: NpcDef[] = [
  {
    id: "mantle-of-logic",
    name: "Mantle of Logic",
    description:
      "'He who overseers Perpetua must be formed of blazer and metal. I am. Hence why I live longer than you all', that was his rebuttal when someone asked why we've only ever had him as a leader. Despite being called the Mantle of Logic, he doesn't understand everything, but he has a good head between his shoulders. Good leader. Friendlier than most other Mantles, though that's not saying much.",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => true,
    role: "story",
  },
  {
    id: "worker-1",
    name: "Worker NPC 1/10",
    description: "Can be assigned to crafting and gathering.",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: (_resources, flags) => flags.includes("unlock_worker_one"),
    role: "worker",
  },
  {
    id: "hexry",
    name: "Hexry",
    description: "Your rival. No unlock condition yet.",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => false,
    role: "story",
  },
];

export const PORTRAIT_PLACEHOLDER = "/portrait-placeholder.jpg";
