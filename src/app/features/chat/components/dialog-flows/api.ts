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
  const {
    origin,
    graphId,
    setGraphId,
    setLastSaved,
    setName,
    name,
    publicGraph,
    nodes,
    edges,
  } = useDialogFlowStore();

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
      return (await response.json()).data as {
        id: string;
        name: string;
        updated_at: number;
      };
    },
    onMutate() {
      setLastSaved(Date.now());
    },
    onSuccess: (graph) => {
      setGraphId(graph.id);
      setName(graph.name);
      setLastSaved(graph.updated_at);

      switch (origin) {
        case "user":
          queryClient.invalidateQueries({ queryKey: ["dialog-flows"] });
          break;
        case "shared":
          queryClient.invalidateQueries({ queryKey: ["shared-dialog-flows"] });
          break;
      }
    },
    onError: (error) => {
      if (!graphId) setLastSaved(null);
      toast({
        variant: "destructive",
        title: "Error occurred while saving graph",
        description: error.message,
      });
    },
  });
}

export function useDeleteDialogFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/graphs/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return (await response.json()).success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dialog-flows"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error occurred while deleting graph",
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

export function useShareDialogFlow(
  options: Pick<
    UseMutationOptions<
      { id: string; updated_at: number },
      Error,
      { add: string[]; delete: string[] }
    >,
    "onSuccess"
  >
) {
  const { sharedWith, graphId, setSharedWith, setLastSaved } =
    useDialogFlowStore();

  return useMutation({
    mutationFn: async (body: { add: string[]; delete: string[] }) => {
      invariant(auth.currentUser, "User is not authenticated");
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/graphs/share/${graphId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      return (await response.json()).data as {
        id: string;
        updated_at: number;
        shared_with: {
          add: string;
          delete: string;
        };
      };
    },
    onMutate() {
      setLastSaved(Date.now());
    },
    onSuccess: (graph, variables, context) => {
      setSharedWith([
        // prettier-ignore
        ...sharedWith.filter((email) => !graph.shared_with.delete.includes(email)),
        ...graph.shared_with.add,
      ]);
      setLastSaved(graph.updated_at);
      options?.onSuccess?.(graph, variables, context);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error occurred while sharing graph",
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
  shared_with?: string[];
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
