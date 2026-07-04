import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export default function Turnstile({
  onVerify,
}: {
  onVerify: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | undefined;

    const render = () => {
      if (cancelled || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: (token) => onVerify(token),
        "expired-callback": () => onVerify(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      pollId = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollId);
          render();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
    };
  }, [onVerify]);

  return <div ref={containerRef} />;
}
