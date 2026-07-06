import { useRef, useState } from "react";
import Modal from "./Modal";
import Turnstile, { type TurnstileHandle } from "./Turnstile";
import "./AuthModal.css";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<string | null>;
  onSignup: (
    email: string,
    password: string,
    captchaToken: string,
  ) => Promise<string | null>;
}

export default function AuthModal({
  open,
  onClose,
  onLogin,
  onSignup,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) return;

    setSubmitting(true);
    setError(null);
    const err =
      mode === "login"
        ? await onLogin(email, password, captchaToken)
        : await onSignup(email, password, captchaToken);
    setSubmitting(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "login" ? "Log In" : "Sign Up"}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth-field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <Turnstile ref={turnstileRef} onVerify={setCaptchaToken} />
        {error && <p className="auth-error">{error}</p>}
        <button
          type="submit"
          className="auth-submit"
          disabled={submitting || !captchaToken}
        >
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
      <button
        type="button"
        className="auth-toggle"
        onClick={() => {
          setError(null);
          setCaptchaToken(null);
          turnstileRef.current?.reset();
          setMode(mode === "login" ? "signup" : "login");
        }}
      >
        {mode === "login"
          ? "Need an account? Sign up"
          : "Already have an account? Log in"}
      </button>
    </Modal>
  );
}
