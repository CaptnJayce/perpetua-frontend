import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    // Hides the close button and disables backdrop/Escape dismissal, for
    // choices the player must make before the modal can go away.
    hideClose?: boolean;
    className?: string;
}

export default function Modal({ open, onClose, title, children, hideClose, className }: ModalProps) {
    useEffect(() => {
        if (!open || hideClose) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose, hideClose]);

    if (!open) return null;

    return createPortal(
        <div className="modal-backdrop" onClick={hideClose ? undefined : onClose}>
            <div className={`modal-card ${className ?? ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    {!hideClose && (
                        <button className="modal-close" onClick={onClose}>
                            &times;
                        </button>
                    )}
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
