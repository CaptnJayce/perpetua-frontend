import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Nav from "./components/Nav.tsx";
import AuthModal from "./components/AuthModal.tsx";
import { useGameStore } from "./store.ts";
import { supabase } from "./lib/supabase.ts";
import { signIn, signUp } from "./lib/auth.ts";
import { loadGameSave, saveGameState } from "./lib/gameSaves.ts";

const SAVE_INTERVAL_MS = 30000;

function Root() {
  const [authOpen, setAuthOpen] = useState(false);
  const user = useGameStore((s) => s.user);
  const setUser = useGameStore((s) => s.setUser);
  const hydrateSave = useGameStore((s) => s.hydrateSave);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? "" } : null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null);
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (!user) return;
    loadGameSave(user.id).then((saved) => {
      if (saved) hydrateSave(saved);
    });
  }, [user, hydrateSave]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      saveGameState(user.id, useGameStore.getState());
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <StrictMode>
      <Nav onOpenAuth={() => setAuthOpen(true)} />
      <App />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={signIn}
        onSignup={signUp}
      />
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
