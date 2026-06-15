export interface DialogueOption {
  text: string;
  nextNodeId?: string;
  affinityDelta?: number;
  setFlag?: string;
  requireFlag?: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  requireFlag?: string;
  options?: DialogueOption[];
}

export const DIALOGUE_TREES: Record<string, Record<string, DialogueNode>> = {
  "mantle-of-logic": {
    intro: {
      id: "intro",
      text: "Welcome to your new place of work! Your perpetual kinetic research has shown a lot of promise, so we're giving you the means to make your contraptions a reality.",
      options: [
        { text: "Let's get to it", nextNodeId: "explore" },
      ],
    },
    explore: {
      id: "explore",
      text: "Have a look around, once you're familiar - start gathering some resources to build some components. Soon enough some workers will come along to help you gather and craft if the need be.",
      options: [
        { text: "Continue", nextNodeId: "goal" },
      ],
    },
    goal: {
      id: "goal",
      text: "Once you've proven you can take the kinetic energy from the planets orbit with a generator and store it in a battery - we'll speak again. Until then, Felicity.",
      options: [
        { text: "Until then!", nextNodeId: "end", setFlag: "completed_tutorial" },
      ],
    },
    end: {
      id: "end",
      text: "...",
      options: [],
    },
    revisit: {
      id: "revisit",
      requireFlag: "completed_tutorial",
      text: "Good to see you again. Your progress is coming along nicely.",
      options: [
        { text: "Thank you", nextNodeId: "end" },
      ],
    },
  },
};

export function getCurrentDialogue(
  npcId: string,
  nodeId: string,
): DialogueNode | null {
  const tree = DIALOGUE_TREES[npcId];
  if (!tree) return null;
  return tree[nodeId] ?? null;
}

export interface DialogueHistoryEntry {
  nodeId: string;
  npcText: string;
  playerResponse: string;
}
