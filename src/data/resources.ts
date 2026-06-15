export type ResourceCategory = "base" | "partial" | "crafted" | "milestone" | "quest";

export interface ResourceDef {
    id: string;
    label: string;
    cap: number;
    category: ResourceCategory;
    displayAsInt?: boolean;
    rate?: number; // passive generation per second, if any
    gatherAmt?: number; // amount gained per gather press, if gatherable
    gatherCd?: number; // cooldown in seconds between gather presses
}

export const RESOURCES: Record<string, ResourceDef> = {
    tmp: {
        id: "tmp",
        label: "Template Metal",
        cap: 50,
        category: "base",
        gatherAmt: 5,
        gatherCd: 3,
    },
    "blazer-wood": {
        id: "blazer-wood",
        label: "Blazer Wood",
        cap: 50,
        category: "base",
        gatherAmt: 5,
        gatherCd: 3,
    },
    rubber: {
        id: "rubber",
        label: "Rubber",
        cap: 50,
        category: "base",
        gatherAmt: 5,
        gatherCd: 3,
    },
    gear: {
        id: "gear",
        label: "Gear",
        cap: 50,
        category: "partial",
        displayAsInt: true,
    },
    "template-fittings": {
        id: "template-fittings",
        label: "Template Fittings",
        cap: 50,
        category: "partial",
        displayAsInt: true,
    },
    "vacuum-tubes": {
        id: "vacuum-tubes",
        label: "Vacuum Tubes",
        cap: 50,
        category: "partial",
        displayAsInt: true,
    },
    beams: {
        id: "beams",
        label: "Beams",
        cap: 50,
        category: "partial",
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
