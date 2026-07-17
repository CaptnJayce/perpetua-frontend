import { RESOURCES } from "./resources";

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

  craftZephyr: {
    id: "craftZephyr",
    inputs: [
      { resId: "propeller", amnt: 4 },
      { resId: "beams", amnt: 5 },
      { resId: "fittings", amnt: 3 },
    ],
    output: { resId: "zephyr", amnt: 1 },
    craftCd: 3,
  },

  craftStrongbox: {
    id: "craftStrongbox",
    inputs: [
      { resId: "boiler", amnt: 4 },
      { resId: "tmp", amnt: 5 },
      { resId: "fittings", amnt: 3 },
    ],
    output: { resId: "strongbox", amnt: 1 },
    craftCd: 3,
  },

  craftBoiler: {
    id: "craftBoiler",
    inputs: [
      { resId: "beams", amnt: 5 },
      { resId: "vent", amnt: 2 },
      { resId: "steamDust", amnt: 8 },
    ],
    output: { resId: "boiler", amnt: 1 },
    craftCd: 2,
  },

  craftPiston: {
    id: "craftPiston",
    inputs: [
      { resId: "gear", amnt: 4 },
      { resId: "beams", amnt: 3 },
    ],
    output: { resId: "piston", amnt: 1 },
    craftCd: 2,
  },

  craftPressureValve: {
    id: "craftPressureValve",
    inputs: [
      { resId: "fittings", amnt: 3 },
      { resId: "rubber", amnt: 3 },
      { resId: "glass", amnt: 2 },
    ],
    output: { resId: "pressureValve", amnt: 1 },
    craftCd: 2,
  },

  craftGovernor: {
    id: "craftGovernor",
    inputs: [
      { resId: "steamPipe", amnt: 6 },
      { resId: "gear", amnt: 2 },
    ],
    output: { resId: "governor", amnt: 1 },
    craftCd: 2,
  },

  craftFlywheel: {
    id: "craftFlywheel",
    inputs: [
      { resId: "gear", amnt: 5 },
      { resId: "propeller", amnt: 2 },
    ],
    output: { resId: "flywheel", amnt: 1 },
    craftCd: 2,
  },

  craftGauge: {
    id: "craftGauge",
    inputs: [
      { resId: "glass", amnt: 3 },
      { resId: "fittings", amnt: 2 },
    ],
    output: { resId: "gauge", amnt: 1 },
    craftCd: 2,
  },

  craftGenerator: {
    id: "craftGenerator",
    inputs: [
      { resId: "boiler", amnt: 3 },
      { resId: "governor", amnt: 4 },
      { resId: "piston", amnt: 3 },
      { resId: "flywheel", amnt: 2 },
      { resId: "zephyr", amnt: 2 },
    ],
    output: { resId: "pkg", amnt: 1 },
  },

  craftStorage: {
    id: "craftStorage",
    inputs: [
      { resId: "pressureValve", amnt: 4 },
      { resId: "gauge", amnt: 4 },
      { resId: "boiler", amnt: 2 },
      { resId: "flywheel", amnt: 3 },
      { resId: "strongbox", amnt: 2 },
    ],
    output: { resId: "pks", amnt: 1 },
  },
};

for (const recipe of Object.values(RECIPES)) {
  for (const { resId } of recipe.inputs) {
    if (!RESOURCES[resId]) {
      throw new Error(`Recipe "${recipe.id}" references unknown input resource "${resId}"`);
    }
  }
  if (!RESOURCES[recipe.output.resId]) {
    throw new Error(
      `Recipe "${recipe.id}" references unknown output resource "${recipe.output.resId}"`,
    );
  }
}
