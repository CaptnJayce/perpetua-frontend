export interface NpcDef {
  id: string;
  name: string;
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
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => true,
    role: "story",
  },
  {
    id: "worker-1",
    name: "Worker NPC 1/10",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: (_resources, flags) => flags.includes("unlock_worker_one"),
    role: "worker",
  },
  {
    id: "gaige",
    name: "Gaige",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: (_resources, flags) =>
      flags.includes("unlock_worker_one") &&
      flags.includes("gathering_crafting_upgraded"),
    role: "story",
  },
  {
    id: "belling",
    name: "Belling",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => false,
    role: "story",
  },
  {
    id: "emil",
    name: "Emil",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => false,
    role: "story",
  },
  {
    id: "relia",
    name: "Relia",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => false,
    role: "story",
  },
  {
    id: "ylene",
    name: "Ylene",
    portrait: "/portrait-placeholder.jpg",
    bodyShot: "/body-shot-portrait.png",
    unlocked: false,
    unlockCondition: () => false,
    role: "story",
  },
];

export const PORTRAIT_PLACEHOLDER = "/portrait-placeholder.jpg";
