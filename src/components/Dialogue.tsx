import "./Dialogue.css";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import { useEffect, useState } from "react";
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

  // Starts (or resumes) a live conversation at nodeId. History for the
  // conversation is read from the store as it's added via addDialogueHistory
  // — this just tracks where that session's slice of history begins.
  function startDialogueSession(npcId: string, nodeId: string) {
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

  // Newly unlocked NPCs can arrive from any game system (tick, gather, craft,
  // flags), not just from an action taken in this component, so this syncs
  // with the store directly via subscribe rather than diffing props in an
  // effect body.
  useEffect(() => {
    return useGameStore.subscribe((state, prevState) => {
      if (state.unlockedNpcs.length <= prevState.unlockedNpcs.length) return;

      const newNpc = state.unlockedNpcs[state.unlockedNpcs.length - 1];
      const nextNode = getNextAvailableNode(newNpc.id, state.flags, []);
      if (nextNode) {
        setDialogueActive(true);
        setNpcDialogueStates((prev) => ({
          ...prev,
          [newNpc.id]: {
            currentNodeId: nextNode,
            completed: false,
            historyStartIndex:
              state.npcDialogueProgress[newNpc.id]?.history.length ?? 0,
          },
        }));
      }
      setSelectedNpc(newNpc);
      setDialogueIndex(0);
    });
  }, [setDialogueActive]);

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

    if (completed) {
      // addDialogueHistory already committed synchronously, so the store
      // reflects the new entry — read it fresh instead of waiting a render.
      const startIndex = dialogueState?.historyStartIndex ?? 0;
      const sessionHistory =
        useGameStore.getState().npcDialogueProgress[selectedNpc.id]
          ?.history ?? [];
      const firstHistoryEntry = sessionHistory[startIndex];
      if (firstHistoryEntry) {
        completeDialogueNode(selectedNpc.id, firstHistoryEntry.nodeId);
      }
      setSelectedNpc(null);
      setDialogueActive(false);
    }
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
    setDialogueIndex(0);
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
                    setDialogueIndex(0);
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
