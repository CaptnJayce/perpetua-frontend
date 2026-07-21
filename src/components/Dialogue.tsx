import "./Dialogue.css";
import { useEffect, useRef, useState } from "react";
import { NPCS } from "../data/npcs";
import { useGameStore } from "../store";
import { getCurrentDialogue } from "../data/dialogue";
import { INTRO_NPC_ID, useIntroActive } from "../lib/introReveal";
import MissedDialogue from "./MissedDialogue";

const TYPEWRITER_CHAR_MS = 30;
const TYPEWRITER_PAUSE_MS = 500;
const SENTENCE_END_CHARS = new Set([".", "!", "?"]);
const COMBO_END_CHARS = new Set(["!", "?"]);

export default function Dialogue() {
  const selectedNpcId = useGameStore((s) => s.selectedNpcId);
  const introActive = useIntroActive();
  const [portraitLoaded, setPortraitLoaded] = useState(false);
  const portraitRef = useRef<HTMLImageElement>(null);
  const [contentVisible, setContentVisible] = useState(false);
  const [contentNpcId, setContentNpcId] = useState(selectedNpcId);
  const npcDialogueStates = useGameStore((s) => s.npcDialogueStates);
  const npcDialogueProgress = useGameStore((s) => s.npcDialogueProgress);
  const flags = useGameStore((s) => s.flags);
  const dialogueHistoryIndex = useGameStore((s) => s.dialogueHistoryIndex);
  const setDialogueHistoryIndex = useGameStore((s) => s.setDialogueHistoryIndex);
  const submitDialogueOption = useGameStore((s) => s.submitDialogueOption);
  const closeDialogueView = useGameStore((s) => s.closeDialogueView);

  const fullNpc = selectedNpcId ? NPCS.find((n) => n.id === selectedNpcId) : null;
  const isMandatoryIntro = introActive && selectedNpcId === INTRO_NPC_ID;

  useEffect(() => {
    setPortraitLoaded(portraitRef.current?.complete ?? false);
  }, [fullNpc?.bodyShot]);

  if (selectedNpcId !== contentNpcId) {
    setContentNpcId(selectedNpcId);
    setContentVisible(false);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setContentVisible(true));
    return () => cancelAnimationFrame(id);
  }, [selectedNpcId]);

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

  const liveText = currentNode?.text ?? "";
  const [displayedLength, setDisplayedLength] = useState(0);
  const [typingNode, setTypingNode] = useState(currentNode);
  const skippedRef = useRef(false);
  if (currentNode !== typingNode) {
    setTypingNode(currentNode);
    setDisplayedLength(0);
  }
  const isTyping = !isComplete && displayedLength < liveText.length;

  useEffect(() => {
    skippedRef.current = false;
    if (isComplete || !currentNode || currentNode.text.length === 0) return;

    const text = currentNode.text;
    let timeoutId: ReturnType<typeof setTimeout>;

    function schedule(len: number) {
      if (skippedRef.current || len >= text.length) return;
      const prevChar = len > 0 ? text[len - 1] : "";
      const midEllipsis = prevChar === "." && text[len] === ".";
      const midCombo = COMBO_END_CHARS.has(prevChar) && COMBO_END_CHARS.has(text[len]);
      let delay = TYPEWRITER_CHAR_MS;
      if (midEllipsis || midCombo) {
        delay = TYPEWRITER_CHAR_MS;
      } else if (prevChar === "." && text.slice(Math.max(0, len - 3), len) === "...") {
        delay = TYPEWRITER_CHAR_MS + TYPEWRITER_PAUSE_MS * 2;
      } else if (SENTENCE_END_CHARS.has(prevChar)) {
        delay = TYPEWRITER_CHAR_MS + TYPEWRITER_PAUSE_MS;
      }
      timeoutId = setTimeout(() => {
        if (skippedRef.current) return;
        setDisplayedLength(len + 1);
        schedule(len + 1);
      }, delay);
    }

    schedule(0);
    return () => clearTimeout(timeoutId);
  }, [currentNode, isComplete]);

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
          <div className={`dialogue-top fade-in-content ${contentVisible ? "fade-in-content--visible" : ""}`}>
            {!isMandatoryIntro && (
              <button className="close-dialogue" onClick={closeDialogueView}>
                Close Dialogue
              </button>
            )}

            <h2 className="npc-name">{fullNpc.name}</h2>
            <div
              className={`dialogue-bubble ${isTyping ? "dialogue-bubble--typing" : ""}`}
              onClick={() => {
                if (isTyping) {
                  skippedRef.current = true;
                  setDisplayedLength(liveText.length);
                }
              }}
            >
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
                <p>{liveText.slice(0, displayedLength)}</p>
              )}
            </div>
          </div>

          {!isComplete && !isTyping && currentNode?.options && (
            <div className={`dialogue-options fade-in-content ${contentVisible ? "fade-in-content--visible" : ""}`}>
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
            <div className={`dialogue-nav fade-in-content ${contentVisible ? "fade-in-content--visible" : ""}`}>
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

          {isComplete && history.length > 0 && selectedNpcId && (
            <MissedDialogue npcId={selectedNpcId} history={history} />
          )}
        </div>
        <div className="dialogue-right">
          <img
            ref={portraitRef}
            className={`body-shot ${portraitLoaded ? "body-shot--loaded" : ""}`}
            src={fullNpc.bodyShot}
            alt={fullNpc.name}
            fetchPriority="high"
            onLoad={() => setPortraitLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
