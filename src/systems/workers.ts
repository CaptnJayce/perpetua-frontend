import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { getEffectiveCooldown } from "../data/upgrades";
import { getDepartmentForRecipe, isDepartmentBuilt } from "../data/departments";
import { applyGather, applyCraft } from "./production";

export interface WorkerAssignment {
  targetId: string;
}

const WORKER_CRAFT_INTERVAL = 3;

function findRecipeForOutput(resourceId: string): string | undefined {
  return Object.values(RECIPES).find((r) => r.output.resId === resourceId)?.id;
}

export function getCraftableTargets(purchasedUpgrades: Record<string, number>) {
  return Object.values(RECIPES).filter((recipe) => {
    const dept = getDepartmentForRecipe(recipe.id);
    return dept !== undefined && isDepartmentBuilt(dept, purchasedUpgrades);
  });
}

export function isValidAssignment(
  assignment: WorkerAssignment,
  flags: string[],
  purchasedUpgrades: Record<string, number>,
): boolean {
  const def = RESOURCES[assignment.targetId];
  if (def?.gatherAmt !== undefined) {
    return !def.requireFlag || flags.includes(def.requireFlag);
  }

  const recipeId = findRecipeForOutput(assignment.targetId);
  if (!recipeId) return false;
  const dept = getDepartmentForRecipe(recipeId);
  return dept !== undefined && isDepartmentBuilt(dept, purchasedUpgrades);
}

interface TickWorkersInput {
  workerAssignments: Record<string, WorkerAssignment | null>;
  workerCooldowns: Record<string, number>;
  unlockedWorkerIds: string[];
  resources: Record<string, number>;
  purchasedUpgrades: Record<string, number>;
  delta: number;
}

interface TickWorkersResult {
  resources: Record<string, number>;
  workerCooldowns: Record<string, number>;
  changed: boolean;
}

export function tickWorkers({
  workerAssignments,
  workerCooldowns,
  unlockedWorkerIds,
  resources,
  purchasedUpgrades,
  delta,
}: TickWorkersInput): TickWorkersResult {
  let nextResources = resources;
  const nextCooldowns = { ...workerCooldowns };
  let changed = false;

  for (const workerId of unlockedWorkerIds) {
    const assignment = workerAssignments[workerId];
    if (!assignment) continue;

    const cd = Math.max(0, (nextCooldowns[workerId] ?? 0) - delta);
    nextCooldowns[workerId] = cd;
    changed = true;

    if (cd > 0) continue;

    const def = RESOURCES[assignment.targetId];
    if (def?.gatherAmt !== undefined) {
      const produced = applyGather(nextResources, assignment.targetId, purchasedUpgrades);
      if (produced) nextResources = produced;
      nextCooldowns[workerId] = getEffectiveCooldown(def.gatherCd ?? 1, purchasedUpgrades);
      continue;
    }

    const recipeId = findRecipeForOutput(assignment.targetId);
    if (recipeId) {
      const produced = applyCraft(nextResources, recipeId, purchasedUpgrades);
      if (produced) nextResources = produced;
      nextCooldowns[workerId] = RECIPES[recipeId]?.craftCd ?? WORKER_CRAFT_INTERVAL;
    } else {
      nextCooldowns[workerId] = WORKER_CRAFT_INTERVAL;
    }
  }

  return { resources: nextResources, workerCooldowns: nextCooldowns, changed };
}
