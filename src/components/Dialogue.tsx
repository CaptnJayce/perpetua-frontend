import "./Dialogue.css";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import { useEffect, useRef, useState } from "react";
import type { UnlockEvent } from "../systems/unlocker";
import { getCurrentDialogue, type DialogueHistoryEntry } from "../data/dialogue";

interface NpcDialogueState {
  currentNodeId: string;
  completed: boolean;
  history: DialogueHistoryEntry[];
}

export default function Dialogue() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const flags = useGameStore((s) => s.flags);
  const setFlag = useGameStore((s) => s.setFlag);
  const [selectedNpc, setSelectedNpc] = useState<UnlockEvent | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [npcDialogueStates, setNpcDialogueStates] = useState<
    Record<string, NpcDialogueState>
  >({});
  const [shakingId, setShakingId] = useState<string | null>(null);
  const prevCount = useRef(0);
  const currentCount = unlockedNpcs.length;

  useEffect(() => {
    if (currentCount > prevCount.current) {
      setSelectedNpc(unlockedNpcs[unlockedNpcs.length - 1]);
    }
    prevCount.current = currentCount;
  });

  useEffect(() => {
    setDialogueIndex(0);
  }, [selectedNpc?.id]);

  const fullNpc = selectedNpc
    ? NPCS.find((n) => n.id === selectedNpc.id)
    : null;

  const dialogueState = selectedNpc
    ? npcDialogueStates[selectedNpc.id]
    : null;

  const currentNodeId = dialogueState?.currentNodeId ?? "intro";
  const currentNode = selectedNpc
    ? getCurrentDialogue(selectedNpc.id, currentNodeId)
    : null;

  const isComplete = dialogueState?.completed ?? false;
  const history = dialogueState?.history ?? [];

  function handleOptionClick(option: {
    text: string;
    nextNodeId?: string;
    affinityDelta?: number;
    setFlag?: string;
  }) {
    if (!selectedNpc || !currentNode) return;

    if (option.setFlag) {
      setFlag(option.setFlag);
    }

    const nextNodeId = option.nextNodeId;
    const completed = !nextNodeId || nextNodeId === "end";

    setNpcDialogueStates((prev) => {
      const prevState = prev[selectedNpc.id] || {
        currentNodeId: "intro",
        completed: false,
        history: [],
      };

      return {
        ...prev,
        [selectedNpc.id]: {
          currentNodeId: nextNodeId || "end",
          completed,
          history: [
            ...prevState.history,
            {
              nodeId: currentNode.id,
              npcText: currentNode.text,
              playerResponse: option.text,
            },
          ],
        },
      };
    });
  }

  return (
    <div className="dialogue">
      <div className="dialogue-content">
        {fullNpc && (
          <>
            <div className="dialogue-left">
              <button
                className="close-dialogue"
                onClick={() => setSelectedNpc(null)}
              >
                Close Dialogue
              </button>

              <h2 className="npc-name">{fullNpc.name}</h2>

              <div className="dialogue-bubble">
                {isComplete && history.length > 0 ? (
                  <div className="dialogue-history">
                    <p className="history-npc-text">
                      {history[dialogueIndex]?.npcText}
                    </p>
                    <p className="history-player-response">
                      You: {history[dialogueIndex]?.playerResponse}
                    </p>
                  </div>
                ) : (
                  <p>
                    {currentNode?.requireFlag && !flags.includes(currentNode.requireFlag)
                      ? fullNpc.description
                      : currentNode?.text ?? fullNpc.description}
                  </p>
                )}
              </div>

              {!isComplete && currentNode?.options && (
                <div className="dialogue-options">
                  {currentNode.options
                    .filter((option) => !option.requireFlag || flags.includes(option.requireFlag))
                    .map((option, i) => (
                      <button
                        key={i}
                        className="dialogue-option"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option.text}
                      </button>
                    ))}
                </div>
              )}

              {isComplete && history.length > 0 && (
                <div className="dialogue-nav">
                  <button
                    className="dialogue-arrow"
                    onClick={() =>
                      setDialogueIndex(Math.max(0, dialogueIndex - 1))
                    }
                  >
                    &#8592;
                  </button>
                  <button
                    className="dialogue-arrow"
                    onClick={() =>
                      setDialogueIndex(
                        Math.min(history.length - 1, dialogueIndex + 1),
                      )
                    }
                  >
                    &#8594;
                  </button>
                </div>
              )}
            </div>
            <div className="dialogue-right">
              <img
                className="body-shot"
                src={fullNpc.bodyShot}
                alt={fullNpc.name}
              />
            </div>
          </>
        )}
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
                style={{
                  filter: isUnlocked ? "none" : "grayscale(100%)",
                }}
                alt={npc.name}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
