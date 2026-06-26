import { create } from "zustand";
import { RESOURCES } from "./data/resources";
import { RECIPES } from "./data/recipes";
import {
  UPGRADES,
  getEffectiveCap,
  getEffectiveCooldown,
  getEffectiveCraftCost,
} from "./data/upgrades";
import { checkUnlocks } from "./systems/unlocker";

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
  setDialogueActive: (active: boolean) => void;
  purchaseUpgrade: (upgradeId: string) => void;
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

function withUnlocks(
  get: () => GameState,
  set: (patch: Partial<GameState>) => void,
  patch: Partial<GameState>,
) {
  const prevResources = get().resources;
  set(patch);
  const state = get();
  if (state.resources !== prevResources) {
    const newNpcs = checkUnlocks(state);
    if (newNpcs.length) {
      set({ unlockedNpcs: [...state.unlockedNpcs, ...newNpcs] });
    }
    checkFlags(state, set);
  }
}

const CONDITIONAL_FLAGS = [
  {
    flag: "completed_tutorial",
    condition: (r: Record<string, number>) => r.tmp >= 50,
  },
];

function checkFlags(
  state: GameState,
  set: (patch: Partial<GameState>) => void,
) {
  for (const { flag, condition } of CONDITIONAL_FLAGS) {
    if (!state.flags.includes(flag) && condition(state.resources)) {
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

  tick: (delta) => {
    const { resources, cooldowns } = get();
    const update: Partial<GameState> = {};
    let dirty = false;

    const anyBelowCap = PASSIVE_RESOURCES.some((d) => resources[d.id] < d.cap);
    if (anyBelowCap) {
      const nextResources = { ...resources };
      for (const def of PASSIVE_RESOURCES) {
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

    if (dirty) withUnlocks(get, set, update);
  },

  gather: (resourceId) => {
    const def = RESOURCES[resourceId];
    if (!def?.gatherAmt || !def?.gatherCd) return;

    const { resources, cooldowns, debugMode, purchasedUpgrades } = get();
    const effectiveCap = getEffectiveCap(
      resourceId,
      def.cap,
      purchasedUpgrades,
    );
    const effectiveCd = getEffectiveCooldown(def.gatherCd, purchasedUpgrades);

    if (!debugMode && cooldowns[resourceId] > 0) return;
    if (resources[resourceId] >= effectiveCap) return;

    withUnlocks(get, set, {
      resources: {
        ...resources,
        [resourceId]: Math.min(
          effectiveCap,
          resources[resourceId] + def.gatherAmt,
        ),
      },
      cooldowns: debugMode
        ? { ...cooldowns }
        : { ...cooldowns, [resourceId]: effectiveCd },
    });
  },

  craft: (recipeId) => {
    const recipe = RECIPES[recipeId];
    if (!recipe) return;

    const { resources, purchasedUpgrades } = get();
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

    if (!canCraft || atCap) return;

    const nextResources = { ...resources };
    for (const { resId, amnt } of effectiveInputs) {
      nextResources[resId] -= amnt;
    }
    nextResources[recipe.output.resId] += recipe.output.amnt;

    withUnlocks(get, set, { resources: nextResources });
  },

  setFlag: (flag) => {
    const { flags } = get();
    if (!flags.includes(flag)) {
      const nextFlags = [...flags, flag];
      set({ flags: nextFlags });
      const state = get();
      const newNpcs = checkUnlocks(state);
      if (newNpcs.length) {
        set({ unlockedNpcs: [...state.unlockedNpcs, ...newNpcs] });
      }
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

  setDialogueActive: (active) => {
    set({ isDialogueActive: active });
  },

  purchaseUpgrade: (upgradeId) => {
    const { resources, purchasedUpgrades } = get();
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return;

    const currentCount = purchasedUpgrades[upgradeId] || 0;
    if (currentCount >= upgrade.maxPurchases) return;

    const cost = upgrade.cost(currentCount);
    const canAfford = cost.every(({ resId, amnt }) => resources[resId] >= amnt);
    if (!canAfford) return;

    const nextResources = { ...resources };
    for (const { resId, amnt } of cost) {
      nextResources[resId] -= amnt;
    }

    set({
      resources: nextResources,
      purchasedUpgrades: {
        ...purchasedUpgrades,
        [upgradeId]: currentCount + 1,
      },
    });
  },
}));
