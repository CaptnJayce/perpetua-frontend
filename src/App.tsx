import "./App.css";

import { useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useGameStore } from "./store";

import Resources from "./components/Resources";
import Dialogue from "./components/Dialogue";
import Actions from "./components/Actions";

export default function App() {
    const toggleDebugMode = useGameStore((s) => s.toggleDebugMode);

    useEffect(() => {
        const TICK_MS = 100;
        const delta = TICK_MS / 1000;
        const interval = setInterval(() => {
            useGameStore.getState().tick(delta);
        }, TICK_MS);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key === "D") {
                toggleDebugMode();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [toggleDebugMode]);

    return (
        <Group className="main" orientation="horizontal">
            <Panel id="resources" className="panel" defaultSize="28%" minSize="18%" maxSize="45%">
                <Resources />
            </Panel>
            <Separator className="resize-handle resize-handle--vertical" />
            <Panel id="right" className="panel">
                <Group orientation="vertical">
                    <Panel id="dialogue" className="panel" defaultSize="70%" minSize="30%">
                        <Dialogue />
                    </Panel>
                    <Separator className="resize-handle resize-handle--horizontal" />
                    <Panel id="actions" className="panel" minSize="20%">
                        <Actions />
                    </Panel>
                </Group>
            </Panel>
        </Group>
    );
}
