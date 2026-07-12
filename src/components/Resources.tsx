import "./Resources.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import type { ResourceDef } from "../data/resources";
import { RECIPES } from "../data/recipes";
import type { RecipeDef } from "../data/recipes";
import { getEffectiveCap } from "../data/upgrades";
import { getDepartmentForRecipe } from "../data/departments";
import { GatherButton, CraftButton } from "./ActionButtons";

interface ResourceRowProps {
  def: ResourceDef;
  resources: Record<string, number>;
  purchasedUpgrades: Record<string, number>;
}

const RESOURCE_ICON_SIZE = 48;

export function ResourceIcon({ icon, size = 64 }: { icon?: string; size?: number }) {
  if (!icon) {
    return (
      <div
        className="icon icon-placeholder"
        style={{ width: size, height: size, fontSize: size >= 32 ? 11 : 8 }}
      >
        {size >= 32 && <span>icon</span>}
      </div>
    );
  }
  return <img src={icon} className="icon" style={{ width: size, height: size }} />;
}

function getRecipesFor(resId: string): RecipeDef[] {
  return Object.values(RECIPES).filter((r) => r.output.resId === resId);
}

function getDepartmentIdForResource(resId: string): string | undefined {
  const recipe = getRecipesFor(resId)[0];
  return recipe ? getDepartmentForRecipe(recipe.id)?.id : undefined;
}

function ResourceRow({ def, resources, purchasedUpgrades }: ResourceRowProps) {
  const effectiveCap = getEffectiveCap(def.id, def.cap, purchasedUpgrades);
  const recipes = getRecipesFor(def.id);
  const hasActions = def.gatherAmt !== undefined || recipes.length > 0;
  const questionModeActive = useGameStore((s) => s.questionModeActive);
  const showLorePopup = useGameStore((s) => s.showLorePopup);

  return (
    <div key={def.id} className="resource-info">
      <span
        onClick={
          questionModeActive ? (e) => showLorePopup(def.id, e.clientX, e.clientY) : undefined
        }
      >
        <ResourceIcon icon={def.icon} size={RESOURCE_ICON_SIZE} />
      </span>
      <div className="resource-text">
        <div className="resource-name">{def.label}</div>
        <div className="resource-amount">
          {def.displayAsInt
            ? Math.floor(resources[def.id])
            : resources[def.id].toFixed(1)}{" "}
          / {effectiveCap}
        </div>
      </div>
      {hasActions && (
        <div className="resource-actions">
          {def.gatherAmt !== undefined && <GatherButton resourceId={def.id} />}
          {recipes.map((recipe) => (
            <CraftButton key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Resources() {
  const resources = useGameStore((s) => s.resources);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const flags = useGameStore((s) => s.flags);
  const questionModeActive = useGameStore((s) => s.questionModeActive);
  const showLorePopup = useGameStore((s) => s.showLorePopup);

  const visibleResources = Object.values(RESOURCES).filter(
    (def) => !def.requireFlag || flags.includes(def.requireFlag),
  );

  const baseResources = visibleResources.filter((def) => def.category === "base");
  const primaryBaseResources = baseResources.filter((def) => !def.requireFlag);
  const gatedBaseResources = baseResources.filter((def) => def.requireFlag);
  const passiveResources = visibleResources.filter(
    (def) => def.category === "passive" || def.category === "worker",
  );
  const craftedResources = visibleResources.filter((def) => def.category === "crafted");
  const foundryResources = craftedResources.filter(
    (def) => getDepartmentIdForResource(def.id) === "foundry",
  );
  const assemblyFloorResources = craftedResources.filter(
    (def) => getDepartmentIdForResource(def.id) === "assembly-floor",
  );
  const boilerRoomResources = visibleResources.filter((def) => def.category === "assembly");
  const milestoneResources = visibleResources.filter((def) => def.category === "milestone");
  const questResources = visibleResources.filter((def) => def.category === "quest");

  return (
    <div className="resources">
      {primaryBaseResources.map((def) => (
        <ResourceRow
          key={def.id}
          def={def}
          resources={resources}
          purchasedUpgrades={purchasedUpgrades}
        />
      ))}

      {gatedBaseResources.map((def) => (
        <ResourceRow
          key={def.id}
          def={def}
          resources={resources}
          purchasedUpgrades={purchasedUpgrades}
        />
      ))}

      {passiveResources.length > 0 && (
        <>
          <h3>Passive</h3>
          {passiveResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </>
      )}

      {foundryResources.length > 0 && (
        <>
          <h3>Foundry</h3>
          {foundryResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </>
      )}

      {assemblyFloorResources.length > 0 && (
        <>
          <h3>Assembly Floor</h3>
          {assemblyFloorResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </>
      )}

      {boilerRoomResources.length > 0 && (
        <>
          <h3>Boiler Room</h3>
          {boilerRoomResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </>
      )}

      {questResources.length > 0 && (
        <>
          <h3>Quest Items</h3>
          {questResources.map((def) => (
            <p key={def.id} className="resource-info">
              <span
                onClick={
                  questionModeActive
                    ? (e) => showLorePopup(def.id, e.clientX, e.clientY)
                    : undefined
                }
              >
                <ResourceIcon icon={def.icon} size={RESOURCE_ICON_SIZE} />
              </span>{" "}
              {def.label}: {Math.floor(resources[def.id])} / {def.cap}
            </p>
          ))}
        </>
      )}

      {milestoneResources.length > 0 && (
        <>
          <h3 className="milestone-heading">Milestones</h3>
          {milestoneResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </>
      )}
    </div>
  );
}
