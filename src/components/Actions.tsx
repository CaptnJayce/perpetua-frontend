import { Fragment, useState } from "react";
import "./Actions.css";
import { useGameStore } from "../store";
import { getGatherables, RESOURCES } from "../data/resources";
import { NPCS } from "../data/npcs";
import { UPGRADES, type UpgradeCategory } from "../data/upgrades";
import { getCurrentQuest } from "../data/quests";
import { getNextAvailableNode } from "../data/dialogue";
import { UpgradeButton } from "./ActionButtons";
import BountyBoard from "./BountyBoard";
import type { NpcDef } from "../data/npcs";
import { getCraftableTargets } from "../systems/workers";
import type { UnlockEvent } from "../systems/unlocker";

const UPGRADE_CATEGORY_ORDER: UpgradeCategory[] = [
  "department",
  "storage",
  "resource-unlock",
  "unlock",
];

function NpcPicker() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const flags = useGameStore((s) => s.flags);
  const npcDialogueProgress = useGameStore((s) => s.npcDialogueProgress);
  const selectedNpcId = useGameStore((s) => s.selectedNpcId);
  const selectNpc = useGameStore((s) => s.selectNpc);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const questionModeActive = useGameStore((s) => s.questionModeActive);
  const showLorePopup = useGameStore((s) => s.showLorePopup);
  const [shakingId, setShakingId] = useState<string | null>(null);

  function hasNewDialogue(npcId: string): boolean {
    const progress = npcDialogueProgress[npcId];
    const completedNodeIds = progress?.completedNodeIds ?? [];
    return getNextAvailableNode(npcId, flags, completedNodeIds) !== null;
  }

  function handlePortraitClick(
    npc: UnlockEvent,
    isUnlocked: boolean,
    e: React.MouseEvent,
  ) {
    if (questionModeActive) {
      showLorePopup(npc.id, e.clientX, e.clientY);
      return;
    }
    if (!isUnlocked) {
      setShakingId(npc.id);
      setTimeout(() => setShakingId(null), 400);
      return;
    }
    selectNpc(npc.id);
  }

  function renderPortrait(npc: NpcDef) {
    const isUnlocked = unlockedNpcs.some((u) => u.id === npc.id);
    const isSelected = selectedNpcId === npc.id;
    const isShaking = shakingId === npc.id;
    const hasNew = isUnlocked && hasNewDialogue(npc.id);

    return (
      <button
        key={npc.id}
        className={`npc-portrait ${isSelected ? "npc-portrait--selected" : ""} ${isShaking ? "npc-portrait--shake" : ""} ${hasNew ? "npc-portrait--new" : ""}`}
        title={npc.name}
        disabled={isDialogueActive && !isSelected && !questionModeActive}
        onClick={(e) => handlePortraitClick(npc, isUnlocked, e)}
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
  }

  const workerNpcs = NPCS.filter((npc) => npc.role === "worker");
  const storyNpcs = NPCS.filter((npc) => npc.role === "story");

  return (
    <div className="npc-portraits">
      <div className="npc-portrait-group npc-portrait-group--story">
        {storyNpcs.map(renderPortrait)}
      </div>
      <div className="npc-portrait-divider" />
      <div className="npc-portrait-group npc-portrait-group--workers">
        {workerNpcs.map(renderPortrait)}
      </div>
    </div>
  );
}

function WorkerAssignmentRow({ npc }: { npc: NpcDef }) {
  const assignment = useGameStore((s) => s.workerAssignments[npc.id] ?? null);
  const assignWorker = useGameStore((s) => s.assignWorker);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const flags = useGameStore((s) => s.flags);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const gatherables = getGatherables(flags);
  const craftables = getCraftableTargets(purchasedUpgrades);

  const value = assignment?.targetId ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const targetId = e.target.value;
    if (!targetId) {
      assignWorker(npc.id, null);
      return;
    }
    assignWorker(npc.id, { targetId });
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
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Craft">
          {craftables.map((recipe) => {
            const outputDef = RESOURCES[recipe.output.resId];
            return (
              <option key={recipe.id} value={recipe.output.resId}>
                {outputDef?.label ?? recipe.output.resId}
              </option>
            );
          })}
        </optgroup>
      </select>
    </div>
  );
}

export default function Actions() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const flags = useGameStore((s) => s.flags);
  const npcDialogueProgress = useGameStore((s) => s.npcDialogueProgress);
  const unlockedWorkers = NPCS.filter(
    (npc) => npc.role === "worker" && unlockedNpcs.some((u) => u.id === npc.id),
  );
  const bountyBoardBuilt = flags.includes("bounty_board_built");
  const currentQuest = getCurrentQuest({
    flags,
    npcDialogueProgress,
    unlockedNpcs,
  });

  const upgradesByCategory = UPGRADE_CATEGORY_ORDER.map((category) => ({
    category,
    upgrades: Object.values(UPGRADES).filter((u) => u.category === category),
  })).filter((group) => group.upgrades.length > 0);

  return (
    <div className="actions">
      {currentQuest && (
        <div className="current-quest">Current Quest: {currentQuest.name}</div>
      )}

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

      {bountyBoardBuilt && (
        <section>
          <h3>Bounty Board</h3>
          <BountyBoard />
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
