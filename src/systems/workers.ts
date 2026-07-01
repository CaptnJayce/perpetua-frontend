import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { getEffectiveCooldown } from "../data/upgrades";
import { applyGather, applyCraft } from "./production";

export type WorkerAssignment =
  | { type: "gather"; targetId: string }
  | { type: "craft"; targetId: string };

// Recipes have no inherent cooldown for the player (crafting is limited only
// by input availability), so automated workers need their own pace.
const WORKER_CRAFT_INTERVAL = 3;

export function isValidAssignment(assignment: WorkerAssignment): boolean {
  if (assignment.type === "gather") {
    return RESOURCES[assignment.targetId]?.gatherAmt !== undefined;
  }
  return RECIPES[assignment.targetId] !== undefined;
}

function getWorkerInterval(
  assignment: WorkerAssignment,
  purchasedUpgrades: Record<string, number>,
): number {
  if (assignment.type === "gather") {
    const def = RESOURCES[assignment.targetId];
    return getEffectiveCooldown(def?.gatherCd ?? 1, purchasedUpgrades);
  }
  return WORKER_CRAFT_INTERVAL;
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

    const produced =
      assignment.type === "gather"
        ? applyGather(nextResources, assignment.targetId, purchasedUpgrades)
        : applyCraft(nextResources, assignment.targetId, purchasedUpgrades);

    if (produced) nextResources = produced;

    // Reset the pace whether or not production succeeded, so a blocked
    // worker (at cap / short on inputs) retries at the same cadence
    // instead of busy-checking every tick.
    nextCooldowns[workerId] = getWorkerInterval(assignment, purchasedUpgrades);
  }

  return { resources: nextResources, workerCooldowns: nextCooldowns, changed };
}
