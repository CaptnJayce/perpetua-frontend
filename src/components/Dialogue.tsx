import "./Dialogue.css";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import { getCurrentDialogue } from "../data/dialogue";

export default function Dialogue() {
  const selectedNpcId = useGameStore((s) => s.selectedNpcId);
  const npcDialogueStates = useGameStore((s) => s.npcDialogueStates);
  const npcDialogueProgress = useGameStore((s) => s.npcDialogueProgress);
  const flags = useGameStore((s) => s.flags);
  const dialogueHistoryIndex = useGameStore((s) => s.dialogueHistoryIndex);
  const setDialogueHistoryIndex = useGameStore((s) => s.setDialogueHistoryIndex);
  const submitDialogueOption = useGameStore((s) => s.submitDialogueOption);
  const closeDialogueView = useGameStore((s) => s.closeDialogueView);

  const fullNpc = selectedNpcId ? NPCS.find((n) => n.id === selectedNpcId) : null;

  const dialogueState = selectedNpcId ? npcDialogueStates[selectedNpcId] : null;
  const currentNodeId = dialogueState?.currentNodeId ?? "intro";
  const currentNode = selectedNpcId
    ? getCurrentDialogue(selectedNpcId, currentNodeId)
    : null;

  const isComplete = dialogueState?.completed ?? false;
  const fullHistory = selectedNpcId
    ? npcDialogueProgress[selectedNpcId]?.history ?? []
    : [];
  const history = dialogueState
    ? fullHistory.slice(dialogueState.historyStartIndex)
    : [];

  if (!fullNpc) {
    return (
      <div className="dialogue">
        <div className="dialogue-placeholder">Pick someone to talk to.</div>
      </div>
    );
  }

  return (
    <div className="dialogue">
      <div className="dialogue-content">
        <div className="dialogue-left">
          <div className="dialogue-top">
            <button className="close-dialogue" onClick={closeDialogueView}>
              Close Dialogue
            </button>

            <h2 className="npc-name">{fullNpc.name}</h2>
            <div className="dialogue-bubble">
              {isComplete && history.length > 0 ? (
                <div className="dialogue-history">
                  <p className="history-npc-text">
                    {history[dialogueHistoryIndex]?.npcText}
                  </p>
                  <p className="history-player-response">
                    You: {history[dialogueHistoryIndex]?.playerResponse}
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
                .filter((option) => !option.requireFlag || flags.includes(option.requireFlag))
                .map((option, i) => (
                  <button
                    key={i}
                    className="dialogue-option"
                    onClick={() => submitDialogueOption(option)}
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
                  setDialogueHistoryIndex(Math.max(0, dialogueHistoryIndex - 1))
                }
              >
                &#8592;
              </button>
              <button
                className="dialogue-arrow"
                onClick={() =>
                  setDialogueHistoryIndex(
                    Math.min(history.length - 1, dialogueHistoryIndex + 1),
                  )
                }
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
        <div className="dialogue-right">
          <img className="body-shot" src={fullNpc.bodyShot} alt={fullNpc.name} />
        </div>
      </div>
    </div>
  );
}
