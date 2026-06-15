export interface RecipeDef {
    id: string;
    inputs: { resId: string; amnt: number }[];
    output: { resId: string; amnt: number };
}

export const RECIPES: Record<string, RecipeDef> = {
    craftGear: {
        id: "craftGear",
        inputs: [
            { resId: "tmp", amnt: 2 },
            { resId: "blazer-wood", amnt: 1 },
        ],
        output: { resId: "gear", amnt: 1 },
    },

    craftGearFive: {
        id: "craftGearFive",
        inputs: [
            { resId: "tmp", amnt: 10 },
            { resId: "blazer-wood", amnt: 5 },
        ],
        output: { resId: "gear", amnt: 5 },
    },

    craftTemplateFittings: {
        id: "craftTemplateFittings",
        inputs: [
            { resId: "tmp", amnt: 2 },
            { resId: "blazer-wood", amnt: 1 },
        ],
        output: { resId: "template-fittings", amnt: 1 },
    },

    craftVacuumTubes: {
        id: "craftVacuumTubes",
        inputs: [
            { resId: "tmp", amnt: 2 },
            { resId: "rubber", amnt: 1 },
        ],
        output: { resId: "vacuum-tubes", amnt: 1 },
    },

    craftBeams: {
        id: "craftBeams",
        inputs: [
            { resId: "blazer-wood", amnt: 2 },
        ],
        output: { resId: "beams", amnt: 1 },
    },
};
