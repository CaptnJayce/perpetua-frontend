import "./Dialogue.css";
import { NPCS, PORTRAIT_PLACEHOLDER } from "../data/npcs";

export default function Dialogue() {
  return (
    <div className="dialogue">
      <div className="dialogue-content" />
      <div className="npc-portraits">
        {NPCS.map((npc) => (
          <button key={npc.id} className="npc-portrait" title={npc.name}>
            <img
              src={npc.portrait ?? PORTRAIT_PLACEHOLDER}
              style={{ filter: npc.unlocked ? "none" : "grayscale(100%)" }}
              alt={npc.name}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
