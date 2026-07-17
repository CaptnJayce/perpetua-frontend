export interface UpgradeEffect {
  type: "storage" | "gatherAmount" | "craftCost" | "cooldownSpeed";
  target?: string; // resource id for storage/gather, recipe id for craft cost
  multiplier?: number; // e.g., 0.9 for 10% reduction
  bonus?: number; // e.g., 25 for +25 capacity
}

export type UpgradeCategory = "storage" | "resource-unlock" | "unlock" | "department";

export interface UpgradeDef {
  id: string;
  label: string;
  description: string;
  cost: (level: number) => { resId: string; amnt: number }[];
  maxPurchases: number;
  effects: UpgradeEffect[];
  category: UpgradeCategory;
  requiresUpgrade?: string;
}

export const UPGRADES: Record<string, UpgradeDef> = {
  "build-assembly-floor": {
    id: "build-assembly-floor",
    label: "Build Assembly Floor",
    description: "Opens the Assembly Floor — unlocks Propeller and Vent production",
    cost: () => [
      { resId: "gear", amnt: 20 },
      { resId: "beams", amnt: 20 },
    ],
    maxPurchases: 1,
    effects: [],
    category: "department",
  },
  "build-boiler-room": {
    id: "build-boiler-room",
    label: "Build Boiler Room",
    description: "Opens the Boiler Room — unlocks passive Steam Dust generation, Steam Pipe/Glass gathering, and the heavy assemblies the Generator and Storage core need",
    requiresUpgrade: "build-assembly-floor",
    cost: () => [
      { resId: "propeller", amnt: 5 },
      { resId: "vent", amnt: 5 },
      { resId: "fittings", amnt: 40 },
    ],
    maxPurchases: 1,
    effects: [],
    category: "department",
  },
  "build-bounty-board": {
    id: "build-bounty-board",
    label: "Build Bounty Board",
    description: "Opens the Bounty Board — story NPCs will occasionally post material trade requests",
    cost: () => [
      { resId: "wood", amnt: 25 },
      { resId: "beams", amnt: 5 },
    ],
    maxPurchases: 1,
    effects: [],
    category: "department",
  },
  "unlock-rubber-gathering": {
    id: "unlock-rubber-gathering",
    label: "Rubber Gathering",
    description: "Unlocks gathering Rubber",
    cost: () => [
      { resId: "tmp", amnt: 15 },
      { resId: "wood", amnt: 15 },
    ],
    maxPurchases: 1,
    effects: [],
    category: "resource-unlock",
  },
  "expand-metal-storage": {
    id: "expand-metal-storage",
    label: "Metal Storage ++",
    description: "Increases Template Metal storage capacity by 100",
    cost: (level) => [
      { resId: "tmp", amnt: 40 + level * 20 },
      { resId: "beams", amnt: 10 + level * 5 },
      { resId: "fittings", amnt: 10 + level * 5 },
      ...(level >= 1 ? [{ resId: "temp1", amnt: 1 }] : []),
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "tmp", bonus: 100 }],
    category: "storage",
  },
  "expand-wood-storage": {
    id: "expand-wood-storage",
    label: "Wood Storage ++",
    description: "Increases Blazer Wood storage capacity by 100",
    cost: (level) => [
      { resId: "tmp", amnt: 40 + level * 20 },
      { resId: "beams", amnt: 10 + level * 5 },
      { resId: "fittings", amnt: 10 + level * 5 },
      ...(level >= 1 ? [{ resId: "temp1", amnt: 1 }] : []),
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "wood", bonus: 100 }],
    category: "storage",
  },
  "expand-gear-storage": {
    id: "expand-gear-storage",
    label: "Gear Storage ++",
    description: "Increases Gear storage capacity by 50",
    cost: (level) => [
      { resId: "wood", amnt: 15 + level * 8 },
      { resId: "rubber", amnt: 10 + level * 5 },
      { resId: "fittings", amnt: 15 },
      ...(level >= 2 ? [{ resId: "temp2", amnt: 1 }] : []),
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "gear", bonus: 50 }],
    category: "storage",
  },
  "expand-fittings-storage": {
    id: "expand-fittings-storage",
    label: "Fittings Storage ++",
    description: "Increases Fitting storage capacity by 50",
    cost: (level) => [
      { resId: "tmp", amnt: 30 + level * 15 },
      { resId: "rubber", amnt: 10 + level * 5 },
      { resId: "beams", amnt: 15 },
      ...(level >= 2 ? [{ resId: "temp2", amnt: 1 }] : []),
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "fittings", bonus: 50 }],
    category: "storage",
  },
  "expand-beams-storage": {
    id: "expand-beams-storage",
    label: "Beams Storage ++",
    description: "Increases Beams storage capacity by 50",
    cost: (level) => [
      { resId: "tmp", amnt: 30 + level * 15 },
      { resId: "rubber", amnt: 10 + level * 5 },
      { resId: "gear", amnt: 15 },
      ...(level >= 2 ? [{ resId: "temp2", amnt: 1 }] : []),
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "beams", bonus: 50 }],
    category: "storage",
  },
  "expand-rubber-storage": {
    id: "expand-rubber-storage",
    label: "Rubber Storage ++",
    description: "Increases Rubber storage capacity by 50",
    requiresUpgrade: "unlock-rubber-gathering",
    cost: (level) => [
      { resId: "tmp", amnt: 40 + level * 20 },
      { resId: "beams", amnt: 10 + level * 5 },
      { resId: "fittings", amnt: 10 + level * 5 },
      ...(level >= 1 ? [{ resId: "temp1", amnt: 1 }] : []),
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "rubber", bonus: 50 }],
    category: "storage",
  },
  "unlock-efficiency-upgrades": {
    id: "unlock-efficiency-upgrades",
    label: "Efficiency Upgrades",
    description: "Unlocks Faster Gathering and Efficient Crafting for purchase",
    cost: () => [
      { resId: "fittings", amnt: 80 },
      { resId: "beams", amnt: 80 },
    ],
    maxPurchases: 1,
    effects: [],
    category: "unlock",
  },
  "faster-gathering": {
    id: "faster-gathering",
    label: "Faster Gathering",
    description: "Reduces all gather cooldowns by 25%",
    requiresUpgrade: "unlock-efficiency-upgrades",
    cost: (level) => [{ resId: "fittings", amnt: 80 * Math.pow(2, level) }],
    maxPurchases: 3,
    effects: [{ type: "cooldownSpeed", multiplier: 0.75 }],
    category: "unlock",
  },
  "efficient-crafting": {
    id: "efficient-crafting",
    label: "Efficient Crafting",
    description: "Reduces all craft costs by 20%",
    requiresUpgrade: "unlock-efficiency-upgrades",
    cost: (level) => [{ resId: "beams", amnt: 128 * Math.pow(2, level) }],
    maxPurchases: 3,
    effects: [{ type: "craftCost", multiplier: 0.8 }],
    category: "unlock",
  },
};

export function getEffectiveCap(
  resId: string,
  baseCap: number,
  purchasedUpgrades: Record<string, number>,
): number {
  let bonus = 0;
  for (const [upId, count] of Object.entries(purchasedUpgrades)) {
    const up = UPGRADES[upId];
    if (!up) continue;
    for (const effect of up.effects) {
      if (
        effect.type === "storage" &&
        effect.target === resId &&
        effect.bonus
      ) {
        bonus += effect.bonus * count;
      }
    }
  }
  return baseCap + bonus;
}

export function getEffectiveCooldown(
  baseCd: number,
  purchasedUpgrades: Record<string, number>,
): number {
  let multiplier = 1;
  for (const [upId, count] of Object.entries(purchasedUpgrades)) {
    const up = UPGRADES[upId];
    if (!up) continue;
    for (const effect of up.effects) {
      if (effect.type === "cooldownSpeed" && effect.multiplier) {
        multiplier *= Math.pow(effect.multiplier, count);
      }
    }
  }
  return baseCd * multiplier;
}

export function getEffectiveCraftCost(
  baseAmount: number,
  purchasedUpgrades: Record<string, number>,
): number {
  let multiplier = 1;
  for (const [upId, count] of Object.entries(purchasedUpgrades)) {
    const up = UPGRADES[upId];
    if (!up) continue;
    for (const effect of up.effects) {
      if (effect.type === "craftCost" && effect.multiplier) {
        multiplier *= Math.pow(effect.multiplier, count);
      }
    }
  }
  return Math.ceil(baseAmount * multiplier);
}
