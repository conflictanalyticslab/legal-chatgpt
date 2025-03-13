import ELK from "elkjs/lib/elk.bundled.js";

import type { GraphFlowNode, GraphFlowEdge } from "./nodes";

export default async function autoAlign(
  nodes: GraphFlowNode[],
  edges: GraphFlowEdge[]
) {
  const elk = new ELK();

  // this is the best that can be done right now, but there are still some cases to consider:
  // - since all nodes in the same layer share the same y position, edges may overlap.
  //   a slight y-offset (see line 61) has been added to create a staggered effect to prevent that.
  // - there is a possibility of a node sitting on top of an edge label, but no solution for this yet.
  // - doesn't fully support nodes with handles on the side.
  const layoutedGraph = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "100",
      "elk.spacing.edgeNode": "50",
      "elk.spacing.edgeEdge": "150",
      "elk.layered.spacing.nodeNodeBetweenLayers": "200",
      "elk.layered.spacing.edgeEdgeBetweenLayers": "50",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.edgeRouting": "ORTHOGONAL",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.measured!.width! + 20,
      height: node.measured!.height! + 20,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  });

  if (!layoutedGraph.children) return [];

  const m: Record<number, number> = {};
  return layoutedGraph.children.map((node) => {
    const y = node.y!;
    if (y in m) {
      m[y] += 1;
    } else {
      m[y] = 0;
    }

    return {
      id: node.id,
      type: "position" as const,
      position: {
        x: node.x!,
        y: y + (m[y] % 3) * 50,
      },
    };
  });
}
