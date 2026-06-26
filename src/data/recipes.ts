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
      { resId: "wood", amnt: 1 },
    ],
    output: { resId: "gear", amnt: 1 },
  },

  craftTemplateFittings: {
    id: "craftTemplateFittings",
    inputs: [
      { resId: "tmp", amnt: 2 },
      { resId: "wood", amnt: 1 },
    ],
    output: { resId: "fittings", amnt: 1 },
  },

  craftBeams: {
    id: "craftBeams",
    inputs: [{ resId: "wood", amnt: 2 }],
    output: { resId: "beams", amnt: 1 },
  },
};
