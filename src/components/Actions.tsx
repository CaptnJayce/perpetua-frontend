import { Fragment, useState } from "react";
import "./Actions.css";
import { useGameStore } from "../store";
import { RESOURCES, getGatherables } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { NPCS } from "../data/npcs";
import { UPGRADES, type UpgradeCategory } from "../data/upgrades";
import { getNextAvailableNode } from "../data/dialogue";
import { UpgradeButton } from "./ActionButtons";
import type { NpcDef } from "../data/npcs";
import type { WorkerAssignment } from "../systems/workers";
import type { UnlockEvent } from "../systems/unlocker";

const UPGRADE_CATEGORY_ORDER: UpgradeCategory[] = ["storage", "resource-unlock", "unlock"];

function NpcPicker() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const flags = useGameStore((s) => s.flags);
  const npcDialogueProgress = useGameStore((s) => s.npcDialogueProgress);
  const selectedNpcId = useGameStore((s) => s.selectedNpcId);
  const selectNpc = useGameStore((s) => s.selectNpc);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const [shakingId, setShakingId] = useState<string | null>(null);

  function hasNewDialogue(npcId: string): boolean {
    const progress = npcDialogueProgress[npcId];
    const completedNodeIds = progress?.completedNodeIds ?? [];
    return getNextAvailableNode(npcId, flags, completedNodeIds) !== null;
  }

  function handlePortraitClick(npc: UnlockEvent, isUnlocked: boolean) {
    if (!isUnlocked) {
      setShakingId(npc.id);
      setTimeout(() => setShakingId(null), 400);
      return;
    }
    selectNpc(npc.id);
  }

  return (
    <div className="npc-portraits">
      {NPCS.map((npc) => {
        const isUnlocked = unlockedNpcs.some((u) => u.id === npc.id);
        const isSelected = selectedNpcId === npc.id;
        const isShaking = shakingId === npc.id;
        const hasNew = isUnlocked && hasNewDialogue(npc.id);

        return (
          <button
            key={npc.id}
            className={`npc-portrait ${isSelected ? "npc-portrait--selected" : ""} ${isShaking ? "npc-portrait--shake" : ""} ${hasNew ? "npc-portrait--new" : ""}`}
            title={npc.name}
            disabled={isDialogueActive && !isSelected}
            onClick={() => handlePortraitClick(npc, isUnlocked)}
          >
            <img
              src={npc.portrait}
              style={{
                filter: isUnlocked ? "none" : "grayscale(100%)",
              }}
              alt={npc.name}
            />
          </button>
        );
      })}
    </div>
  );
}

function WorkerAssignmentRow({ npc }: { npc: NpcDef }) {
  const assignment = useGameStore((s) => s.workerAssignments[npc.id] ?? null);
  const assignWorker = useGameStore((s) => s.assignWorker);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const flags = useGameStore((s) => s.flags);
  const gatherables = getGatherables(flags);

  const value = assignment ? `${assignment.type}:${assignment.targetId}` : "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value;
    if (!raw) {
      assignWorker(npc.id, null);
      return;
    }
    const [type, targetId] = raw.split(":") as [WorkerAssignment["type"], string];
    assignWorker(npc.id, { type, targetId });
  }

  return (
    <div className="worker-row">
      <span className="worker-name">{npc.name}</span>
      <select
        className="worker-select"
        value={value}
        onChange={handleChange}
        disabled={isDialogueActive}
      >
        <option value="">Unassigned</option>
        <optgroup label="Gather">
          {gatherables.map((r) => (
            <option key={r.id} value={`gather:${r.id}`}>
              {r.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Craft">
          {Object.values(RECIPES).map((recipe) => (
            <option key={recipe.id} value={`craft:${recipe.id}`}>
              {RESOURCES[recipe.output.resId]?.label ?? recipe.id}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

export default function Actions() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const unlockedWorkers = NPCS.filter(
    (npc) => npc.role === "worker" && unlockedNpcs.some((u) => u.id === npc.id),
  );

  const upgradesByCategory = UPGRADE_CATEGORY_ORDER.map((category) => ({
    category,
    upgrades: Object.values(UPGRADES).filter((u) => u.category === category),
  })).filter((group) => group.upgrades.length > 0);

  return (
    <div className="actions">
      <section>
        <h3>Talk</h3>
        <NpcPicker />
      </section>

      {unlockedWorkers.length > 0 && (
        <section>
          <h3>Workers</h3>
          <div className="worker-list">
            {unlockedWorkers.map((npc) => (
              <WorkerAssignmentRow key={npc.id} npc={npc} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3>Upgrades</h3>
        <div className="upgrade-row">
          {upgradesByCategory.map((group, i) => (
            <Fragment key={group.category}>
              {i > 0 && <div className="upgrade-gap" />}
              {group.upgrades.map((upgrade) => (
                <UpgradeButton key={upgrade.id} upgradeId={upgrade.id} />
              ))}
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
