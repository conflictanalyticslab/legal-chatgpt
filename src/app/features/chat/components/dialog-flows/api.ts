import { auth } from "@/lib/firebase/firebase-admin/firebase";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useDialogFlowStore } from "./store";
import invariant from "tiny-invariant";
import { GraphFlowEdge, GraphFlowNode } from "./nodes";

const DBURL = "https://graph-module.openjustice.ai";

export function useSaveDialogFlow() {
  const { graphId, name, publicGraph, nodes, edges } = useDialogFlowStore(
    useShallow((state) => ({
      graphId: state.graphId,
      name: state.name,
      publicGraph: state.publicGraph,
      nodes: state.nodes,
      edges: state.edges,
    }))
  );

  return useMutation({
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
      return response.json();
    },
  });
}

interface DialogFlow {
  data: {
    nodes: GraphFlowNode[];
    edges: GraphFlowEdge[];
  };
  id: string;
  name: string;
}

export async function fetchDialogFlow(graphId: string): Promise<DialogFlow> {
  invariant(auth.currentUser, "User is not authenticated");
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(new URL(`retrieve/id/${graphId}`, DBURL), {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}