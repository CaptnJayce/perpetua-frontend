import { useState } from "react";
import "./BountyBoard.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { NPCS } from "../data/npcs";
import { ResourceIcon } from "./Resources";
import Modal from "./Modal";

export default function BountyBoard() {
  const [open, setOpen] = useState(false);
  const activeBounties = useGameStore((s) => s.activeBounties);
  const resources = useGameStore((s) => s.resources);
  const fulfillBounty = useGameStore((s) => s.fulfillBounty);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);

  return (
    <>
      <button className="action-btn bounty-board-trigger" onClick={() => setOpen(true)}>
        Open Bounty Board
        {activeBounties.length > 0 && (
          <span className="bounty-count-badge">{activeBounties.length}</span>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Bounty Board"
        className="bounty-board-modal"
      >
        {activeBounties.length === 0 ? (
          <p className="bounty-empty">No bounties posted right now — check back later.</p>
        ) : (
          <div className="bounty-board">
            {activeBounties.map((bounty) => {
              const giveDef = RESOURCES[bounty.giveResId];
              const rewardDef = RESOURCES[bounty.rewardResId];
              const npc = NPCS.find((n) => n.id === bounty.npcId);
              const canFulfill = resources[bounty.giveResId] >= bounty.giveAmt;

              return (
                <div key={bounty.id} className="bounty-card">
                  <div className="bounty-npc">{npc?.name ?? "Unknown"}</div>
                  <div className="bounty-trade">
                    <span className="bounty-side">
                      <ResourceIcon icon={giveDef.icon} size={20} />
                      {bounty.giveAmt} {giveDef.label}
                    </span>
                    <span className="bounty-arrow">→</span>
                    <span className="bounty-side">
                      <ResourceIcon icon={rewardDef.icon} size={20} />
                      {bounty.rewardAmt} {rewardDef.label}
                    </span>
                  </div>
                  <button
                    className="action-btn bounty-fulfill"
                    disabled={isDialogueActive || !canFulfill}
                    onClick={() => fulfillBounty(bounty.id)}
                  >
                    Fulfill
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}
