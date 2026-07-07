import "./SpecializationSelect.css";
import Modal from "./Modal";
import { useGameStore } from "../store";
import { SPECIALIZATIONS } from "../data/specializations";

export default function SpecializationSelect() {
  const flags = useGameStore((s) => s.flags);
  const specialization = useGameStore((s) => s.specialization);
  const chooseSpecialization = useGameStore((s) => s.chooseSpecialization);

  const open = flags.includes("specialization_briefed") && specialization === null;

  return (
    <Modal
      open={open}
      onClose={() => {}}
      hideClose
      title="A New Direction"
      className="spec-modal"
    >
      <div className="spec-options">
        {SPECIALIZATIONS.map((spec) => (
          <button
            key={spec.id}
            className="spec-option"
            onClick={() => chooseSpecialization(spec.id)}
          >
            <h3 className="spec-label">{spec.label}</h3>
            <p className="spec-description">{spec.description}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
