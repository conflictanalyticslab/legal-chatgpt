import { auth } from "@/lib/firebase/firebase-admin/firebase";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useDialogFlowStore } from "./store";
import invariant from "tiny-invariant";
import { GraphFlowEdge, GraphFlowNode } from "./nodes";
import { toast } from "@/components/ui/use-toast";
import autoAlign from "./auto-align";
import { DIAMETER } from "./nodes/circular-node";

export function useSaveDialogFlow(options: UseMutationOptions = {}) {
  const { graphId, setGraphId, name, publicGraph, nodes, edges } =
    useDialogFlowStore(
      useShallow((state) => ({
        graphId: state.graphId,
        setGraphId: state.setGraphId,
        name: state.name,
        publicGraph: state.publicGraph,
        nodes: state.nodes,
        edges: state.edges,
      }))
    );

  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async () => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/graphs/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: graphId,
          name: name,
          public: publicGraph,
          nodes: nodes,
          edges: edges,
        }),
      });
      return (await response.json()).data as string;
    },
    onSuccess: (id, variables, context) => {
      options.onSuccess?.(id, variables, context);
      setGraphId(id);
      queryClient.invalidateQueries({ queryKey: ["dialog-flows"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error occurred while saving graph",
        description: error.message,
      });
    },
  });
}

export function useGenerateDialogFlow() {
  const {
    setName,
    setNodes,
    setEdges,
    onNodesChange,
    setLastSaved,
    setPublicGraph,
  } = useDialogFlowStore();

  return useMutation<
    {
      title: string;
      nodes: GraphFlowNode[];
      edges: GraphFlowEdge[];
    },
    Error,
    string
  >({
    mutationFn: async (query) => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/graphs/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });
      return (await response.json()).data;
    },
    onSuccess: async (data) => {
      const changes = await autoAlign(
        data.nodes.map((node) => ({
          ...node,
          position: { x: 0, y: 0 },
          measured: {
            height: DIAMETER,
            width: DIAMETER,
          },
        })),
        data.edges
      );
      setName(data.title);
      setNodes(data.nodes);
      setEdges(data.edges);
      onNodesChange(changes);
      setLastSaved(new Date());
      setPublicGraph(false);
      toast({ title: `Dialog Flow '${data.title}' generated` });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error occurred while generating graph",
        description: error.message,
      });
    },
  });
}

interface DialogFlowListItem {
  id: string;
  name: string;
}

export function useFetchUserDialogFlows() {
  return useQuery<DialogFlowListItem[]>({
    queryKey: ["dialog-flows"],
    queryFn: async () => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/graphs/retrieve/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return (await response.json()).data;
    },
  });
}

export function useFetchUniversalDialogFlows() {
  return useQuery<DialogFlowListItem[]>({
    queryKey: ["universal-dialog-flows"],
    queryFn: async () => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/graphs/retrieve/universal", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return (await response.json()).data;
    },
  });
}

interface DialogFlow {
  id: string;
  name: string;
  nodes: GraphFlowNode[];
  edges: GraphFlowEdge[];
}

export async function fetchDialogFlow(graphId: string): Promise<DialogFlow> {
  invariant(auth.currentUser, "User is not authenticated");
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(`/api/graphs/retrieve/id/${graphId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return (await response.json()).data;
}
