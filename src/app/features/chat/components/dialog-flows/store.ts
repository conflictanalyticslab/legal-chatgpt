import { createWithEqualityFn as create } from "zustand/traditional";
import { GraphFlowEdge, GraphFlowNode, GraphFlowNodeTypes } from "./nodes";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, NodeChange } from "@xyflow/react";

const initialNodes: GraphFlowNode[] = [
  {
    id: "ghost",
    type: "ghost",
    position: { x: 0, y: 0 },
    data: { standalone: true },
  }
];

const initialEdges: GraphFlowEdge[] = [];

interface DialogFlowStore {
  graphId: string | null;
  origin: "user" | 'shared' | 'universal';
  fetchingId: string | null;
  name: string;
  publicGraph: boolean;
  model: 'GPT-4' | 'Claude';
  nodes: GraphFlowNode[];
  edges: GraphFlowEdge[];
  sharedWith: string[];
  lastSaved: number | null;
  setGraphId: (graphId: string | null) => void;
  setOrigin: (origin: DialogFlowStore['origin']) => void;
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
  updateNode: (nodeId: string, mutateFn: (node: GraphFlowNode) => GraphFlowNode) => void;
  removeNode: (nodeId: string) => void;
  updateEdge: (edgeId: string, mutateFn: (edge: GraphFlowEdge) => GraphFlowEdge) => void;
  setSharedWith: (sharedWith: string[]) => void;
  setLastSaved: (lastSaved: number | null) => void;
  setModel: (model: 'GPT-4' | 'Claude') => void;
}

/**
 * Store for the dialog flow graph
 *
 * This is only used by the dialog flow editor and not the conversation query.
 *
 * @see {@link useGlobalDialogFlowStore} for the compiled dialog flow to be used in the conversation query.
 */
export const useDialogFlowStore = create<DialogFlowStore>()((set, get) => ({
  graphId: null,
  origin: 'user',
  fetchingId: null,
  name: 'Untitled',
  publicGraph: false,
  model: 'GPT-4',
  nodes: initialNodes,
  edges: initialEdges,
  sharedWith: [],
  lastSaved: null,
  setGraphId: (graphId) => {
    set({ graphId })
  },
  setOrigin: (origin) => {
    set({ origin })
  },
  setFetchingId: (fetchingId) => {
    set({ fetchingId })
  },
  setName: (name) => {
    set({ name })
  },
  setPublicGraph: (publicGraph) => {
    set({ publicGraph })
  },
  onNodesChange: (changes) => {
    set({
        nodes: applyNodeChanges(changes, get().nodes)
    })
  },
  onEdgesChange: (changes) => {
    set({
        edges: applyEdgeChanges(changes, get().edges)
    })
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges)
    })
  },
  setNodes: (nodes) => {
    set({
      nodes: nodes
    })
  },
  setEdges: (edges) => {
    set({
      edges: edges
    })
  },
  addNode: (node) => {
    set({
      nodes: [...get().nodes, node]
    })
  },
  addEdge: (edge) => {
    set({
      edges: [...get().edges, edge]
    })
  },
  updateNode: (nodeId, mutateFn) => {
    const updatedNodes = get().nodes.map(n =>
      n.id === nodeId ? mutateFn(n) : n
    );
    set({ nodes: updatedNodes })
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
    const updatedEdges = get().edges.map(e =>
      e.id === edgeId ? mutateFn(e) : e
    );
    set({ edges: updatedEdges })
  },
  setSharedWith: (sharedWith) => {
    set({ sharedWith })
  },
  setLastSaved: (lastSaved) => {
    set({ lastSaved })
  },
  setModel: (model) => {
    set({ model })
  }
}));

interface ToolbarStore {
  type: GraphFlowNodeTypes | null;
  setType: (type: GraphFlowNodeTypes | null) => void;
}

export const useToolbarStore = create<ToolbarStore>((set, get) => ({
  type: null,
  setType: (type) => {
    set({
      type: type
    })
  }
}));

type SelectedItem = {
  id: string;
  type: 'node' | 'edge';
}

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
    set({ selectedItem: item })
  }
}));

interface CompiledDialogFlow {
  name: string;
  prompt: string;
}
interface GlobalDialogFlowStore {
  compiledDialogFlow: CompiledDialogFlow | null;
  setCompiledDialogFlow: (compiledDialogFlow: CompiledDialogFlow | null) => void;
}

/**
 * Store for the compiled dialog flow to be used in the conversation query
 */
export const useGlobalDialogFlowStore = create<GlobalDialogFlowStore>((set) => ({
  compiledDialogFlow: null,
  setCompiledDialogFlow: (compiledDialogFlow) => {
    set({ compiledDialogFlow })
  }
}));