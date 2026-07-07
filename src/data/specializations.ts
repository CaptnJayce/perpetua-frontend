export interface SpecializationDef {
  id: string;
  label: string;
  description: string;
  flag: string;
}

export const SPECIALIZATIONS: SpecializationDef[] = [
  {
    id: "war",
    label: "Concepts given Form",
    description:
      "Take a dive into a completely uncharted form of chemistry. Explore the realm of dust and it's applications - as well as establishing trade with our closest neighbour planet, Kala, where the resource is most prominent. We can exchange our energy for their dust and revolutionise Perpetua.",
    flag: "spec_war",
  },
  {
    id: "haven",
    label: "Ad Infinitum",
    description:
      "What we have works. Let's not test our metal so quickly - we'll play it safe, invest into what has worked and ensure the people of Perpetua have the easy lives they were promised. Perpetua for perpetuity.",
    flag: "spec_haven",
  },
  {
    id: "sea",
    label: "To See A Sea",
    description:
      "Perpetua is hopeless. I've seen it. This planet is destined to a heat death and my technology is wasted on it. Kala is our closest planet seven light years away - they have everything, plant life, a stable orbit in a habitable zone... an ocean. I'll work in secret, preparing myself for a life away from here - and I'll leave it all behind.",
    flag: "spec_sea",
  },
];
