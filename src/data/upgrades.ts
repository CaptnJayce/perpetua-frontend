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
}

export const UPGRADES: Record<string, UpgradeDef> = {
    "expand-metal-storage": {
        id: "expand-metal-storage",
        label: "Expand Metal Storage",
        description: "Increases Template Metal storage capacity by 25",
        cost: (level) => [{ resId: "gear", amnt: 4 * Math.pow(2, level) }],
        maxPurchases: 5,
        effects: [{ type: "storage", target: "tmp", bonus: 25 }],
    },
    "expand-wood-storage": {
        id: "expand-wood-storage",
        label: "Expand Wood Storage",
        description: "Increases Blazer Wood storage capacity by 25",
        cost: (level) => [{ resId: "gear", amnt: 4 * Math.pow(2, level) }],
        maxPurchases: 5,
        effects: [{ type: "storage", target: "blazer-wood", bonus: 25 }],
    },
    "faster-gathering": {
        id: "faster-gathering",
        label: "Faster Gathering",
        description: "Reduces all gather cooldowns by 25%",
        cost: (level) => [{ resId: "template-fittings", amnt: 16 * Math.pow(2, level) }],
        maxPurchases: 3,
        effects: [{ type: "cooldownSpeed", multiplier: 0.75 }],
    },
    "efficient-crafting": {
        id: "efficient-crafting",
        label: "Efficient Crafting",
        description: "Reduces all craft costs by 20%",
        cost: (level) => [{ resId: "vacuum-tubes", amnt: 128 * Math.pow(2, level) }],
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
            if (effect.type === "storage" && effect.target === resId && effect.bonus) {
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
