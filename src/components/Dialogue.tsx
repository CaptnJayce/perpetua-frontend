import "./Dialogue.css";
import { NPCS, PORTRAIT_PLACEHOLDER } from "../data/npcs";
import { useGameStore } from "../store";

export default function Dialogue() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);

  return (
    <div className="dialogue">
      <div className="dialogue-content" />
      <div className="npc-portraits">
        {NPCS.map((npc) => (
          <button key={npc.id} className="npc-portrait" title={npc.name}>
            <img
              src={npc.portrait ?? PORTRAIT_PLACEHOLDER}
              style={{
                filter: unlockedNpcs.includes(npc.id)
                  ? "none"
                  : "grayscale(100%)",
              }}
              alt={npc.name}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
