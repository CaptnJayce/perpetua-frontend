import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { getEffectiveCooldown } from "../data/upgrades";
import { DEPARTMENTS, isDepartmentBuilt } from "../data/departments";
import { applyGather, applyCraft } from "./production";

export type WorkerAssignment =
  | { type: "gather"; targetId: string }
  | { type: "department"; departmentId: string };

const WORKER_CRAFT_INTERVAL = 3;

export function isValidAssignment(
  assignment: WorkerAssignment,
  purchasedUpgrades: Record<string, number>,
): boolean {
  if (assignment.type === "gather") {
    return RESOURCES[assignment.targetId]?.gatherAmt !== undefined;
  }
  const dept = DEPARTMENTS[assignment.departmentId];
  return dept !== undefined && isDepartmentBuilt(dept, purchasedUpgrades);
}

function resolveDepartmentTarget(
  departmentId: string,
  resources: Record<string, number>,
  purchasedUpgrades: Record<string, number>,
): string | undefined {
  const dept = DEPARTMENTS[departmentId];
  if (!dept) return undefined;
  return dept.recipeIds.find(
    (recipeId) => applyCraft(resources, recipeId, purchasedUpgrades) !== null,
  );
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

    if (assignment.type === "gather") {
      const produced = applyGather(nextResources, assignment.targetId, purchasedUpgrades);
      if (produced) nextResources = produced;

      const def = RESOURCES[assignment.targetId];
      nextCooldowns[workerId] = getEffectiveCooldown(def?.gatherCd ?? 1, purchasedUpgrades);
      continue;
    }

    const targetRecipeId = resolveDepartmentTarget(
      assignment.departmentId,
      nextResources,
      purchasedUpgrades,
    );
    if (targetRecipeId) {
      const produced = applyCraft(nextResources, targetRecipeId, purchasedUpgrades);
      if (produced) nextResources = produced;
      nextCooldowns[workerId] = RECIPES[targetRecipeId]?.craftCd ?? WORKER_CRAFT_INTERVAL;
    } else {
      nextCooldowns[workerId] = WORKER_CRAFT_INTERVAL;
    }
  }

  return { resources: nextResources, workerCooldowns: nextCooldowns, changed };
}
