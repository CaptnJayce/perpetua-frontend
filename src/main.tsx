import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Nav from "./components/Nav.tsx";
import Modal from "./components/Modal.tsx";

function Root() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <StrictMode>
      <Nav onOpenModal={() => setModalOpen(true)} />
      <App />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal Title"
      >
        <p>Modal content goes here.</p>
      </Modal>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
