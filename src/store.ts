import { create } from "zustand";
import { RESOURCES } from "./data/resources";
import { RECIPES } from "./data/recipes";
import { NPCS } from "./data/npcs";
import { UPGRADES, getEffectiveCap, getEffectiveCooldown } from "./data/upgrades";
import { checkUnlocks } from "./systems/unlocker";
import { applyGather, applyCraft } from "./systems/production";
import {
  isValidAssignment,
  tickWorkers,
  type WorkerAssignment,
} from "./systems/workers";
import type { SavedGameFields } from "./lib/gameSaves";

export interface AuthUser {
  id: string;
  email: string;
}

interface UnlockEvent {
  id: string;
  name: string;
}

export interface NpcDialogueProgress {
  completedNodeIds: string[];
  history: { nodeId: string; npcText: string; playerResponse: string }[];
}

interface GameState {
  resources: Record<string, number>;
  cooldowns: Record<string, number>;
  unlockedNpcs: UnlockEvent[];
  unlockedRecipes: string[];
  flags: string[];
  npcDialogueProgress: Record<string, NpcDialogueProgress>;
  debugMode: boolean;
  isDialogueActive: boolean;
  purchasedUpgrades: Record<string, number>;
  workerAssignments: Record<string, WorkerAssignment | null>;
  workerCooldowns: Record<string, number>;
  user: AuthUser | null;

  tick: (delta: number) => void;
  gather: (resourceId: string) => void;
  craft: (recipeId: string) => void;
  setFlag: (flag: string) => void;
  completeDialogueNode: (npcId: string, nodeId: string) => void;
  addDialogueHistory: (
    npcId: string,
    entry: { nodeId: string; npcText: string; playerResponse: string },
  ) => void;
  toggleDebugMode: () => void;
  emptyResources: () => void;
  setDialogueActive: (active: boolean) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  assignWorker: (workerId: string, assignment: WorkerAssignment | null) => void;
  setUser: (user: AuthUser | null) => void;
  hydrateSave: (saved: SavedGameFields) => void;
}

const initialResources = Object.fromEntries(
  Object.keys(RESOURCES).map((id) => [id, 0]),
);

const initialCooldowns = Object.fromEntries(
  Object.values(RESOURCES)
    .filter((r) => r.gatherCd !== undefined)
    .map((r) => [r.id, 0]),
);

const PASSIVE_RESOURCES = Object.values(RESOURCES).filter((d) => d.rate);

function applyNpcUnlocks(
  state: GameState,
  set: (patch: Partial<GameState>) => void,
) {
  const newNpcs = checkUnlocks(state);
  if (newNpcs.length) {
    const unlockedNpcs = [...state.unlockedNpcs, ...newNpcs];
    const workerCount = unlockedNpcs.filter(
      (u) => NPCS.find((n) => n.id === u.id)?.role === "worker",
    ).length;
    set({
      unlockedNpcs,
      resources: { ...state.resources, workers: workerCount },
    });
  }
}

function withUnlocks(
  get: () => GameState,
  set: (patch: Partial<GameState>) => void,
  patch: Partial<GameState>,
) {
  const prevResources = get().resources;
  set(patch);
  const state = get();
  if (state.resources !== prevResources) {
    applyNpcUnlocks(state, set);
    checkFlags(state, set);
  }
}

const CONDITIONAL_FLAGS: {
  flag: string;
  condition: (state: Pick<GameState, "resources" | "purchasedUpgrades">) => boolean;
}[] = [
  {
    flag: "purchased_upgrade",
    condition: (s) =>
      Object.entries(s.purchasedUpgrades).some(
        ([upgradeId, count]) =>
          count > 0 &&
          UPGRADES[upgradeId]?.effects.some((e) => e.type === "storage"),
      ),
  },
  {
    flag: "generator_online",
    condition: (s) => s.resources.pkg >= 1 && s.resources.pks >= 1,
  },
  {
    flag: "gathering_crafting_upgraded",
    condition: (s) => (s.purchasedUpgrades["unlock-efficiency-upgrades"] ?? 0) > 0,
  },
];

function checkFlags(
  state: GameState,
  set: (patch: Partial<GameState>) => void,
) {
  for (const { flag, condition } of CONDITIONAL_FLAGS) {
    if (!state.flags.includes(flag) && condition(state)) {
      set({ flags: [...state.flags, flag] });
    }
  }
}

export { type GameState };

export const useGameStore = create<GameState>((set, get) => ({
  resources: initialResources,
  cooldowns: initialCooldowns,
  unlockedNpcs: [{ id: "mantle-of-logic", name: "Mantle of Logic" }],
  unlockedRecipes: [],
  flags: [],
  npcDialogueProgress: {},
  debugMode: false,
  isDialogueActive: false,
  purchasedUpgrades: {},
  workerAssignments: {},
  workerCooldowns: {},
  user: null,

  tick: (delta) => {
    const {
      resources,
      cooldowns,
      workerAssignments,
      workerCooldowns,
      unlockedNpcs,
      purchasedUpgrades,
      flags,
    } = get();
    const update: Partial<GameState> = {};
    let dirty = false;

    const activePassiveResources = PASSIVE_RESOURCES.filter(
      (d) => !d.requireFlag || flags.includes(d.requireFlag),
    );
    const anyBelowCap = activePassiveResources.some(
      (d) => resources[d.id] < d.cap,
    );
    if (anyBelowCap) {
      const nextResources = { ...resources };
      for (const def of activePassiveResources) {
        nextResources[def.id] = Math.min(
          def.cap,
          nextResources[def.id] + def.rate! * delta,
        );
      }
      update.resources = nextResources;
      dirty = true;
    }

    const anyCooldownActive = Object.values(cooldowns).some((cd) => cd > 0);
    if (anyCooldownActive) {
      update.cooldowns = Object.fromEntries(
        Object.entries(cooldowns).map(([id, cd]) => [
          id,
          Math.max(0, cd - delta),
        ]),
      );
      dirty = true;
    }

    const hasActiveWorkers = Object.values(workerAssignments).some(Boolean);
    if (hasActiveWorkers) {
      const result = tickWorkers({
        workerAssignments,
        workerCooldowns,
        unlockedWorkerIds: unlockedNpcs.map((n) => n.id),
        resources: update.resources ?? resources,
        purchasedUpgrades,
        delta,
      });
      if (result.changed) {
        update.resources = result.resources;
        update.workerCooldowns = result.workerCooldowns;
        dirty = true;
      }
    }

    if (dirty) withUnlocks(get, set, update);
  },

  gather: (resourceId) => {
    const def = RESOURCES[resourceId];
    if (!def?.gatherAmt || !def?.gatherCd) return;

    const { resources, cooldowns, debugMode, purchasedUpgrades } = get();
    const effectiveCd = getEffectiveCooldown(def.gatherCd, purchasedUpgrades);

    if (!debugMode && cooldowns[resourceId] > 0) return;

    const nextResources = applyGather(resources, resourceId, purchasedUpgrades);
    if (!nextResources) return;

    withUnlocks(get, set, {
      resources: nextResources,
      cooldowns: debugMode
        ? { ...cooldowns }
        : { ...cooldowns, [resourceId]: effectiveCd },
    });
  },

  craft: (recipeId) => {
    const recipe = RECIPES[recipeId];
    const { resources, cooldowns, debugMode, purchasedUpgrades } = get();

    if (recipe?.craftCd && !debugMode && cooldowns[recipeId] > 0) return;

    const nextResources = applyCraft(resources, recipeId, purchasedUpgrades);
    if (!nextResources) return;

    withUnlocks(get, set, {
      resources: nextResources,
      cooldowns:
        recipe?.craftCd && !debugMode
          ? { ...cooldowns, [recipeId]: recipe.craftCd }
          : cooldowns,
    });
  },

  setFlag: (flag) => {
    const { flags } = get();
    if (!flags.includes(flag)) {
      set({ flags: [...flags, flag] });
      applyNpcUnlocks(get(), set);
    }
  },

  completeDialogueNode: (npcId, nodeId) => {
    const { npcDialogueProgress } = get();
    const prev = npcDialogueProgress[npcId] || {
      completedNodeIds: [],
      history: [],
    };
    if (!prev.completedNodeIds.includes(nodeId)) {
      set({
        npcDialogueProgress: {
          ...npcDialogueProgress,
          [npcId]: {
            ...prev,
            completedNodeIds: [...prev.completedNodeIds, nodeId],
          },
        },
      });
    }
  },

  addDialogueHistory: (npcId, entry) => {
    const { npcDialogueProgress } = get();
    const prev = npcDialogueProgress[npcId] || {
      completedNodeIds: [],
      history: [],
    };
    set({
      npcDialogueProgress: {
        ...npcDialogueProgress,
        [npcId]: {
          ...prev,
          history: [...prev.history, entry],
        },
      },
    });
  },

  toggleDebugMode: () => {
    const { debugMode, resources, purchasedUpgrades } = get();
    const nextDebugMode = !debugMode;

    if (nextDebugMode) {
      const maxedResources = { ...resources };
      for (const def of Object.values(RESOURCES)) {
        maxedResources[def.id] = getEffectiveCap(
          def.id,
          def.cap,
          purchasedUpgrades,
        );
      }
      set({ debugMode: true, resources: maxedResources });
    } else {
      set({ debugMode: false });
    }
  },

  emptyResources: () => {
    if (!get().debugMode) return;
    set({ resources: { ...initialResources } });
  },

  setDialogueActive: (active) => {
    set({ isDialogueActive: active });
  },

  purchaseUpgrade: (upgradeId) => {
    const { resources, purchasedUpgrades } = get();
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return;
    if (
      upgrade.requiresUpgrade &&
      !(purchasedUpgrades[upgrade.requiresUpgrade] > 0)
    ) {
      return;
    }

    const currentCount = purchasedUpgrades[upgradeId] || 0;
    if (currentCount >= upgrade.maxPurchases) return;

    const cost = upgrade.cost(currentCount);
    const canAfford = cost.every(({ resId, amnt }) => resources[resId] >= amnt);
    if (!canAfford) return;

    const nextResources = { ...resources };
    for (const { resId, amnt } of cost) {
      nextResources[resId] -= amnt;
    }

    withUnlocks(get, set, {
      resources: nextResources,
      purchasedUpgrades: {
        ...purchasedUpgrades,
        [upgradeId]: currentCount + 1,
      },
    });
  },

  assignWorker: (workerId, assignment) => {
    const { unlockedNpcs, workerAssignments, workerCooldowns } = get();
    const npc = NPCS.find((n) => n.id === workerId);
    if (!npc || npc.role !== "worker") return;
    if (!unlockedNpcs.some((u) => u.id === workerId)) return;
    if (assignment && !isValidAssignment(assignment)) return;

    set({
      workerAssignments: { ...workerAssignments, [workerId]: assignment },
      workerCooldowns: { ...workerCooldowns, [workerId]: 0 },
    });
  },

  setUser: (user) => set({ user }),

  hydrateSave: (saved) => set(saved),
}));
