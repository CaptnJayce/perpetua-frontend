import "./ActionButtons.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { UPGRADES, getEffectiveCap, getEffectiveCraftCost } from "../data/upgrades";
import { ResourceIcon } from "./Resources";
import type { RecipeDef } from "../data/recipes";

export function CostChips({ costs }: { costs: { resId: string; amnt: number }[] }) {
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

export function GatherButton({ resourceId }: { resourceId: string }) {
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
        Gather + {def.gatherAmt}
      </span>
    </button>
  );
}

export function CraftButton({ recipe }: { recipe: RecipeDef }) {
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
        <span>Craft</span>
        <CostChips costs={effectiveInputs} />
      </span>
    </button>
  );
}

export function UpgradeButton({ upgradeId }: { upgradeId: string }) {
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
