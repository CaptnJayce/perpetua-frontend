import "./Nav.css";
import { useGameStore } from "../store";
import { signOut } from "../lib/auth";

export default function Nav({ onOpenAuth }: { onOpenAuth: () => void }) {
  const debugMode = useGameStore((s) => s.debugMode);
  const user = useGameStore((s) => s.user);

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
        {user ? (
          <button onClick={() => signOut()}>{user.email}</button>
        ) : (
          <button onClick={onOpenAuth}>Log In</button>
        )}
      </div>
    </div>
  );
}
