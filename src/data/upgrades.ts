export interface UpgradeEffect {
  type: "storage" | "gatherAmount" | "craftCost" | "cooldownSpeed";
  target?: string; // resource id for storage/gather, recipe id for craft cost
  multiplier?: number; // e.g., 0.9 for 10% reduction
  bonus?: number; // e.g., 25 for +25 capacity
}

export interface UpgradeDef {
  id: string;
  label: string;
  description: string;
  cost: (level: number) => { resId: string; amnt: number }[];
  maxPurchases: number;
  effects: UpgradeEffect[];
  // If set, this upgrade is hidden/unpurchasable until the referenced
  // upgrade id has been bought at least once — a branch-unlock gate.
  requiresUpgrade?: string;
}

export const UPGRADES: Record<string, UpgradeDef> = {
  "expand-metal-storage": {
    id: "expand-metal-storage",
    label: "Expand Metal Storage",
    description: "Increases Template Metal storage capacity by 100",
    cost: (level) => [
      { resId: "tmp", amnt: 40 + level * 20 },
      { resId: "beams", amnt: 10 + level * 5 },
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "tmp", bonus: 100 }],
  },
  "expand-wood-storage": {
    id: "expand-wood-storage",
    label: "Expand Wood Storage",
    description: "Increases Blazer Wood storage capacity by 100",
    cost: (level) => [
      { resId: "tmp", amnt: 40 + level * 20 },
      { resId: "beams", amnt: 10 + level * 5 },
      { resId: "gear", amnt: 6 + level * 3 },
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "wood", bonus: 100 }],
  },
  "expand-gear-storage": {
    id: "expand-gear-storage",
    label: "Expand Gear Storage",
    description: "Increases Gear storage capacity by 50",
    cost: (level) => [
      { resId: "tmp", amnt: 30 + level * 15 },
      { resId: "wood", amnt: 15 + level * 8 },
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "gear", bonus: 50 }],
  },
  "expand-fittings-storage": {
    id: "expand-fittings-storage",
    label: "Expand Fittings Storage",
    description: "Increases Template Fittings storage capacity by 50",
    cost: (level) => [
      { resId: "tmp", amnt: 30 + level * 15 },
      { resId: "beams", amnt: 8 + level * 4 },
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "fittings", bonus: 50 }],
  },
  "expand-beams-storage": {
    id: "expand-beams-storage",
    label: "Expand Beams Storage",
    description: "Increases Beams storage capacity by 50",
    cost: (level) => [
      { resId: "tmp", amnt: 30 + level * 15 },
      { resId: "gear", amnt: 6 + level * 3 },
    ],
    maxPurchases: 5,
    effects: [{ type: "storage", target: "beams", bonus: 50 }],
  },
  "unlock-efficiency-upgrades": {
    id: "unlock-efficiency-upgrades",
    label: "Unlock Efficiency Upgrades",
    description: "Unlocks Faster Gathering and Efficient Crafting for purchase",
    cost: () => [
      { resId: "fittings", amnt: 80 },
      { resId: "beams", amnt: 80 },
    ],
    maxPurchases: 1,
    effects: [],
  },
  "faster-gathering": {
    id: "faster-gathering",
    label: "Faster Gathering",
    description: "Reduces all gather cooldowns by 25%",
    requiresUpgrade: "unlock-efficiency-upgrades",
    cost: (level) => [{ resId: "fittings", amnt: 80 * Math.pow(2, level) }],
    maxPurchases: 3,
    effects: [{ type: "cooldownSpeed", multiplier: 0.75 }],
  },
  "efficient-crafting": {
    id: "efficient-crafting",
    label: "Efficient Crafting",
    description: "Reduces all craft costs by 20%",
    requiresUpgrade: "unlock-efficiency-upgrades",
    cost: (level) => [{ resId: "beams", amnt: 128 * Math.pow(2, level) }],
    maxPurchases: 3,
    effects: [{ type: "craftCost", multiplier: 0.8 }],
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
