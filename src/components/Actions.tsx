import "./Actions.css";
import { useGameStore } from "../store";
import { RESOURCES } from "../data/resources";
import { RECIPES } from "../data/recipes";
import type { RecipeDef } from "../data/recipes";

const gatherables = Object.values(RESOURCES).filter((r) => r.gatherAmt !== undefined);

function GatherButton({ resourceId }: { resourceId: string }) {
    const def = RESOURCES[resourceId];
    const amount = useGameStore((s) => s.resources[resourceId]);
    const cd = useGameStore((s) => s.cooldowns[resourceId] ?? 0);
    const gather = useGameStore((s) => s.gather);
    const isDialogueActive = useGameStore((s) => s.isDialogueActive);

    const atCap = amount >= def.cap;
    const disabled = isDialogueActive || cd > 0 || atCap;

    return (
        <button className="action-btn" onClick={() => gather(resourceId)} disabled={disabled}>
            {def.label} +{def.gatherAmt}
            {cd > 0 && <span className="cooldown"> ({cd.toFixed(1)}s)</span>}
            {atCap && <span className="at-cap"> (full)</span>}
        </button>
    );
}


function CraftButton({ recipe }: { recipe: RecipeDef }) {
    const canAfford = useGameStore((s) =>
        recipe.inputs.every(({ resId, amnt }) => s.resources[resId] >= amnt),
    );
    const atCap = useGameStore((s) => {
        const outputDef = RESOURCES[recipe.output.resId];
        return s.resources[recipe.output.resId] + recipe.output.amnt > outputDef.cap;
    });
    const craft = useGameStore((s) => s.craft);
    const isDialogueActive = useGameStore((s) => s.isDialogueActive);

    const outputDef = RESOURCES[recipe.output.resId];
    const disabled = isDialogueActive || !canAfford || atCap;

    const costLabel = recipe.inputs
        .map(({ resId, amnt }) => `${amnt} ${RESOURCES[resId].label}`)
        .join(", ");

    return (
        <button className="action-btn" onClick={() => craft(recipe.id)} disabled={disabled}>
            {outputDef.label} x{recipe.output.amnt}
            <span className="cost"> — {costLabel}</span>
        </button>
    );
}

export default function Actions() {
    return (
        <div className="actions">
            <h2>Actions</h2>

            <section>
                <h3>Gather</h3>
                {gatherables.map((r) => (
                    <GatherButton key={r.id} resourceId={r.id} />
                ))}
            </section>

            <section>
                <h3>Craft</h3>
                {Object.values(RECIPES).map((recipe) => (
                    <CraftButton key={recipe.id} recipe={recipe} />
                ))}
            </section>
        </div>
    );
}
