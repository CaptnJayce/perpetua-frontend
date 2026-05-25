import "./Dialogue.css";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import Modal from "./Modal";
import { useEffect, useRef, useState } from "react";
import type { UnlockEvent } from "../systems/unlocker";

export default function Dialogue() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<UnlockEvent | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const prevCount = useRef(0);
  const currentCount = unlockedNpcs.length;

  useEffect(() => {
    if (currentCount > prevCount.current) {
      setSelectedNpc(unlockedNpcs[unlockedNpcs.length - 1]);
      setModalOpen(true);
    }
    prevCount.current = currentCount;
  });

  return (
    <div className="dialogue">
      <div className="dialogue-content">
        <h2>{selectedNpc?.name}</h2>
      </div>
      <div className="npc-portraits">
        {NPCS.map((npc) => {
          const isUnlocked = unlockedNpcs.some((u) => u.id === npc.id);
          const isSelected = selectedNpc?.id === npc.id;
          const isShaking = shakingId === npc.id;

          return (
            <button
              key={npc.id}
              className={`npc-portrait ${isSelected ? "npc-portrait--selected" : ""} ${isShaking ? "npc-portrait--shake" : ""}`}
              title={npc.name}
              onClick={() => {
                if (isUnlocked) {
                  setSelectedNpc(npc);
                } else {
                  setShakingId(npc.id);
                  setTimeout(() => setShakingId(null), 400);
                }
              }}
            >
              <img
                src={npc.portrait}
                style={{ filter: isUnlocked ? "none" : "grayscale(100%)" }}
                alt={npc.name}
              />
            </button>
          );
        })}

        {unlockedNpcs.length > 0 && (
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={selectedNpc?.name}
          >
            <p>{selectedNpc?.description}</p>
          </Modal>
        )}
      </div>
    </div>
  );
}
