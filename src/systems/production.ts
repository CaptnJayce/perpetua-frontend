import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { getEffectiveCap, getEffectiveCraftCost } from "../data/upgrades";

export function applyGather(
  resources: Record<string, number>,
  resourceId: string,
  purchasedUpgrades: Record<string, number>,
): Record<string, number> | null {
  const def = RESOURCES[resourceId];
  if (!def?.gatherAmt) return null;

  const effectiveCap = getEffectiveCap(resourceId, def.cap, purchasedUpgrades);
  if (resources[resourceId] >= effectiveCap) return null;

  return {
    ...resources,
    [resourceId]: Math.min(
      effectiveCap,
      resources[resourceId] + def.gatherAmt,
    ),
  };
}

export function applyCraft(
  resources: Record<string, number>,
  recipeId: string,
  purchasedUpgrades: Record<string, number>,
): Record<string, number> | null {
  const recipe = RECIPES[recipeId];
  if (!recipe) return null;

  const outputDef = RESOURCES[recipe.output.resId];
  const effectiveCap = getEffectiveCap(
    recipe.output.resId,
    outputDef.cap,
    purchasedUpgrades,
  );

  const effectiveInputs = recipe.inputs.map(({ resId, amnt }) => ({
    resId,
    amnt: getEffectiveCraftCost(amnt, purchasedUpgrades),
  }));

  const canCraft = effectiveInputs.every(
    ({ resId, amnt }) => resources[resId] >= amnt,
  );
  const atCap =
    resources[recipe.output.resId] + recipe.output.amnt > effectiveCap;

  if (!canCraft || atCap) return null;

  const nextResources = { ...resources };
  for (const { resId, amnt } of effectiveInputs) {
    nextResources[resId] -= amnt;
  }
  nextResources[recipe.output.resId] += recipe.output.amnt;

  return nextResources;
}
