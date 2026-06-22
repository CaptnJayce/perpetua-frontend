import "./Actions.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import { UPGRADES, getEffectiveCap, getEffectiveCraftCost } from "../data/upgrades";
import type { RecipeDef } from "../data/recipes";

const gatherables = Object.values(RESOURCES).filter((r) => r.gatherAmt !== undefined);

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

  return (
    <button className="action-btn" onClick={() => gather(resourceId)} disabled={disabled}>
      {def.label} +{def.gatherAmt}
      {cd > 0 && <span className="cooldown"> ({cd.toFixed(1)}s)</span>}
      {atCap && <span className="at-cap"> (full)</span>}
    </button>
  );
}

function CraftButton({ recipe }: { recipe: RecipeDef }) {
  const resources = useGameStore((s) => s.resources);
  const craft = useGameStore((s) => s.craft);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);

  const outputDef = RESOURCES[recipe.output.resId];
  const effectiveCap = getEffectiveCap(recipe.output.resId, outputDef.cap, purchasedUpgrades);

  const effectiveInputs = recipe.inputs.map(({ resId, amnt }) => ({
    resId,
    amnt: getEffectiveCraftCost(amnt, purchasedUpgrades),
  }));

  const canAfford = effectiveInputs.every(
    ({ resId, amnt }) => resources[resId] >= amnt,
  );
  const atCap = resources[recipe.output.resId] + recipe.output.amnt > effectiveCap;
  const disabled = isDialogueActive || !canAfford || atCap;

  const costLabel = effectiveInputs
    .map(({ resId, amnt }) => `${amnt} ${RESOURCES[resId].label}`)
    .join(", ");

  return (
    <button className="action-btn" onClick={() => craft(recipe.id)} disabled={disabled}>
      {outputDef.label} x{recipe.output.amnt}
      <span className="cost"> — {costLabel}</span>
    </button>
  );
}

function UpgradeButton({ upgradeId }: { upgradeId: string }) {
  const upgrade = UPGRADES[upgradeId];
  const resources = useGameStore((s) => s.resources);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);

  const currentCount = purchasedUpgrades[upgradeId] || 0;
  const maxed = currentCount >= upgrade.maxPurchases;
  const cost = upgrade.cost(currentCount);
  const canAfford = cost.every(({ resId, amnt }) => resources[resId] >= amnt);
  const disabled = isDialogueActive || maxed || !canAfford;

  const costLabel = cost
    .map(({ resId, amnt }) => `${amnt} ${RESOURCES[resId].label}`)
    .join(", ");

  return (
    <button className="action-btn upgrade-btn" onClick={() => purchaseUpgrade(upgradeId)} disabled={disabled}>
      <span className="upgrade-label">{upgrade.label}</span>
      <span className="upgrade-level">Lv. {currentCount}/{upgrade.maxPurchases}</span>
      <span className="cost"> — {costLabel}</span>
    </button>
  );
}

export default function Actions() {
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
