import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "../store";
import { LORE } from "../data/lore";
import "./LorePopup.css";

const FALLBACK_TEXT = "Felicity hasn't puzzled this one out yet.";
const VIEWPORT_MARGIN = 12;
const CLICK_GAP = 14;

export default function LorePopup() {
  const popup = useGameStore((s) => s.activeLorePopup);
  const closeLorePopup = useGameStore((s) => s.closeLorePopup);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; ready: boolean }>({
    left: 0,
    top: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    if (!popup || !bubbleRef.current) return;
    const { offsetWidth: w, offsetHeight: h } = bubbleRef.current;

    const left = Math.min(
      Math.max(popup.x - w / 2, VIEWPORT_MARGIN),
      window.innerWidth - w - VIEWPORT_MARGIN,
    );
    const top = Math.min(
      Math.max(popup.y - h - CLICK_GAP, VIEWPORT_MARGIN),
      window.innerHeight - h - VIEWPORT_MARGIN,
    );

    setPos({ left, top, ready: true });
  }, [popup]);

  if (!popup) return null;

  const text = LORE[popup.id]?.trim() || FALLBACK_TEXT;

  return createPortal(
    <div className="lore-popup-backdrop" onClick={closeLorePopup}>
      <div
        ref={bubbleRef}
        className="lore-popup"
        style={{ left: pos.left, top: pos.top, visibility: pos.ready ? "visible" : "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {text}
      </div>
    </div>,
    document.body,
  );
}
