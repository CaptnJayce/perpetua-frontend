import "./Nav.css";
import { useGameStore } from "../store";

export default function Nav({ onOpenModal }: { onOpenModal: () => void }) {
  const debugMode = useGameStore((s) => s.debugMode);

  return (
    <div className="nav">
      <div className="nav-elements-left">
        <button>Home</button>
      </div>

      <div className="nav-elements-middle">
        <h2>Perpetua</h2>
        {debugMode && <span className="debug-badge">DEBUG</span>}
      </div>

      <div className="nav-elements-right">
        <button onClick={onOpenModal}>Modal</button>
      </div>
    </div>
  );
}
