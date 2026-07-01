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

  craftPropeller: {
    id: "craftPropeller",
    inputs: [
      { resId: "gear", amnt: 3 },
      { resId: "fittings", amnt: 2 },
      { resId: "beams", amnt: 2 },
    ],
    output: { resId: "propeller", amnt: 1 },
  },

  craftVent: {
    id: "craftVent",
    inputs: [
      { resId: "beams", amnt: 3 },
      { resId: "rubber", amnt: 2 },
    ],
    output: { resId: "vent", amnt: 1 },
  },

  craftGenerator: {
    id: "craftGenerator",
    inputs: [
      { resId: "gear", amnt: 90 },
      { resId: "fittings", amnt: 30 },
      { resId: "tmp", amnt: 50 },
    ],
    output: { resId: "pkg", amnt: 1 },
  },

  craftStorage: {
    id: "craftStorage",
    inputs: [
      { resId: "beams", amnt: 90 },
      { resId: "rubber", amnt: 50 },
      { resId: "fittings", amnt: 30 },
    ],
    output: { resId: "pks", amnt: 1 },
  },
};
