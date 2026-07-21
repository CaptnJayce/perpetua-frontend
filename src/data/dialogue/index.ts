import type { DialogueNode, DialogueTree } from "./types";
import { mantleOfLogicDialogue } from "./mantle-of-logic";
import { gaigeDialogue } from "./gaige";

export type { DialogueOption, DialogueNode, DialogueTree, DialogueHistoryEntry } from "./types";

export const DIALOGUE_TREES: Record<string, DialogueTree> = {
  "mantle-of-logic": mantleOfLogicDialogue,
  gaige: gaigeDialogue,
};

for (const [npcId, tree] of Object.entries(DIALOGUE_TREES)) {
  for (const entryId of tree.entryNodeIds) {
    if (!tree.nodes[entryId]) {
      throw new Error(`Dialogue tree "${npcId}" entryNodeIds references unknown node "${entryId}"`);
    }
  }
  for (const node of Object.values(tree.nodes)) {
    for (const option of node.options ?? []) {
      if (option.nextNodeId && !tree.nodes[option.nextNodeId]) {
        throw new Error(
          `Dialogue tree "${npcId}" node "${node.id}" references unknown nextNodeId "${option.nextNodeId}"`,
        );
      }
    }
  }
}

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
