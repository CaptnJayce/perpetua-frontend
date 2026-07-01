import templateMetal from "../../assets/template_metal.png";
import blazerWood from "../../assets/blazer_wood.png";
import rubber from "../../assets/rubber.png";
import gear from "../../assets/gear.png";
import templateFitting from "../../assets/template_fitting.png";
import blazerBeam from "../../assets/blazer_beam.png";

export type ResourceCategory =
  | "base"
  | "crafted"
  | "worker"
  | "milestone"
  | "quest";

export interface ResourceDef {
  id: string;
  label: string;
  cap: number;
  category: ResourceCategory;
  displayAsInt?: boolean;
  rate?: number; // passive generation per second, if any
  gatherAmt?: number; // amount gained per gather press, if gatherable
  gatherCd?: number; // cooldown in seconds between gather presses
  icon?: string;
}

export const RESOURCES: Record<string, ResourceDef> = {
  tmp: {
    id: "tmp",
    label: "Template Metal",
    cap: 100,
    category: "base",
    gatherAmt: 5,
    gatherCd: 5,
    icon: templateMetal,
  },
  wood: {
    id: "wood",
    label: "Blazer Wood",
    cap: 100,
    category: "base",
    gatherAmt: 5,
    gatherCd: 5,
    icon: blazerWood,
  },
  rubber: {
    id: "rubber",
    label: "Rubber",
    cap: 100,
    category: "base",
    gatherAmt: 5,
    gatherCd: 5,
    icon: rubber,
  },
  gear: {
    id: "gear",
    label: "Gear",
    cap: 75,
    category: "crafted",
    displayAsInt: true,
    icon: gear,
  },
  fittings: {
    id: "fittings",
    label: "Template Fittings",
    cap: 75,
    category: "crafted",
    displayAsInt: true,
    icon: templateFitting,
  },
  beams: {
    id: "beams",
    label: "Blazer Beams",
    cap: 75,
    category: "crafted",
    displayAsInt: true,
    icon: blazerBeam,
  },
  workers: {
    id: "workers",
    label: "Workers",
    cap: 10,
    category: "worker",
    displayAsInt: true,
  },
  pkg: {
    id: "pkg",
    label: "Perpetual Kinetic Generator",
    cap: 1,
    category: "milestone",
    displayAsInt: true,
  },
  pks: {
    id: "pks",
    label: "Perpetual Kinetic Storage",
    cap: 1,
    category: "milestone",
    displayAsInt: true,
  },
};
