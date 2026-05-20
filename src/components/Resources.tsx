import "./Resources.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";

export default function Resources() {
  const resources = useGameStore((s) => s.resources);

  return (
    <div className="resources">
      <h2>Resources</h2>
      {Object.values(RESOURCES).map((def) => (
        <p key={def.id}>
          {def.label}:{" "}
          {def.displayAsInt
            ? Math.floor(resources[def.id])
            : resources[def.id].toFixed(1)}{" "}
          / {def.cap}
        </p>
      ))}
    </div>
  );
}
