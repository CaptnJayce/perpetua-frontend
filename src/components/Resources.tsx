import "./Resources.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { getEffectiveCap } from "../data/upgrades";

export default function Resources() {
  const resources = useGameStore((s) => s.resources);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);

  const regularResources = Object.values(RESOURCES).filter(
    (def) => def.category !== "milestone",
  );
  const milestoneResources = Object.values(RESOURCES).filter(
    (def) => def.category === "milestone",
  );

  return (
    <div className="resources">
      <h2>Resources</h2>
      {regularResources.map((def) => {
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
      })}

      {milestoneResources.length > 0 && (
        <>
          <h3 className="milestone-heading">Milestones</h3>
          {milestoneResources.map((def) => (
            <p key={def.id} className="milestone-resource">
              <img src={def.icon} className="icon" /> {def.label}: {Math.floor(resources[def.id])} / {def.cap}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
