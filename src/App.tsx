import "./App.css";

import { useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useGameStore } from "./store";
import { INTRO_NPC_ID, useIntroRevealLevel } from "./lib/introReveal";

import Resources from "./components/Resources";
import Dialogue from "./components/Dialogue";
import Actions from "./components/Actions";
import SpecializationSelect from "./components/SpecializationSelect";
import LorePopup from "./components/LorePopup";

export default function App() {
  const toggleDebugMode = useGameStore((s) => s.toggleDebugMode);
  const emptyResources = useGameStore((s) => s.emptyResources);
  const debugGrantGenerator = useGameStore((s) => s.debugGrantGenerator);
  const debugSpawnBounty = useGameStore((s) => s.debugSpawnBounty);
  const selectedNpcId = useGameStore((s) => s.selectedNpcId);
  const selectNpc = useGameStore((s) => s.selectNpc);
  const saveStatus = useGameStore((s) => s.saveStatus);
  const isReturningPlayer = useGameStore((s) => s.isReturningPlayer);
  const questionModeActive = useGameStore((s) => s.questionModeActive);
  const revealLevel = useIntroRevealLevel();

  useEffect(() => {
    document.body.classList.toggle("question-mode", questionModeActive);
  }, [questionModeActive]);

  useEffect(() => {
    if (saveStatus !== "resolved" || isReturningPlayer) return;
    if (revealLevel === "full" || selectedNpcId) return;
    selectNpc(INTRO_NPC_ID);
  }, [saveStatus, isReturningPlayer, revealLevel, selectedNpcId, selectNpc]);

  useEffect(() => {
    const TICK_MS = 100;
    const delta = TICK_MS / 1000;
    const interval = setInterval(() => {
      if (!useGameStore.getState().isDialogueActive) {
        useGameStore.getState().tick(delta);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      if (e.key === "D") {
        toggleDebugMode();
      } else if (e.key === "E") {
        emptyResources();
      } else if (e.key === "W") {
        debugGrantGenerator();
      } else if (e.key === "B") {
        debugSpawnBounty();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleDebugMode, emptyResources, debugGrantGenerator, debugSpawnBounty]);

  const resourcesRevealed = revealLevel === "resources" || revealLevel === "full";
  const actionsRevealed = revealLevel !== "none";

  return (
    <>
      <LorePopup />
      <SpecializationSelect />
      <Group className="main" orientation="horizontal">
        <Panel
          id="resources"
          className="panel"
          defaultSize="30%"
          minSize="18%"
          maxSize="45%"
        >
          <div className={`intro-reveal ${resourcesRevealed ? "intro-reveal--visible" : ""}`}>
            <Resources />
          </div>
        </Panel>
        <Separator
          className={`resize-handle resize-handle--vertical ${resourcesRevealed ? "" : "resize-handle--hidden"}`}
        />
        <Panel id="right" className="panel">
          <Group orientation="vertical">
            <Panel
              id="dialogue"
              className="panel"
              defaultSize="60%"
              minSize="30%"
            >
              <Dialogue />
            </Panel>
            <Separator
              className={`resize-handle resize-handle--horizontal ${actionsRevealed ? "" : "resize-handle--hidden"}`}
            />
            <Panel
              id="actions"
              className="panel"
              defaultSize="30%"
              minSize="20%"
            >
              <div className={`intro-reveal ${actionsRevealed ? "intro-reveal--visible" : ""}`}>
                <Actions />
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </>
  );
}
