import { createWithEqualityFn as create } from "zustand/traditional";
import { GraphFlowEdge, GraphFlowNode, GraphFlowNodeTypes } from "./nodes";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  EdgeChange,
  NodeChange,
} from "@xyflow/react";
import { temporal } from "zundo";
import isDeepEqual from "fast-deep-equal";
import pick from "just-pick";
import throttle from "just-throttle";

const initialNodes: GraphFlowNode[] = [
  {
    id: "ghost",
    type: "ghost",
    position: { x: 0, y: 0 },
    data: { standalone: true },
  },
];

const initialEdges: GraphFlowEdge[] = [];

interface DialogFlowStore {
  graphId: string | null;
  origin: "user" | "shared" | "universal";
  fetchingId: string | null;
  name: string;
  publicGraph: boolean;
  model: "GPT-4" | "Claude";
  nodes: GraphFlowNode[];
  edges: GraphFlowEdge[];
  sharedWith: string[];
  lastSaved: number | null;
  setGraphId: (graphId: string | null) => void;
  setOrigin: (origin: DialogFlowStore["origin"]) => void;
  setFetchingId: (fetchingId: string | null) => void;
  setName: (name: string) => void;
  setPublicGraph: (publicGraph: boolean) => void;
  onNodesChange: (changes: NodeChange<GraphFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<GraphFlowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: GraphFlowNode[]) => void;
  setEdges: (edges: GraphFlowEdge[]) => void;
  addNode: (node: GraphFlowNode) => void;
  addEdge: (edge: GraphFlowEdge) => void;
  updateNode: (
    nodeId: string,
    mutateFn: (node: GraphFlowNode) => GraphFlowNode
  ) => void;
  removeNode: (nodeId: string) => void;
  updateEdge: (
    edgeId: string,
    mutateFn: (edge: GraphFlowEdge) => GraphFlowEdge
  ) => void;
  setSharedWith: (sharedWith: string[]) => void;
  setLastSaved: (lastSaved: number | null) => void;
  setModel: (model: "GPT-4" | "Claude") => void;
}

/**
 * Store for the dialog flow graph
 *
 * This is only used by the dialog flow editor and not the conversation query.
 *
 * @see {@link useGlobalDialogFlowStore} for the compiled dialog flow to be used in the conversation query.
 */
export const useDialogFlowStore = create<DialogFlowStore>()(
  temporal(
    (set, get) => ({
      graphId: null,
      origin: "user",
      fetchingId: null,
      name: "Untitled",
      publicGraph: false,
      model: "GPT-4",
      nodes: initialNodes,
      edges: initialEdges,
      sharedWith: [],
      lastSaved: null,
      setGraphId: (graphId) => {
        set({ graphId });
      },
      setOrigin: (origin) => {
        set({ origin });
      },
      setFetchingId: (fetchingId) => {
        set({ fetchingId });
      },
      setName: (name) => {
        set({ name });
      },
      setPublicGraph: (publicGraph) => {
        set({ publicGraph });
      },
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      setNodes: (nodes) => {
        set({
          nodes: nodes,
        });
      },
      setEdges: (edges) => {
        set({
          edges: edges,
        });
      },
      addNode: (node) => {
        set({
          nodes: [...get().nodes, node],
        });
      },
      addEdge: (edge) => {
        set({
          edges: [...get().edges, edge],
        });
      },
      updateNode: (nodeId, mutateFn) => {
        const updatedNodes = get().nodes.map((n) =>
          n.id === nodeId ? mutateFn(n) : n
        );
        set({ nodes: updatedNodes });
      },
      removeNode: (nodeId) => {
        const { nodes, edges } = get();
        set({
          nodes: nodes.filter((node) => node.id !== nodeId),
          edges: edges.filter((edge) => {
            return edge.target !== nodeId && edge.source !== nodeId;
          }),
        });
      },
      updateEdge: (edgeId, mutateFn) => {
        const updatedEdges = get().edges.map((e) =>
          e.id === edgeId ? mutateFn(e) : e
        );
        set({ edges: updatedEdges });
      },
      setSharedWith: (sharedWith) => {
        set({ sharedWith });
      },
      setLastSaved: (lastSaved) => {
        set({ lastSaved });
      },
      setModel: (model) => {
        set({ model });
      },
    }),
    {
      // only track nodes and edges
      // https://github.com/charkour/zundo#exclude-fields-from-being-tracked-in-history
      partialize(state) {
        return {
          nodes: state.nodes,
          edges: state.edges,
        };
      },
      // prevent unchanged states from getting stored in history
      // https://github.com/charkour/zundo#prevent-unchanged-states-from-getting-stored-in-history
      equality(pastState, currentState) {
        if (
          pastState.nodes.length !== currentState.nodes.length ||
          pastState.edges.length !== currentState.edges.length
        ) {
          return false;
        }

        for (let i = 0; i < currentState.nodes.length; i++) {
          const a = pick(pastState.nodes[i], ["data", "position"]);
          const b = pick(currentState.nodes[i], ["data", "position"]);
          if (!isDeepEqual(a, b)) return false;
        }

        return isDeepEqual(pastState.edges, currentState.edges);
      },
      // TODO: https://github.com/charkour/zundo#store-state-delta-rather-than-full-object
      // throttle change
      // https://github.com/charkour/zundo#cool-off-period
      handleSet(handleSet) {
        return throttle((state) => handleSet(state), 500);
      },
    }
  )
);

interface ToolbarStore {
  type: GraphFlowNodeTypes | null;
  setType: (type: GraphFlowNodeTypes | null) => void;
}

export const useToolbarStore = create<ToolbarStore>((set, get) => ({
  type: null,
  setType: (type) => {
    set({
      type: type,
    });
  },
}));

type SelectedItem = {
  id: string;
  type: "node" | "edge";
};

interface PropertiesStore {
  selectedItem: SelectedItem | null;
  setSelectedItem: (item: SelectedItem | null) => void;
}

/**
 * Store for the selected item in the dialog flow editor
 */
export const usePropertiesStore = create<PropertiesStore>()((set, get) => ({
  selectedItem: null,
  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },
}));

interface CompiledDialogFlow {
  name: string;
  prompt: string;
  isCustom?: boolean;
}
interface GlobalDialogFlowStore {
  isOutdated: boolean;
  setIsOutdated(isOutdated: boolean): void;

  compiledDialogFlow: CompiledDialogFlow | null;
  setCompiledDialogFlow: (
    compiledDialogFlow: CompiledDialogFlow | null
  ) => void;
}

/**
 * Store for the compiled dialog flow to be used in the conversation query
 */
export const useGlobalDialogFlowStore = create<GlobalDialogFlowStore>(
  (set) => ({
    isOutdated: false,
    setIsOutdated: (isOutdated) => {
      set({ isOutdated });
    },

    compiledDialogFlow: null,
    setCompiledDialogFlow: (compiledDialogFlow) => {
      set({ isOutdated: false, compiledDialogFlow });
    },
  })
);
