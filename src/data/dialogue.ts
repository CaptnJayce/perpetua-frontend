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
        options: [{ text: "Let's get to it", nextNodeId: "npc_display" }],
      },
      npc_display: {
        id: "npc_display",
        text: "On your right, you'll see a display of people you have spoken with whilst at work - transcripts of your conversations will be stored physically and can be accessed by tapping their portrait, also their portraits should glow green if they ever have something to say.",
        options: [{ text: "Continue", nextNodeId: "resources_dashboard" }],
      },
      resources_dashboard: {
        id: "resources_dashboard",
        text: "On your left is your resources dashboard, showing what you've collected and what you should be working towards. The bottom is where you'll be able to acquire resources and assign workers. It's a lot simpler than it looks, just a lot of knobs, dials, and displays to keep track of everything.",
        options: [{ text: "Continue", nextNodeId: "workers_intro" }],
      },
      workers_intro: {
        id: "workers_intro",
        text: "As for the workers, you'll get them overtime. Your first one is scheduled to arrive shortly",
        options: [{ text: "Continue", nextNodeId: "goal" }],
      },
      goal: {
        id: "goal",
        text: "Once you've proven you can take the kinetic energy from the planets orbit with a generator and store it in a battery - we'll speak again. Until then, Felicity.",
        options: [{ text: "Until then!", nextNodeId: "end" }],
      },
      end: {
        id: "end",
        text: "...",
        options: [],
      },
      worker_visit: {
        id: "worker_visit",
        requireFlag: "purchased_upgrade",
        text: "Good progress so far! I've brought over one of Hexry's workers to help you get along, treat him well!",
        options: [
          {
            text: "Thank you",
            nextNodeId: "end",
            setFlag: "unlock_worker_one",
          },
        ],
      },
    },
  },
  hexry: {
    entryNodeIds: ["intro"],
    nodes: {
      intro: {
        id: "intro",
        text: "Oh oh oh! Look who it is!",
        options: [{ text: "...", nextNodeId: "end" }],
      },
      end: {
        id: "end",
        text: "...",
        options: [],
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
