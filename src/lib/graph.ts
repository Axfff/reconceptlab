import { graphEdges, graphNodes, type GraphNode } from "../data/graph";

const nodeById = new Map(graphNodes.map((node) => [node.id, node]));

export function getGraphNode(id: string): GraphNode | undefined {
  return nodeById.get(id);
}

export function getOutgoingEdges(id: string) {
  return graphEdges.filter((edge) => edge.from === id);
}

export function getIncomingEdges(id: string) {
  return graphEdges.filter((edge) => edge.to === id);
}
