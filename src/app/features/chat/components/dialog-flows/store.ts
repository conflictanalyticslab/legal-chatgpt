import { create } from "zustand";
import { GraphFlowEdge, GraphFlowNode, GraphFlowNodeTypes } from "./nodes";
import { addEdge, applyEdgeChanges, applyNodeChanges, Connection, EdgeChange, NodeChange } from "@xyflow/react";

const initialNodes: GraphFlowNode[] = [];

const initialEdges: GraphFlowEdge[] = [];

interface DialogFlowStore {
  nodes: GraphFlowNode[];
  edges: GraphFlowEdge[];
  onNodesChange: (changes: NodeChange<GraphFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<GraphFlowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: GraphFlowNode[]) => void;
  setEdges: (edges: GraphFlowEdge[]) => void;
  addNode: (node: GraphFlowNode) => void;
  updateNode: (nodeId: string, mutateFn: (node: GraphFlowNode) => GraphFlowNode) => void;
  updateEdge: (edgeId: string, mutateFn: (edge: GraphFlowEdge) => GraphFlowEdge) => void;
}

export const useDialogFlowStore = create<DialogFlowStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
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
  updateNode: (nodeId, mutateFn) => {
    const updatedNodes = get().nodes.map(n => 
      n.id === nodeId ? mutateFn(n) : n
    );
    set({ nodes: updatedNodes })
  },
  updateEdge: (edgeId, mutateFn) => {
    const updatedEdges = get().edges.map(e => 
      e.id === edgeId ? mutateFn(e) : e
    );
    set({ edges: updatedEdges })
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

export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  selectedItem: null,
  setSelectedItem: (item) => {
    set({ selectedItem: item })
  }
}));


