import "./Dialogue.css";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import { useEffect, useRef, useState } from "react";
import type { UnlockEvent } from "../systems/unlocker";
import {
  getCurrentDialogue,
  getNextAvailableNode,
  type DialogueHistoryEntry,
} from "../data/dialogue";

interface NpcDialogueState {
  currentNodeId: string;
  completed: boolean;
  history: DialogueHistoryEntry[];
}

export default function Dialogue() {
  const unlockedNpcs = useGameStore((s) => s.unlockedNpcs);
  const flags = useGameStore((s) => s.flags);
  const npcDialogueProgress = useGameStore((s) => s.npcDialogueProgress);
  const setFlag = useGameStore((s) => s.setFlag);
  const completeDialogueNode = useGameStore((s) => s.completeDialogueNode);
  const addDialogueHistory = useGameStore((s) => s.addDialogueHistory);
  const setDialogueActive = useGameStore((s) => s.setDialogueActive);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const [selectedNpc, setSelectedNpc] = useState<UnlockEvent | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [npcDialogueStates, setNpcDialogueStates] = useState<
    Record<string, NpcDialogueState>
  >({});
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [shouldAutoClose, setShouldAutoClose] = useState(false);
  const prevCount = useRef(0);
  const currentCount = unlockedNpcs.length;

  useEffect(() => {
    if (currentCount > prevCount.current) {
      setShouldAutoClose(false);
      const newNpc = unlockedNpcs[unlockedNpcs.length - 1];
      const nextNode = getNextAvailableNode(newNpc.id, flags, []);
      if (nextNode) {
        setDialogueActive(true);
        setNpcDialogueStates((prev) => ({
          ...prev,
          [newNpc.id]: {
            currentNodeId: nextNode,
            completed: false,
            history: [],
          },
        }));
      }
      setSelectedNpc(newNpc);
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

  // Auto-close when dialogue is completed via option click
  useEffect(() => {
    if (shouldAutoClose && isComplete && selectedNpc) {
      const firstHistoryEntry = history[0];
      if (firstHistoryEntry) {
        completeDialogueNode(selectedNpc.id, firstHistoryEntry.nodeId);
      }
      const timer = setTimeout(() => {
        setSelectedNpc(null);
        setShouldAutoClose(false);
        setDialogueActive(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoClose, isComplete, selectedNpc, history, completeDialogueNode]);

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
    if (completed) {
      setShouldAutoClose(true);
    }

    const historyEntry = {
      nodeId: currentNode.id,
      npcText: currentNode.text,
      playerResponse: option.text,
    };

    addDialogueHistory(selectedNpc.id, historyEntry);

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
          history: [...prevState.history, historyEntry],
        },
      };
    });
  }

  function hasNewDialogue(npcId: string): boolean {
    const progress = npcDialogueProgress[npcId];
    const completedNodeIds = progress?.completedNodeIds ?? [];
    return getNextAvailableNode(npcId, flags, completedNodeIds) !== null;
  }

  function handlePortraitClick(npc: UnlockEvent, isUnlocked: boolean) {
    if (!isUnlocked) {
      setShakingId(npc.id);
      setTimeout(() => setShakingId(null), 400);
      return;
    }

    const progress = npcDialogueProgress[npc.id];
    const completedNodeIds = progress?.completedNodeIds ?? [];
    const nextNode = getNextAvailableNode(npc.id, flags, completedNodeIds);

    if (nextNode) {
      // New dialogue available — start it
      setShouldAutoClose(false);
      setDialogueActive(true);
      setNpcDialogueStates((prev) => ({
        ...prev,
        [npc.id]: {
          currentNodeId: nextNode,
          completed: false,
          history: [],
        },
      }));
      setSelectedNpc(npc);
    } else {
      // No new dialogue — show history replay
      setShouldAutoClose(false);
      setDialogueActive(false);
      const storeHistory = progress?.history ?? [];
      setNpcDialogueStates((prev) => {
        const prevState = prev[npc.id];
        return {
          ...prev,
          [npc.id]: {
            currentNodeId: prevState?.currentNodeId ?? "end",
            completed: true,
            history: storeHistory,
          },
        };
      });
      setSelectedNpc(npc);
    }
  }

  return (
    <div className="dialogue">
      <div className="dialogue-content">
        {fullNpc && (
          <>
            <div className="dialogue-left">
              <div className="dialogue-top">
                <button
                  className="close-dialogue"
                  onClick={() => {
                    setSelectedNpc(null);
                    setDialogueActive(false);
                  }}
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
                      {currentNode?.requireFlag &&
                        !flags.includes(currentNode.requireFlag)
                        ? fullNpc.description
                        : currentNode?.text ?? fullNpc.description}
                    </p>
                  )}
                </div>
              </div>

              {!isComplete && currentNode?.options && (
                <div className="dialogue-options">
                  {currentNode.options
                    .filter(
                      (option) =>
                        !option.requireFlag || flags.includes(option.requireFlag),
                    )
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
          const hasNew = isUnlocked && hasNewDialogue(npc.id);

          return (
            <button
              key={npc.id}
              className={`npc-portrait ${isSelected ? "npc-portrait--selected" : ""} ${isShaking ? "npc-portrait--shake" : ""} ${hasNew ? "npc-portrait--new" : ""}`}
              title={npc.name}
              disabled={isDialogueActive && !isSelected}
              onClick={() => handlePortraitClick(npc, isUnlocked)}
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
    </div >
  );
}
