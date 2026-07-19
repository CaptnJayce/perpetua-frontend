import { RESOURCES, type ResourceDef } from "../data/resources";
import { getEffectiveCap } from "../data/upgrades";

export interface BountyQuest {
  id: string;
  npcId: string;
  giveResId: string;
  giveAmt: number;
  rewardResId: string;
  rewardAmt: number;
}

export const BOUNTY_ROLL_INTERVAL = 240;
export const BOUNTY_ROLL_CHANCE = 0.5;
export const MAX_ACTIVE_BOUNTIES = 5;

const ELIGIBLE_CATEGORIES = ["base", "crafted", "assembly"];

function eligibleResources(flags: string[]): ResourceDef[] {
  return Object.values(RESOURCES).filter(
    (r) =>
      ELIGIBLE_CATEGORIES.includes(r.category) &&
      (!r.requireFlag || flags.includes(r.requireFlag)),
  );
}

function randomAmount(def: ResourceDef): number {
  const base = def.category === "base" ? 15 : def.category === "crafted" ? 8 : 4;
  return base + Math.floor(Math.random() * base);
}

export function generateBounty(
  storyNpcIds: string[],
  flags: string[],
  resources: Record<string, number>,
  existing: BountyQuest[],
): BountyQuest | null {
  if (storyNpcIds.length === 0) return null;

  const eligible = eligibleResources(flags);
  if (eligible.length < 2) return null;

  const leanSurplus = Math.random() < 0.5;
  let giveDef: ResourceDef;
  if (leanSurplus) {
    const bySurplus = [...eligible].sort(
      (a, b) => resources[b.id] / b.cap - resources[a.id] / a.cap,
    );
    giveDef = bySurplus[Math.floor(Math.random() * Math.min(3, bySurplus.length))];
  } else {
    giveDef = eligible[Math.floor(Math.random() * eligible.length)];
  }

  const rewardCandidates = eligible.filter((r) => r.id !== giveDef.id);
  if (rewardCandidates.length === 0) return null;
  const rewardDef = rewardCandidates[Math.floor(Math.random() * rewardCandidates.length)];

  const isDuplicate = existing.some(
    (q) => q.giveResId === giveDef.id && q.rewardResId === rewardDef.id,
  );
  if (isDuplicate) return null;

  const npcId = storyNpcIds[Math.floor(Math.random() * storyNpcIds.length)];

  return {
    id: `bounty-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    npcId,
    giveResId: giveDef.id,
    giveAmt: randomAmount(giveDef),
    rewardResId: rewardDef.id,
    rewardAmt: randomAmount(rewardDef),
  };
}

export function applyBountyFulfillment(
  resources: Record<string, number>,
  bounty: BountyQuest,
  purchasedUpgrades: Record<string, number>,
): Record<string, number> | null {
  if (resources[bounty.giveResId] < bounty.giveAmt) return null;

  const rewardDef = RESOURCES[bounty.rewardResId];
  const effectiveCap = getEffectiveCap(bounty.rewardResId, rewardDef.cap, purchasedUpgrades);

  const nextResources = { ...resources };
  nextResources[bounty.giveResId] -= bounty.giveAmt;
  nextResources[bounty.rewardResId] = Math.min(
    effectiveCap,
    nextResources[bounty.rewardResId] + bounty.rewardAmt,
  );

  return nextResources;
}
