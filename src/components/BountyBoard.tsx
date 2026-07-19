import { useEffect, useRef, useState } from "react";
import "./BountyBoard.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { NPCS } from "../data/npcs";
import { BOUNTY_ROLL_CHANCE } from "../systems/bounties";
import { ResourceIcon } from "./Resources";
import Modal from "./Modal";

function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export default function BountyBoard() {
  const [open, setOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const activeBounties = useGameStore((s) => s.activeBounties);
  const bountyRollCooldown = useGameStore((s) => s.bountyRollCooldown);
  const resources = useGameStore((s) => s.resources);
  const fulfillBounty = useGameStore((s) => s.fulfillBounty);
  const isDialogueActive = useGameStore((s) => s.isDialogueActive);
  const prevCountRef = useRef(activeBounties.length);

  useEffect(() => {
    if (activeBounties.length > prevCountRef.current) {
      setJustAdded(true);
      const timeout = setTimeout(() => setJustAdded(false), 2500);
      prevCountRef.current = activeBounties.length;
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = activeBounties.length;
  }, [activeBounties.length]);

  return (
    <>
      <button
        className={`action-btn bounty-board-trigger ${justAdded ? "bounty-board-trigger--new" : ""}`}
        onClick={() => setOpen(true)}
      >
        Open Bounty Board
        {activeBounties.length > 0 && (
          <span className="bounty-count-badge">{activeBounties.length}</span>
        )}
      </button>
      <div className="bounty-roll-status">
        Next bounty check: {formatCountdown(bountyRollCooldown)} ({Math.round(BOUNTY_ROLL_CHANCE * 100)}% chance)
      </div>

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
