import { supabase } from "./supabase";
import type { GameState } from "../store";

export type SavedGameFields = Pick<
  GameState,
  | "resources"
  | "cooldowns"
  | "unlockedNpcs"
  | "unlockedRecipes"
  | "flags"
  | "npcDialogueProgress"
  | "purchasedUpgrades"
  | "workerAssignments"
  | "workerCooldowns"
  | "specialization"
>;

interface GameSaveRow {
  resources: SavedGameFields["resources"];
  cooldowns: SavedGameFields["cooldowns"];
  unlocked_npcs: SavedGameFields["unlockedNpcs"];
  unlocked_recipes: SavedGameFields["unlockedRecipes"];
  flags: SavedGameFields["flags"];
  npc_dialogue_progress: SavedGameFields["npcDialogueProgress"];
  purchased_upgrades: SavedGameFields["purchasedUpgrades"];
  worker_assignments: SavedGameFields["workerAssignments"];
  worker_cooldowns: SavedGameFields["workerCooldowns"];
  specialization: SavedGameFields["specialization"];
}

export async function loadGameSave(
  userId: string,
): Promise<SavedGameFields | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("game_saves")
    .select(
      "resources, cooldowns, unlocked_npcs, unlocked_recipes, flags, npc_dialogue_progress, purchased_upgrades, worker_assignments, worker_cooldowns, specialization",
    )
    .eq("user_id", userId)
    .single<GameSaveRow>();

  if (error || !data) return null;

  return {
    resources: data.resources,
    cooldowns: data.cooldowns,
    unlockedNpcs: data.unlocked_npcs,
    unlockedRecipes: data.unlocked_recipes,
    flags: data.flags,
    npcDialogueProgress: data.npc_dialogue_progress,
    purchasedUpgrades: data.purchased_upgrades,
    workerAssignments: data.worker_assignments,
    workerCooldowns: data.worker_cooldowns,
    specialization: data.specialization,
  };
}

export async function saveGameState(
  userId: string,
  state: SavedGameFields,
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("game_saves")
    .update({
      resources: state.resources,
      cooldowns: state.cooldowns,
      unlocked_npcs: state.unlockedNpcs,
      unlocked_recipes: state.unlockedRecipes,
      flags: state.flags,
      npc_dialogue_progress: state.npcDialogueProgress,
      purchased_upgrades: state.purchasedUpgrades,
      worker_assignments: state.workerAssignments,
      worker_cooldowns: state.workerCooldowns,
      specialization: state.specialization,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return !error;
}
