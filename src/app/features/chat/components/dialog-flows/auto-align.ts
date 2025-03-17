import ELK from "elkjs/lib/elk.bundled.js";

import type { GraphFlowNode, GraphFlowEdge } from "./nodes";

export default async function autoAlign(
  nodes: GraphFlowNode[],
  edges: GraphFlowEdge[]
) {
  const elk = new ELK();

  // this is the best that can be done right now, but there are still some cases to consider:
  // - there is a possibility of a node sitting on top of an edge label, but no solution for this yet.
  const layoutedGraph = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "150",
      "elk.spacing.edgeNode": "150",
      "elk.spacing.edgeEdge": "150",
      "elk.layered.spacing.nodeNodeBetweenLayers": "200",
      "elk.layered.spacing.edgeEdgeBetweenLayers": "100",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.edgeRouting": "ORTHOGONAL",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.measured!.width!,
      height: node.measured!.height!,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  });

  if (!layoutedGraph.children) return [];

  return layoutedGraph.children.map((node) => ({
    id: node.id,
    type: "position" as const,
    position: {
      x: node.x!,
      y: node.y!,
    },
  }));
}
