import "./Dialogue.css";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import { useEffect, useRef, useState } from "react";
import type { UnlockEvent } from "../systems/unlocker";
import { getCurrentDialogue, getNextAvailableNode } from "../data/dialogue";

interface NpcDialogueState {
  currentNodeId: string;
  completed: boolean;
  // Index into the store's lifetime history for this NPC marking where the
  // current view should start reading from — 0 for a full replay, or the
  // history length at session-start so only the live session's exchanges show.
  historyStartIndex: number;
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

  // Starts (or resumes) a live conversation at nodeId. History for the
  // conversation is read from the store as it's added via addDialogueHistory
  // — this just tracks where that session's slice of history begins.
  function startDialogueSession(npcId: string, nodeId: string) {
    setShouldAutoClose(false);
    setDialogueActive(true);
    setNpcDialogueStates((prev) => ({
      ...prev,
      [npcId]: {
        currentNodeId: nodeId,
        completed: false,
        historyStartIndex: npcDialogueProgress[npcId]?.history.length ?? 0,
      },
    }));
  }

  useEffect(() => {
    if (currentCount > prevCount.current) {
      const newNpc = unlockedNpcs[unlockedNpcs.length - 1];
      const nextNode = getNextAvailableNode(newNpc.id, flags, []);
      if (nextNode) {
        startDialogueSession(newNpc.id, nextNode);
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
  const fullHistory = selectedNpc
    ? npcDialogueProgress[selectedNpc.id]?.history ?? []
    : [];
  const history = dialogueState
    ? fullHistory.slice(dialogueState.historyStartIndex)
    : [];

  // Auto-close when dialogue is completed via option click
  useEffect(() => {
    if (shouldAutoClose && isComplete && selectedNpc) {
      const firstHistoryEntry = history[0];
      if (firstHistoryEntry) {
        completeDialogueNode(selectedNpc.id, firstHistoryEntry.nodeId);
      }
      setSelectedNpc(null);
      setShouldAutoClose(false);
      setDialogueActive(false);
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

    addDialogueHistory(selectedNpc.id, {
      nodeId: currentNode.id,
      npcText: currentNode.text,
      playerResponse: option.text,
    });

    setNpcDialogueStates((prev) => {
      const prevState = prev[selectedNpc.id] ?? {
        currentNodeId: "intro",
        completed: false,
        historyStartIndex: 0,
      };

      return {
        ...prev,
        [selectedNpc.id]: {
          ...prevState,
          currentNodeId: nextNodeId || "end",
          completed,
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
      startDialogueSession(npc.id, nextNode);
    } else {
      // No new dialogue — show the full history replay
      setShouldAutoClose(false);
      setDialogueActive(false);
      setNpcDialogueStates((prev) => ({
        ...prev,
        [npc.id]: {
          currentNodeId: prev[npc.id]?.currentNodeId ?? "end",
          completed: true,
          historyStartIndex: 0,
        },
      }));
    }
    setSelectedNpc(npc);
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
    </div>
  );
}
