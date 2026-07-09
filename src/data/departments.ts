import { UPGRADES } from "./upgrades";

export interface DepartmentDef {
  id: string;
  label: string;
  description: string;
  recipeIds: string[];
  // Upgrade id that builds this department. Undefined means the department
  // is open from the start (the Foundry — tier-1 crafting needs no gate).
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
    description: "Foundry parts combined into working mechanisms.",
    recipeIds: ["craftPropeller", "craftVent"],
    unlockUpgradeId: "build-assembly-floor",
  },
  "boiler-room": {
    id: "boiler-room",
    label: "Boiler Room",
    description: "Heavy assemblies for the generator and storage core.",
    recipeIds: [
      "craftBoiler",
      "craftPiston",
      "craftPressureValve",
      "craftCoil",
      "craftFlywheel",
      "craftGauge",
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

// Recipes with no department (the pkg/pks milestone crafts) are always
// unlocked — they're gated naturally by needing department output as inputs.
export function isRecipeUnlocked(
  recipeId: string,
  purchasedUpgrades: Record<string, number>,
): boolean {
  const dept = getDepartmentForRecipe(recipeId);
  if (!dept) return true;
  return isDepartmentBuilt(dept, purchasedUpgrades);
}

// Sanity check that every unlockUpgradeId actually resolves to a real
// upgrade — a typo here would silently soft-lock a department forever.
for (const dept of Object.values(DEPARTMENTS)) {
  if (dept.unlockUpgradeId && !UPGRADES[dept.unlockUpgradeId]) {
    throw new Error(
      `Department "${dept.id}" references unknown upgrade "${dept.unlockUpgradeId}"`,
    );
  }
}
