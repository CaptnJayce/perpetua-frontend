import "./Resources.css";
import { useState } from "react";
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

function CollapsibleSection({
  title,
  className,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  className?: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <h3 className={`resource-section-header ${className ?? ""}`} onClick={onToggle}>
        <span
          className={`resource-section-chevron ${collapsed ? "" : "resource-section-chevron--open"}`}
        >
          ▸
        </span>
        {title}
      </h3>
      {!collapsed && children}
    </>
  );
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
  const departmentResources = visibleResources.filter(
    (def) => def.category === "crafted" || def.category === "assembly",
  );
  const foundryResources = departmentResources.filter(
    (def) => getDepartmentIdForResource(def.id) === "foundry",
  );
  const assemblyFloorResources = departmentResources.filter(
    (def) => getDepartmentIdForResource(def.id) === "assembly-floor",
  );
  const boilerRoomResources = departmentResources.filter(
    (def) => getDepartmentIdForResource(def.id) === "boiler-room",
  );
  const milestoneResources = visibleResources.filter((def) => def.category === "milestone");
  const questResources = visibleResources.filter((def) => def.category === "quest");

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="resources">
      {baseResources.length > 0 && (
        <CollapsibleSection
          title="Basics"
          collapsed={!!collapsedSections.basics}
          onToggle={() => toggleSection("basics")}
        >
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
        </CollapsibleSection>
      )}

      {passiveResources.length > 0 && (
        <CollapsibleSection
          title="Passive"
          collapsed={!!collapsedSections.passive}
          onToggle={() => toggleSection("passive")}
        >
          {passiveResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </CollapsibleSection>
      )}

      {foundryResources.length > 0 && (
        <CollapsibleSection
          title="Foundry"
          collapsed={!!collapsedSections.foundry}
          onToggle={() => toggleSection("foundry")}
        >
          {foundryResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </CollapsibleSection>
      )}

      {assemblyFloorResources.length > 0 && (
        <CollapsibleSection
          title="Assembly Floor"
          collapsed={!!collapsedSections["assembly-floor"]}
          onToggle={() => toggleSection("assembly-floor")}
        >
          {assemblyFloorResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </CollapsibleSection>
      )}

      {boilerRoomResources.length > 0 && (
        <CollapsibleSection
          title="Boiler Room"
          collapsed={!!collapsedSections["boiler-room"]}
          onToggle={() => toggleSection("boiler-room")}
        >
          {boilerRoomResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </CollapsibleSection>
      )}

      {questResources.length > 0 && (
        <CollapsibleSection
          title="Quest Items"
          collapsed={!!collapsedSections.quest}
          onToggle={() => toggleSection("quest")}
        >
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
        </CollapsibleSection>
      )}

      {milestoneResources.length > 0 && (
        <CollapsibleSection
          title="Milestones"
          className="milestone-heading"
          collapsed={!!collapsedSections.milestones}
          onToggle={() => toggleSection("milestones")}
        >
          {milestoneResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </CollapsibleSection>
      )}
    </div>
  );
}
