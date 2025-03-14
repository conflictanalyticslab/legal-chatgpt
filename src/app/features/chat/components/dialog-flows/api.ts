import { auth } from "@/lib/firebase/firebase-admin/firebase";
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useDialogFlowStore } from "./store";
import invariant from "tiny-invariant";
import { GraphFlowEdge, GraphFlowNode } from "./nodes";
import { toast } from "@/components/ui/use-toast";

const DBURL = "https://dialog-flows-api-h8dnfrgngfbrewc7.canadacentral-01.azurewebsites.net";

export function useSaveDialogFlow(options: UseMutationOptions = {}) {
  const { graphId, setGraphId, name, publicGraph, nodes, edges } = useDialogFlowStore(
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
      const response = await fetch(new URL("update", DBURL), {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: graphId,
          name: name,
          public: publicGraph,
          data: {
            nodes: nodes,
            edges: edges,
          },
        }),
      });
      const res: { id: string } = await response.json();
      return res;
    },
    onSuccess: (data, variables, context) => {
      options.onSuccess?.(data, variables, context);
      setGraphId(data.id);
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
