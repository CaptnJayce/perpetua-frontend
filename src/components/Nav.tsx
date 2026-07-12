import "./Nav.css";
import { useGameStore } from "../store";
import { signOut } from "../lib/auth";
import { useIntroRevealLevel } from "../lib/introReveal";

export default function Nav({ onOpenAuth }: { onOpenAuth: () => void }) {
  const debugMode = useGameStore((s) => s.debugMode);
  const user = useGameStore((s) => s.user);
  const questionModeActive = useGameStore((s) => s.questionModeActive);
  const toggleQuestionMode = useGameStore((s) => s.toggleQuestionMode);
  const revealed = useIntroRevealLevel() === "full";

  return (
    <div className={`nav ${revealed ? "nav--visible" : "nav--hidden"}`}>
      <div className="nav-elements-left">
        <button>Home</button>
        <button
          className={`question-mode-toggle ${questionModeActive ? "question-mode-toggle--active" : ""}`}
          onClick={toggleQuestionMode}
          title="Question mode — click an NPC or resource to learn about it"
        >
          ?
        </button>
      </div>

      <div className="nav-elements-middle">
        {debugMode && <span className="debug-badge">DEBUG</span>}
      </div>

      <div className="nav-elements-right">
        {user ? (
          <button onClick={() => signOut()}>{user.email}</button>
        ) : (
          <button onClick={onOpenAuth}>Log In</button>
        )}
      </div>
    </div>
  );
}
