import { create } from "zustand";
import { RESOURCES } from "./data/resources";
import { RECIPES } from "./data/recipes";
import { checkUnlocks } from "./systems/unlocker";

interface GameState {
    resources: Record<string, number>;
    cooldowns: Record<string, number>;
    unlockedNpcs: string[];
    unlockedRecipes: string[];

    tick: (delta: number) => void;
    gather: (resourceId: string) => void;
    craft: (recipeId: string) => void;
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

function withUnlocks(get: () => GameState, set: (patch: Partial<GameState>) => void, patch: Partial<GameState>) {
    const prevResources = get().resources;
    set(patch);
    const state = get();
    if (state.resources !== prevResources) {
        const newNpcs = checkUnlocks(state);
        if (newNpcs.length) {
            set({ unlockedNpcs: [...state.unlockedNpcs, ...newNpcs] });
        }
    }
}

export { type GameState };

export const useGameStore = create<GameState>((set, get) => ({
    resources: initialResources,
    cooldowns: initialCooldowns,
    unlockedNpcs: [],
    unlockedRecipes: [],

    tick: (delta) => {
        const { resources, cooldowns } = get();
        const update: Partial<GameState> = {};
        let dirty = false;

        const anyBelowCap = PASSIVE_RESOURCES.some(
            (d) => resources[d.id] < d.cap,
        );
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

        const { resources, cooldowns } = get();
        if (cooldowns[resourceId] > 0 || resources[resourceId] >= def.cap)
            return;

        withUnlocks(get, set, {
            resources: {
                ...resources,
                [resourceId]: Math.min(
                    def.cap,
                    resources[resourceId] + def.gatherAmt,
                ),
            },
            cooldowns: { ...cooldowns, [resourceId]: def.gatherCd },
        });
    },

    craft: (recipeId) => {
        const recipe = RECIPES[recipeId];
        if (!recipe) return;

        const { resources } = get();

        const canCraft = recipe.inputs.every(
            ({ resId, amnt }) => resources[resId] >= amnt,
        );
        const outputDef = RESOURCES[recipe.output.resId];
        const atCap =
            resources[recipe.output.resId] + recipe.output.amnt > outputDef.cap;

        if (!canCraft || atCap) return;

        const nextResources = { ...resources };
        for (const { resId, amnt } of recipe.inputs) {
            nextResources[resId] -= amnt;
        }
        nextResources[recipe.output.resId] += recipe.output.amnt;

        withUnlocks(get, set, { resources: nextResources });
    },
}));
