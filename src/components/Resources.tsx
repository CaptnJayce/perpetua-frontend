import "./Resources.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";

export default function Resources() {
    const resources = useGameStore((s) => s.resources);

    const regularResources = Object.values(RESOURCES).filter(
        (def) => def.category !== "milestone",
    );
    const milestoneResources = Object.values(RESOURCES).filter(
        (def) => def.category === "milestone",
    );

    return (
        <div className="resources">
            <h2>Resources</h2>
            {regularResources.map((def) => (
                <p key={def.id}>
                    {def.label}:{" "}
                    {def.displayAsInt
                        ? Math.floor(resources[def.id])
                        : resources[def.id].toFixed(1)}{" "}
                    / {def.cap}
                </p>
            ))}

            {milestoneResources.length > 0 && (
                <>
                    <h3 className="milestone-heading">Milestones</h3>
                    {milestoneResources.map((def) => (
                        <p key={def.id} className="milestone-resource">
                            {def.label}: {Math.floor(resources[def.id])} / {def.cap}
                        </p>
                    ))}
                </>
            )}
        </div>
    );
}
