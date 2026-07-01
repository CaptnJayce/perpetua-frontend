import "./Resources.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import type { ResourceDef } from "../data/resources";
import { getEffectiveCap } from "../data/upgrades";

interface ResourceRowProps {
  def: ResourceDef;
  resources: Record<string, number>;
  purchasedUpgrades: Record<string, number>;
}

function ResourceRow({ def, resources, purchasedUpgrades }: ResourceRowProps) {
  const effectiveCap = getEffectiveCap(def.id, def.cap, purchasedUpgrades);
  return (
    <div key={def.id} className="resource-info">
      <img src={def.icon} className="icon" />
      <div className="resource-text">
        <div className="resource-name">{def.label}</div>
        <div className="resource-amount">
          {def.displayAsInt
            ? Math.floor(resources[def.id])
            : resources[def.id].toFixed(1)}{" "}
          / {effectiveCap}
        </div>
      </div>
    </div>
  );
}

export default function Resources() {
  const resources = useGameStore((s) => s.resources);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);

  const allResources = Object.values(RESOURCES);

  const baseResources = allResources.filter((def) => def.category === "base");
  const craftedResources = allResources.filter((def) => def.category === "crafted");
  const workers = allResources.filter((def) => def.category === "worker");
  const milestoneResources = allResources.filter((def) => def.category === "milestone");
  const questResources = allResources.filter((def) => def.category === "quest");

  return (
    <div className="resources">
      <h2>Resources</h2>
      {baseResources.map((def) => (
        <ResourceRow
          key={def.id}
          def={def}
          resources={resources}
          purchasedUpgrades={purchasedUpgrades}
        />
      ))}

      {craftedResources.length > 0 && (
        <>
          <h3>Crafted</h3>
          {craftedResources.map((def) => (
            <ResourceRow
              key={def.id}
              def={def}
              resources={resources}
              purchasedUpgrades={purchasedUpgrades}
            />
          ))}
        </>
      )}

      {workers.length > 0 && (
        <>
          <h3>Workers</h3>
          {workers.map((def) => (
            <p key={def.id} className="resource-info">
              <img src={def.icon} className="icon" /> {def.label}:{" "}
              {Math.floor(resources[def.id])} / {def.cap}
            </p>
          ))}
        </>
      )}

      {questResources.length > 0 && (
        <>
          <h3>Quest Items</h3>
          {questResources.map((def) => (
            <p key={def.id} className="resource-info">
              <img src={def.icon} className="icon" /> {def.label}:{" "}
              {Math.floor(resources[def.id])} / {def.cap}
            </p>
          ))}
        </>
      )}

      {milestoneResources.length > 0 && (
        <>
          <h3 className="milestone-heading">Milestones</h3>
          {milestoneResources.map((def) => (
            <p key={def.id} className="milestone-resource">
              <img src={def.icon} className="icon" /> {def.label}:{" "}
              {Math.floor(resources[def.id])} / {def.cap}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
