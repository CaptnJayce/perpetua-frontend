import { UPGRADES } from "./upgrades";

export interface DepartmentDef {
  id: string;
  label: string;
  description: string;
  recipeIds: string[];
  unlockUpgradeId?: string;
}

export const DEPARTMENTS: Record<string, DepartmentDef> = {
  foundry: {
    id: "foundry",
    label: "Foundry",
    description: "Raw metal and wood turned into usable parts.",
    recipeIds: ["craftGear", "craftTemplateFittings", "craftBeams"],
  },
  "assembly-floor": {
    id: "assembly-floor",
    label: "Assembly Floor",
    description: "Structural components — the building side of the PKG.",
    recipeIds: ["craftPropeller", "craftVent", "craftPiston", "craftZephyr"],
    unlockUpgradeId: "build-assembly-floor",
  },
  "boiler-room": {
    id: "boiler-room",
    label: "Boiler Room",
    description: "Heat and pressure systems — the energy side of the PKS.",
    recipeIds: [
      "craftBoiler",
      "craftPressureValve",
      "craftGovernor",
      "craftFlywheel",
      "craftGauge",
      "craftStrongbox",
    ],
    unlockUpgradeId: "build-boiler-room",
  },
};

export function isDepartmentBuilt(
  dept: DepartmentDef,
  purchasedUpgrades: Record<string, number>,
): boolean {
  if (!dept.unlockUpgradeId) return true;
  return (purchasedUpgrades[dept.unlockUpgradeId] ?? 0) > 0;
}

export function getDepartmentForRecipe(
  recipeId: string,
): DepartmentDef | undefined {
  return Object.values(DEPARTMENTS).find((d) =>
    d.recipeIds.includes(recipeId),
  );
}

export function isRecipeUnlocked(
  recipeId: string,
  purchasedUpgrades: Record<string, number>,
): boolean {
  const dept = getDepartmentForRecipe(recipeId);
  if (!dept) return true;
  return isDepartmentBuilt(dept, purchasedUpgrades);
}

for (const dept of Object.values(DEPARTMENTS)) {
  if (dept.unlockUpgradeId && !UPGRADES[dept.unlockUpgradeId]) {
    throw new Error(
      `Department "${dept.id}" references unknown upgrade "${dept.unlockUpgradeId}"`,
    );
  }
}
