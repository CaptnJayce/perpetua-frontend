import "./Dialogue.css";
import { NPCS, PORTRAIT_PLACEHOLDER } from "../data/npcs";
import { useGameStore } from "../store";
import Modal from "./Modal";
import { useEffect, useRef, useState } from "react";

export default function Dialogue() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const [modalOpen, setModalOpen] = useState(false);
  const prevCount = useRef(0);
  const currentCount = unlockedNpcs.length;

  useEffect(() => {
    if (currentCount > prevCount.current) {
      setModalOpen(true);
    }
    prevCount.current = currentCount;
  });

  return (
    <div className="dialogue">
      <div className="dialogue-content" />
      <div className="npc-portraits">
        {NPCS.map((npc) => (
          <button key={npc.id} className="npc-portrait" title={npc.name}>
            <img
              src={npc.portrait ?? PORTRAIT_PLACEHOLDER}
              style={{
                filter: unlockedNpcs.some((u) => u.id === npc.id)
                  ? "none"
                  : "grayscale(100%)",
              }}
              alt={npc.name}
            />
          </button>
        ))}

        {unlockedNpcs.length > 0 && (
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={unlockedNpcs[unlockedNpcs.length - 1].name}
          >
            <p>{unlockedNpcs[unlockedNpcs.length - 1].description}</p>
          </Modal>
        )}
      </div>
    </div>
  );
}
