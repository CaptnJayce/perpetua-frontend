import "./Actions.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { NPCS } from "../data/npcs";
import { UPGRADES, getEffectiveCap, getEffectiveCraftCost } from "../data/upgrades";
import { ResourceIcon } from "./Resources";
import type { RecipeDef } from "../data/recipes";
import type { NpcDef } from "../data/npcs";
import type { WorkerAssignment } from "../systems/workers";

function CostChips({ costs }: { costs: { resId: string; amnt: number }[] }) {
  return (
    <span className="cost-chips">
      {costs.map(({ resId, amnt }) => (
        <span key={resId} className="cost-chip">
          <ResourceIcon icon={RESOURCES[resId]?.icon} size={16} />
          {amnt}
        </span>
      ))}
    </span>
  );
}

function getGatherables(flags: string[]) {
  return Object.values(RESOURCES).filter(
    (r) => r.gatherAmt !== undefined && (!r.requireFlag || flags.includes(r.requireFlag)),
  );
}

function GatherButton({ resourceId }: { resourceId: string }) {
  const def = RESOURCES[resourceId];
  const amount = useGameStore((s) => s.resources[resourceId]);
  const cd = useGameStore((s) => s.cooldowns[resourceId] ?? 0);
  const gather = useGameStore((s) => s.gather);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);

  const effectiveCap = getEffectiveCap(resourceId, def.cap, purchasedUpgrades);

  const atCap = amount >= effectiveCap;
  const disabled = isDialogueActive || cd > 0 || atCap;

  const cooldownDuration = def.gatherCd ?? 1;
  const progress = Math.max(0, Math.min(1, cd / cooldownDuration));

  return (
    <button
      className="action-btn"
      onClick={() => gather(resourceId)}
      disabled={disabled}
    >
      {cd > 0 && (
        <div
          className="cooldown-overlay"
          style={{
            transform: `scaleY(${progress})`,
          }}
        />
      )}
      <span className="btn-content">
        {def.label} + {def.gatherAmt}
      </span>
    </button>
  );
}

function CraftButton({ recipe }: { recipe: RecipeDef }) {
  const resources = useGameStore((s) => s.resources);
  const cd = useGameStore((s) => s.cooldowns[recipe.id] ?? 0);
  const craft = useGameStore((s) => s.craft);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);

  const outputDef = RESOURCES[recipe.output.resId];
  if (!outputDef) {
    console.warn(`CraftButton: unknown resource id "${recipe.output.resId}" in recipe "${recipe.id}"`);
    return null;
  }

  const effectiveCap = getEffectiveCap(recipe.output.resId, outputDef.cap, purchasedUpgrades);

  const effectiveInputs = recipe.inputs.map(({ resId, amnt }) => ({
    resId,
    amnt: getEffectiveCraftCost(amnt, purchasedUpgrades),
  }));

  const canAfford = effectiveInputs.every(
    ({ resId, amnt }) => resources[resId] >= amnt,
  );
  const atCap = resources[recipe.output.resId] + recipe.output.amnt > effectiveCap;
  const disabled = isDialogueActive || cd > 0 || !canAfford || atCap;

  const cooldownDuration = recipe.craftCd ?? 1;
  const progress = Math.max(0, Math.min(1, cd / cooldownDuration));

  return (
    <button className="action-btn" onClick={() => craft(recipe.id)} disabled={disabled}>
      {cd > 0 && (
        <div
          className="cooldown-overlay"
          style={{
            transform: `scaleY(${progress})`,
          }}
        />
      )}
      <span className="btn-content">
        <span>{outputDef.label}</span>
        <CostChips costs={effectiveInputs} />
      </span>
    </button>
  );
}

function UpgradeButton({ upgradeId }: { upgradeId: string }) {
  const upgrade = UPGRADES[upgradeId];
  const resources = useGameStore((s) => s.resources);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);

  if (
    upgrade.requiresUpgrade &&
    !(purchasedUpgrades[upgrade.requiresUpgrade] > 0)
  ) {
    return null;
  }

  const currentCount = purchasedUpgrades[upgradeId] || 0;
  if (currentCount >= upgrade.maxPurchases) return null;

  const cost = upgrade.cost(currentCount);
  const canAfford = cost.every(({ resId, amnt }) => resources[resId] >= amnt);
  const disabled = isDialogueActive || !canAfford;

  return (
    <button className="action-btn upgrade-btn" onClick={() => purchaseUpgrade(upgradeId)} disabled={disabled}>
      <span className="upgrade-top-row">
        <span className="upgrade-label">{upgrade.label}</span>
        <span className="upgrade-level">Lv. {currentCount}/{upgrade.maxPurchases}</span>
      </span>
      <CostChips costs={cost} />
    </button>
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
  const flags = useGameStore((s) => s.flags);
  const gatherables = getGatherables(flags);
  const unlockedWorkers = NPCS.filter(
    (npc) => npc.role === "worker" && unlockedNpcs.some((u) => u.id === npc.id),
  );

  return (
    <div className="actions">
      <h2>Actions</h2>

      <section>
        <h3>Gather</h3>
        <div className="btn-grid">
          {gatherables.map((r) => (
            <GatherButton key={r.id} resourceId={r.id} />
          ))}
        </div>
      </section>

      <section>
        <h3>Craft</h3>
        <div className="btn-grid">
          {Object.values(RECIPES).map((recipe) => (
            <CraftButton key={recipe.id} recipe={recipe} />
          ))}
        </div>
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
        <div className="btn-grid">
          {Object.values(UPGRADES).map((upgrade) => (
            <UpgradeButton key={upgrade.id} upgradeId={upgrade.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
