import "./Nav.css";

export default function Nav({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="nav">
      <div className="nav-elements-left">
        <button>Home</button>
      </div>

      <div className="nav-elements-middle">
        <h2>Perpetua</h2>
      </div>

      <div className="nav-elements-right">
        <button onClick={onOpenModal}>Modal</button>
      </div>
    </div>
  );
}
