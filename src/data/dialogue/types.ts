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

export interface DialogueHistoryEntry {
  nodeId: string;
  npcText: string;
  playerResponse: string;
}
