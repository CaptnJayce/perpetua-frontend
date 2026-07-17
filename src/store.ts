import { create } from "zustand";
import { RESOURCES } from "./data/resources";
import { RECIPES } from "./data/recipes";
import { NPCS } from "./data/npcs";
import {
  UPGRADES,
  getEffectiveCap,
  getEffectiveCooldown,
  getEffectiveCraftCost,
} from "./data/upgrades";
import { SPECIALIZATIONS } from "./data/specializations";
import { isRecipeUnlocked } from "./data/departments";
import {
  getCurrentDialogue,
  getNextAvailableNode,
  type DialogueOption,
} from "./data/dialogue";
import { checkUnlocks } from "./systems/unlocker";
import { applyGather, applyCraft } from "./systems/production";
import {
  isValidAssignment,
  tickWorkers,
  type WorkerAssignment,
} from "./systems/workers";
import {
  generateBounty,
  applyBountyFulfillment,
  BOUNTY_ROLL_INTERVAL,
  BOUNTY_ROLL_CHANCE,
  MAX_ACTIVE_BOUNTIES,
  type BountyQuest,
} from "./systems/bounties";
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

export interface NpcDialogueSessionState {
  currentNodeId: string;
  completed: boolean;
  historyStartIndex: number;
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
  specialization: string | null;
  user: AuthUser | null;
  selectedNpcId: string | null;
  npcDialogueStates: Record<string, NpcDialogueSessionState>;
  dialogueHistoryIndex: number;
  saveStatus: "pending" | "resolved";
  isReturningPlayer: boolean;
  questionModeActive: boolean;
  activeLorePopup: { id: string; x: number; y: number } | null;
  activeBounties: BountyQuest[];
  bountyRollCooldown: number;

  tick: (delta: number) => void;
  gather: (resourceId: string) => void;
  craft: (recipeId: string) => void;
  fulfillBounty: (bountyId: string) => void;
  setFlag: (flag: string) => void;
  chooseSpecialization: (specializationId: string) => void;
  completeDialogueNode: (npcId: string, nodeId: string) => void;
  addDialogueHistory: (
    npcId: string,
    entry: { nodeId: string; npcText: string; playerResponse: string },
  ) => void;
  toggleDebugMode: () => void;
  emptyResources: () => void;
  debugGrantGenerator: () => void;
  purchaseUpgrade: (upgradeId: string) => void;
  assignWorker: (workerId: string, assignment: WorkerAssignment | null) => void;
  setUser: (user: AuthUser | null) => void;
  hydrateSave: (saved: SavedGameFields) => void;
  markSaveResolved: (foundSave: boolean) => void;
  selectNpc: (npcId: string) => void;
  submitDialogueOption: (option: DialogueOption) => void;
  closeDialogueView: () => void;
  setDialogueHistoryIndex: (index: number) => void;
  toggleQuestionMode: () => void;
  showLorePopup: (id: string, x: number, y: number) => void;
  closeLorePopup: () => void;
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

    const newNpc = newNpcs[newNpcs.length - 1];
    const nextNode = getNextAvailableNode(newNpc.id, state.flags, []);

    set({
      unlockedNpcs,
      resources: { ...state.resources, workers: workerCount },
      selectedNpcId: newNpc.id,
      dialogueHistoryIndex: 0,
      isDialogueActive: nextNode ? true : state.isDialogueActive,
      npcDialogueStates: nextNode
        ? {
            ...state.npcDialogueStates,
            [newNpc.id]: {
              currentNodeId: nextNode,
              completed: false,
              historyStartIndex:
                state.npcDialogueProgress[newNpc.id]?.history.length ?? 0,
            },
          }
        : state.npcDialogueStates,
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
  {
    flag: "rubber_unlocked",
    condition: (s) => (s.purchasedUpgrades["unlock-rubber-gathering"] ?? 0) > 0,
  },
  {
    flag: "assembly_floor_built",
    condition: (s) => (s.purchasedUpgrades["build-assembly-floor"] ?? 0) > 0,
  },
  {
    flag: "boiler_room_built",
    condition: (s) => (s.purchasedUpgrades["build-boiler-room"] ?? 0) > 0,
  },
  {
    flag: "bounty_board_built",
    condition: (s) => (s.purchasedUpgrades["build-bounty-board"] ?? 0) > 0,
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
  specialization: null,
  user: null,
  selectedNpcId: null,
  npcDialogueStates: {},
  saveStatus: "pending",
  isReturningPlayer: false,
  dialogueHistoryIndex: 0,
  questionModeActive: false,
  activeLorePopup: null,
  activeBounties: [],
  bountyRollCooldown: BOUNTY_ROLL_INTERVAL,

  tick: (delta) => {
    const {
      resources,
      cooldowns,
      workerAssignments,
      workerCooldowns,
      unlockedNpcs,
      purchasedUpgrades,
      flags,
      activeBounties,
      bountyRollCooldown,
    } = get();
    const update: Partial<GameState> = {};
    let dirty = false;

    if (flags.includes("bounty_board_built")) {
      dirty = true;
      const nextBountyRollCooldown = bountyRollCooldown - delta;
      if (nextBountyRollCooldown <= 0) {
        update.bountyRollCooldown = BOUNTY_ROLL_INTERVAL;
        if (activeBounties.length < MAX_ACTIVE_BOUNTIES && Math.random() < BOUNTY_ROLL_CHANCE) {
          const storyNpcIds = NPCS.filter(
            (npc) => npc.role === "story" && unlockedNpcs.some((u) => u.id === npc.id),
          ).map((npc) => npc.id);
          const bounty = generateBounty(storyNpcIds, flags, resources, activeBounties);
          if (bounty) update.activeBounties = [...activeBounties, bounty];
        }
      } else {
        update.bountyRollCooldown = nextBountyRollCooldown;
      }
    }

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
      const nextCooldowns: Record<string, number> = { ...cooldowns };
      let cooldownResources = update.resources ?? resources;
      let producedSomething = false;

      for (const [id, cd] of Object.entries(cooldowns)) {
        if (cd <= 0) continue;
        const remaining = Math.max(0, cd - delta);
        nextCooldowns[id] = remaining;

        if (remaining <= 0) {
          if (RESOURCES[id]?.gatherAmt !== undefined) {
            const gathered = applyGather(cooldownResources, id, purchasedUpgrades);
            if (gathered) {
              cooldownResources = gathered;
              producedSomething = true;
            }
          } else if (RECIPES[id]) {
            const crafted = applyCraft(cooldownResources, id, purchasedUpgrades);
            if (crafted) {
              cooldownResources = crafted;
              producedSomething = true;
            }
          }
        }
      }

      update.cooldowns = nextCooldowns;
      if (producedSomething) update.resources = cooldownResources;
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

    if (debugMode) {
      const nextResources = applyGather(resources, resourceId, purchasedUpgrades);
      if (!nextResources) return;
      withUnlocks(get, set, { resources: nextResources });
      return;
    }

    if (cooldowns[resourceId] > 0) return;

    const effectiveCap = getEffectiveCap(resourceId, def.cap, purchasedUpgrades);
    if (resources[resourceId] >= effectiveCap) return;

    const effectiveCd = getEffectiveCooldown(def.gatherCd, purchasedUpgrades);
    set({ cooldowns: { ...cooldowns, [resourceId]: effectiveCd } });
  },

  craft: (recipeId) => {
    const recipe = RECIPES[recipeId];
    if (!recipe) return;

    const { resources, cooldowns, debugMode, purchasedUpgrades } = get();
    if (!isRecipeUnlocked(recipeId, purchasedUpgrades)) return;

    if (debugMode) {
      const nextResources = applyCraft(resources, recipeId, purchasedUpgrades);
      if (!nextResources) return;
      withUnlocks(get, set, { resources: nextResources });
      return;
    }

    if (!recipe.craftCd) {
      const nextResources = applyCraft(resources, recipeId, purchasedUpgrades);
      if (!nextResources) return;
      withUnlocks(get, set, { resources: nextResources });
      return;
    }

    if (cooldowns[recipeId] > 0) return;

    const outputDef = RESOURCES[recipe.output.resId];
    const effectiveCap = getEffectiveCap(recipe.output.resId, outputDef.cap, purchasedUpgrades);
    const canAfford = recipe.inputs.every(
      ({ resId, amnt }) => resources[resId] >= getEffectiveCraftCost(amnt, purchasedUpgrades),
    );
    const atCap = resources[recipe.output.resId] + recipe.output.amnt > effectiveCap;
    if (!canAfford || atCap) return;

    set({ cooldowns: { ...cooldowns, [recipeId]: recipe.craftCd } });
  },

  fulfillBounty: (bountyId) => {
    const { activeBounties, resources, purchasedUpgrades } = get();
    const bounty = activeBounties.find((b) => b.id === bountyId);
    if (!bounty) return;

    const nextResources = applyBountyFulfillment(resources, bounty, purchasedUpgrades);
    if (!nextResources) return;

    withUnlocks(get, set, {
      resources: nextResources,
      activeBounties: activeBounties.filter((b) => b.id !== bountyId),
    });
  },

  setFlag: (flag) => {
    const { flags } = get();
    if (!flags.includes(flag)) {
      set({ flags: [...flags, flag] });
      applyNpcUnlocks(get(), set);
    }
  },

  chooseSpecialization: (specializationId) => {
    const { specialization, flags } = get();
    if (specialization) return;

    const spec = SPECIALIZATIONS.find((s) => s.id === specializationId);
    if (!spec) return;

    set({
      specialization: specializationId,
      flags: flags.includes(spec.flag) ? flags : [...flags, spec.flag],
    });
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

  selectNpc: (npcId) => {
    const { npcDialogueProgress, flags, npcDialogueStates } = get();
    const progress = npcDialogueProgress[npcId];
    const completedNodeIds = progress?.completedNodeIds ?? [];
    const nextNode = getNextAvailableNode(npcId, flags, completedNodeIds);

    if (nextNode) {
      set({
        isDialogueActive: true,
        selectedNpcId: npcId,
        dialogueHistoryIndex: 0,
        npcDialogueStates: {
          ...npcDialogueStates,
          [npcId]: {
            currentNodeId: nextNode,
            completed: false,
            historyStartIndex: progress?.history.length ?? 0,
          },
        },
      });
    } else {
      set({
        isDialogueActive: false,
        selectedNpcId: npcId,
        dialogueHistoryIndex: 0,
        npcDialogueStates: {
          ...npcDialogueStates,
          [npcId]: {
            currentNodeId: npcDialogueStates[npcId]?.currentNodeId ?? "end",
            completed: true,
            historyStartIndex: 0,
          },
        },
      });
    }
  },

  submitDialogueOption: (option) => {
    const { selectedNpcId, npcDialogueStates } = get();
    if (!selectedNpcId) return;

    const dialogueState = npcDialogueStates[selectedNpcId];
    const currentNodeId = dialogueState?.currentNodeId ?? "intro";
    const currentNode = getCurrentDialogue(selectedNpcId, currentNodeId);
    if (!currentNode) return;

    if (option.setFlag) get().setFlag(option.setFlag);

    const nextNodeId = option.nextNodeId;
    const completed = !nextNodeId || nextNodeId === "end";

    get().addDialogueHistory(selectedNpcId, {
      nodeId: currentNode.id,
      npcText: currentNode.text,
      playerResponse: option.text,
    });

    const prevState = get().npcDialogueStates[selectedNpcId] ?? {
      currentNodeId: "intro",
      completed: false,
      historyStartIndex: 0,
    };
    set({
      npcDialogueStates: {
        ...get().npcDialogueStates,
        [selectedNpcId]: {
          ...prevState,
          currentNodeId: nextNodeId || "end",
          completed,
        },
      },
    });

    if (completed) {
      const startIndex = dialogueState?.historyStartIndex ?? 0;
      const sessionHistory =
        get().npcDialogueProgress[selectedNpcId]?.history ?? [];
      const firstHistoryEntry = sessionHistory[startIndex];
      if (firstHistoryEntry) {
        get().completeDialogueNode(selectedNpcId, firstHistoryEntry.nodeId);
      }
      set({ selectedNpcId: null, isDialogueActive: false });
    }
  },

  closeDialogueView: () => {
    set({ selectedNpcId: null, dialogueHistoryIndex: 0, isDialogueActive: false });
  },

  setDialogueHistoryIndex: (index) => set({ dialogueHistoryIndex: index }),

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

  debugGrantGenerator: () => {
    const { debugMode, resources } = get();
    if (!debugMode) return;
    withUnlocks(get, set, {
      resources: { ...resources, pkg: 1, pks: 1 },
    });
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
    const { unlockedNpcs, workerAssignments, workerCooldowns, purchasedUpgrades } = get();
    const npc = NPCS.find((n) => n.id === workerId);
    if (!npc || npc.role !== "worker") return;
    if (!unlockedNpcs.some((u) => u.id === workerId)) return;
    if (assignment && !isValidAssignment(assignment, purchasedUpgrades)) return;

    set({
      workerAssignments: { ...workerAssignments, [workerId]: assignment },
      workerCooldowns: { ...workerCooldowns, [workerId]: 0 },
    });
  },

  setUser: (user) => set({ user }),

  markSaveResolved: (foundSave) =>
    set({ saveStatus: "resolved", isReturningPlayer: foundSave }),

  hydrateSave: (saved) =>
    set({ ...saved, saveStatus: "resolved", isReturningPlayer: true }),

  toggleQuestionMode: () =>
    set((s) => ({ questionModeActive: !s.questionModeActive, activeLorePopup: null })),

  showLorePopup: (id, x, y) => set({ activeLorePopup: { id, x, y } }),

  closeLorePopup: () => set({ activeLorePopup: null }),
}));
