import templateMetal from "../../assets/template_metal.png";
import blazerWood from "../../assets/blazer_wood.png";
import rubber from "../../assets/rubber.png";
import gear from "../../assets/gear.png";
import templateFitting from "../../assets/template_fitting.png";
import blazerBeam from "../../assets/blazer_beam.png";
import propeller from "../../assets/propeller.png";
import vent from "../../assets/vent.png";

export type ResourceCategory =
  | "base"
  | "passive"
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
  requireFlag?: string; // flag that must be set before this resource passively generates
}

export const RESOURCES: Record<string, ResourceDef> = {
  energy: {
    id: "energy",
    label: "Perpetual Energy",
    cap: 1000,
    category: "passive",
    rate: 1,
    requireFlag: "generator_online",
  },
  tmp: {
    id: "tmp",
    label: "Template Metal",
    cap: 100,
    category: "base",
    gatherAmt: 5,
    gatherCd: 3,
    icon: templateMetal,
  },
  wood: {
    id: "wood",
    label: "Blazer Wood",
    cap: 100,
    category: "base",
    gatherAmt: 5,
    gatherCd: 3,
    icon: blazerWood,
  },
  rubber: {
    id: "rubber",
    label: "Rubber",
    cap: 75,
    category: "base",
    gatherAmt: 5,
    gatherCd: 6,
    icon: rubber,
    requireFlag: "rubber_unlocked",
  },
  gear: {
    id: "gear",
    label: "Gear",
    cap: 50,
    category: "crafted",
    displayAsInt: true,
    icon: gear,
  },
  fittings: {
    id: "fittings",
    label: "Fitting",
    cap: 50,
    category: "crafted",
    displayAsInt: true,
    icon: templateFitting,
  },
  beams: {
    id: "beams",
    label: "Blazer Beams",
    cap: 50,
    category: "crafted",
    displayAsInt: true,
    icon: blazerBeam,
  },
  propeller: {
    id: "propeller",
    label: "Propeller",
    cap: 50,
    category: "crafted",
    displayAsInt: true,
    icon: propeller,
  },
  vent: {
    id: "vent",
    label: "Vent",
    cap: 50,
    category: "crafted",
    displayAsInt: true,
    icon: vent,
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
  temp1: {
    id: "temp1",
    label: "Temp1",
    cap: 1,
    category: "crafted",
    displayAsInt: true,
    requireFlag: "phase2_resources_unlocked",
  },
  temp2: {
    id: "temp2",
    label: "Temp2",
    cap: 1,
    category: "crafted",
    displayAsInt: true,
    requireFlag: "phase2_resources_unlocked",
  },
};
