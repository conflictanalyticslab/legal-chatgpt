import { DependencyGraph } from "@baileyherbert/dependency-graph";
import invariant from "tiny-invariant";
import { GraphFlowEdge, GraphFlowNode } from "./nodes";

/**
 * Validates the given graph and returns the order of the nodes.
 *
 * @param nodes The nodes to validate.
 * @param edges The edges to validate.
 * @returns The order of the nodes.
 * @throws CircularDependencyError if the graph has circular dependencies.
 */
export function validateGraph(nodes: GraphFlowNode[], edges: GraphFlowEdge[]) {
  // TODO: We could implement our own dependency graph here, but we'll use the library for now.
  const dependencyGraph = new DependencyGraph<string>();

  for (const node of nodes) {
    dependencyGraph.addNode(node.id);
  }

  for (const edge of edges) {
    dependencyGraph.addDependency(edge.source, edge.target);
  }

  return dependencyGraph.getOverallOrder();
}

/**
 * Compiles the given graph and returns the prompts for the conversation query.
 *
 * @param nodes The nodes to compile.
 * @param edges The edges to compile.
 * @returns The prompts for the conversation query.
 */
export function compileGraph(nodes: GraphFlowNode[], edges: GraphFlowEdge[]) {
  const order = validateGraph(nodes, edges);

  const prompts: string[] = [];

  const intro = [
    "The following is a set of relationships between nodes in a dialog flow.",
    "The nodes are labeled with their ID.",
    "The edges are labeled with their source and target node IDs.",
    "The nodes are ordered by their dependency order.",
  ];
  prompts.push(intro.join("\n"));

  for (const nodeId of order) {
    const node = nodes.find((n) => n.id === nodeId);
    const dependencies = edges.filter((e) => e.target === nodeId);
    const dependents = edges.filter((e) => e.source === nodeId);

    if (!node) continue;
    const describeRelationships = (edges: GraphFlowEdge[]) => edges.map((e) => e.data?.body ? `Node ${e.source} (${e.data.body})` : `Node ${e.source}`).join(", ");

    invariant(node.type, "Node type is undefined");

    switch (node.type) {
      case "example": {
        const prompt = [
          `Node ${nodeId} is an example node.`,
          `An example of ${describeRelationships(dependencies)} is ${node.data.body}.`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case "instruction": {
        const prompt = [
          `Node ${nodeId} is an instruction node.`,
          dependencies.length > 0 ? `When ${describeRelationships(dependencies)}, you must ${node.data.body}.` : `You must ${node.data.body}.`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case "context": {
        const prompt = [
          `Node ${nodeId} is a context node.`,
          dependencies.length > 0 ? `When performing ${describeRelationships(dependencies)}, ${node.data.body} is provided.` : `${node.data.body} is provided.`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case "switch": {
        const prompt = [
          `Node ${nodeId} is a switch node.`,
        ];
        for (const condition of node.data.conditions) {
          const conditionEdges = dependents.filter((e) => e.sourceHandle === condition.id);
          prompt.push(`When ${describeRelationships(dependencies)} qualifies the condition ${condition.body}, you should refer to ${describeRelationships(conditionEdges)}`);
        }
        if (node.data.otherwise) {
          const otherwiseEdges = dependents.filter((e) => e.sourceHandle === "else");
          prompt.push(`Otherwise, ${node.data.otherwise.body} is provided by ${describeRelationships(otherwiseEdges)}`);
        }
        prompts.push(prompt.join("\n"));
        break;
      }
      case "relevant": {
        const isRelevantEdges = dependents.filter((e) => e.sourceHandle === "relevant");
        const isNotRelevantEdges = dependents.filter((e) => e.sourceHandle === "notRelevant");
        const prompt = [
          `Node ${nodeId} is a relevant node.`,
          `When ${describeRelationships(dependencies)} is relevant, you should refer to ${describeRelationships(isRelevantEdges)}`,
          `The threshold for relevance is ${node.data.threshold}%`,
          `Otherwise, you should refer to ${describeRelationships(isNotRelevantEdges)}`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case "keyword-extractor": {
        const prompt = [
          `Node ${nodeId} is a keyword extractor node.`,
          `It extracts keywords from ${describeRelationships(dependencies)}`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case "pdf": {
        const prompt = [
          `Node ${nodeId} is a pdf node.`,
          `It contains "${node.data.content}" from a PDF file named "${node.data.label}"`,
        ];
        prompts.push(prompt.join("\n"));
        break;
      }
      case "ghost":
        break;
      default: {
        // This is an exhaustive check to ensure that all node types are handled.
        const exhaustiveCheck: never = node.type;
        throw new Error(`Unhandled node type: ${exhaustiveCheck}`);
      }
    }
  }

  return prompts.join("\n\n");
}
