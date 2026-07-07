export interface RecipeDef {
  id: string;
  inputs: { resId: string; amnt: number }[];
  output: { resId: string; amnt: number };
  craftCd?: number; // cooldown in seconds between crafts, if any
}

export const RECIPES: Record<string, RecipeDef> = {
  craftGear: {
    id: "craftGear",
    inputs: [
      { resId: "tmp", amnt: 2 },
      { resId: "wood", amnt: 1 },
    ],
    output: { resId: "gear", amnt: 1 },
    craftCd: 1,
  },

  craftTemplateFittings: {
    id: "craftTemplateFittings",
    inputs: [
      { resId: "tmp", amnt: 2 },
      { resId: "wood", amnt: 2 },
      { resId: "rubber", amnt: 1 },
    ],
    output: { resId: "fittings", amnt: 1 },
    craftCd: 1,
  },

  craftBeams: {
    id: "craftBeams",
    inputs: [
      { resId: "wood", amnt: 2 },
      { resId: "tmp", amnt: 1 },
    ],
    output: { resId: "beams", amnt: 1 },
    craftCd: 1,
  },

  craftPropeller: {
    id: "craftPropeller",
    inputs: [
      { resId: "gear", amnt: 3 },
      { resId: "rubber", amnt: 2 },
    ],
    output: { resId: "propeller", amnt: 1 },
    craftCd: 1,
  },

  craftVent: {
    id: "craftVent",
    inputs: [
      { resId: "beams", amnt: 3 },
      { resId: "rubber", amnt: 2 },
    ],
    output: { resId: "vent", amnt: 1 },
    craftCd: 1,
  },

  craftGenerator: {
    id: "craftGenerator",
    inputs: [
      { resId: "gear", amnt: 150 },
      { resId: "fittings", amnt: 80 },
      { resId: "tmp", amnt: 150 },
      { resId: "propeller", amnt: 20 },
      { resId: "vent", amnt: 15 },
    ],
    output: { resId: "pkg", amnt: 1 },
  },

  craftStorage: {
    id: "craftStorage",
    inputs: [
      { resId: "beams", amnt: 150 },
      { resId: "rubber", amnt: 50 },
      { resId: "fittings", amnt: 80 },
      { resId: "vent", amnt: 15 },
    ],
    output: { resId: "pks", amnt: 1 },
  },
};
