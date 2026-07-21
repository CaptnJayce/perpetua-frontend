import { useState } from "react";
import "./MissedDialogue.css";
import { getCurrentDialogue, type DialogueHistoryEntry } from "../data/dialogue";
import { NPCS } from "../data/npcs";
import Modal from "./Modal";

interface MissedDialogueProps {
  npcId: string;
  history: DialogueHistoryEntry[];
}

interface MissedOption {
  text: string;
  preview: string | undefined;
}

export default function MissedDialogue({ npcId, history }: MissedDialogueProps) {
  const [open, setOpen] = useState(false);
  const npcName = NPCS.find((n) => n.id === npcId)?.name ?? "They";

  const steps = history
    .map((entry) => {
      const node = getCurrentDialogue(npcId, entry.nodeId);
      const options = node?.options ?? [];
      const missed: MissedOption[] = options
        .filter((option) => option.text !== entry.playerResponse)
        .map((option) => ({
          text: option.text,
          preview: option.nextNodeId ? getCurrentDialogue(npcId, option.nextNodeId)?.text : undefined,
        }));
      return { ...entry, missed };
    })
    .filter((step) => step.missed.length > 0);

  if (steps.length === 0) return null;

  return (
    <>
      <button className="action-btn missed-dialogue-trigger" onClick={() => setOpen(true)}>
        Missed Dialogue
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Missed Dialogue"
        className="missed-dialogue-modal"
      >
        <div className="missed-dialogue-list">
          {steps.map((step, i) => (
            <div key={i} className="missed-dialogue-step">
              <p className="missed-dialogue-npc-text">{step.npcText}</p>
              <p className="missed-dialogue-chosen">You said: "{step.playerResponse}"</p>
              <div className="missed-dialogue-alternatives">
                {step.missed.map((alt, j) => (
                  <div key={j} className="missed-dialogue-alt">
                    <p className="missed-dialogue-alt-text">You could've said: "{alt.text}"</p>
                    {alt.preview && (
                      <p className="missed-dialogue-alt-preview">
                        {npcName} would've said: "{alt.preview}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
