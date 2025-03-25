import { auth } from "@/lib/firebase/firebase-admin/firebase";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useDialogFlowStore } from "./store";
import invariant from "tiny-invariant";
import { GraphFlowEdge, GraphFlowNode } from "./nodes";
import { toast } from "@/components/ui/use-toast";
import autoAlign from "./auto-align";
import { DIAMETER } from "./nodes/circular-node";

export function useSaveDialogFlow() {
  // prettier-ignore
  const { graphId, setGraphId, setLastSaved, name, publicGraph, nodes, edges } = useDialogFlowStore();

  const queryClient = useQueryClient();

  return useMutation({
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
      return (await response.json()).data as { id: string; updated_at: number };
    },
    onMutate() {
      setLastSaved(Date.now());
    },
    onSuccess: (graph) => {
      setGraphId(graph.id);
      setLastSaved(graph.updated_at);
      queryClient.invalidateQueries({ queryKey: ["dialog-flows"] });
    },
    onError: (error) => {
      setLastSaved(null);
      toast({
        variant: "destructive",
        title: "Error occurred while saving graph",
        description: error.message,
      });
    },
  });
}

export function useGenerateDialogFlow(
  options: Pick<
    UseMutationOptions<
      {
        title: string;
        nodes: GraphFlowNode[];
        edges: GraphFlowEdge[];
      },
      Error,
      string
    >,
    "onSuccess"
  >
) {
  const { setName, setNodes, setEdges, onNodesChange, setPublicGraph } =
    useDialogFlowStore();

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
    onSuccess: async (data, variables, context) => {
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
      setPublicGraph(false);
      toast({ title: `Dialog Flow '${data.title}' generated` });
      options?.onSuccess?.(data, variables, context);
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

export interface DialogFlowListItem {
  id: string;
  name: string;
  updated_at: number | null;
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

export function useFetchSharedDialogFlows() {
  return useQuery<DialogFlowListItem[]>({
    queryKey: ["shared-dialog-flows"],
    queryFn: async () => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/graphs/retrieve/shared", {
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
  public?: boolean;
  updated_at?: number;
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
