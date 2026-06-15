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

export interface DialogueTree {
  entryNodeIds: string[];
  nodes: Record<string, DialogueNode>;
}

export const DIALOGUE_TREES: Record<string, DialogueTree> = {
  "mantle-of-logic": {
    entryNodeIds: ["intro", "worker_visit"],
    nodes: {
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
          { text: "Until then!", nextNodeId: "end" },
        ],
      },
      end: {
        id: "end",
        text: "...",
        options: [],
      },
      worker_visit: {
        id: "worker_visit",
        requireFlag: "completed_tutorial",
        text: "Good progress so far! I've brought over one of Hexry's workers to help you get along, treat him well!",
        options: [
          { text: "Thank you", nextNodeId: "end", setFlag: "unlock_worker_one" },
        ],
      },
    },
  },
};

export function getCurrentDialogue(
  npcId: string,
  nodeId: string,
): DialogueNode | null {
  const tree = DIALOGUE_TREES[npcId];
  if (!tree) return null;
  return tree.nodes[nodeId] ?? null;
}

export function getNextAvailableNode(
  npcId: string,
  flags: string[],
  completedNodeIds: string[],
): string | null {
  const tree = DIALOGUE_TREES[npcId];
  if (!tree) return null;

  for (const entryId of tree.entryNodeIds) {
    if (completedNodeIds.includes(entryId)) continue;
    const node = tree.nodes[entryId];
    if (!node) continue;
    if (node.requireFlag && !flags.includes(node.requireFlag)) continue;
    return entryId;
  }

  return null;
}

export interface DialogueHistoryEntry {
  nodeId: string;
  npcText: string;
  playerResponse: string;
}
