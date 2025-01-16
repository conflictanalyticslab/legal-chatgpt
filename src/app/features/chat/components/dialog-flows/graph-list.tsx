import React, { useState, useEffect } from "react";

import { auth } from "@/lib/firebase/firebase-admin/firebase";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { PlusSquare } from "lucide-react";
import {
  fetchDialogFlow,
  useFetchUniversalDialogFlows,
  useFetchUserDialogFlows,
} from "./api";
import { useDialogFlowStore } from "./store";
import { useShallow } from "zustand/react/shallow";
import { toast } from "@/components/ui/use-toast";

export default function GraphList() {
  const {
    graphId,
    setGraphId,
    setName,
    setNodes,
    setEdges,
    setLastSaved,
    setSaveBlocked,
    setPublicGraph,
  } = useDialogFlowStore(
    useShallow((state) => ({
      graphId: state.graphId,
      setGraphId: state.setGraphId,
      setName: state.setName,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setLastSaved: state.setLastSaved,
      setSaveBlocked: state.setSaveBlocked,
      setPublicGraph: state.setPublicGraph,
    }))
  );

  const { data: graphList } = useFetchUserDialogFlows();
  const { data: universalGraphList } = useFetchUniversalDialogFlows();

  async function loadGraph(id: string, saveBlocked: boolean) {
    if (graphId === id) return;
    const graph = await fetchDialogFlow(id);
    setSaveBlocked(saveBlocked);
    setGraphId(id);
    setName(graph.name);
    setNodes(graph.data.nodes);
    setEdges(graph.data.edges);
    setLastSaved(new Date());
    setPublicGraph(false);
    toast({
      title: `Dialog Flow '${graph.name}' loaded`,
    });
  }

  function newGraph() {
    if (graphId === null) return;
    setGraphId(null);
    setName("Untitled");
    setNodes([]);
    setEdges([]);
    setLastSaved(null);
    toast({
      title: `New Dialog Flow created`,
    });
  }

  return (
    <div className="flex flex-col px-4 mt-[60px] min-w-[180px] w-1/5 gap-4">
      <div className="flex flex-col gap-1">
        <Label className="text-[#838383] mb-2">User Created Graphs</Label>
        {graphList?.map((item) => (
          <Button
            key={item.id}
            onClick={() => loadGraph(item.id, false)}
            className="flex justify-start gap-3 cursor-pointer border-[1px] border-transparent hover:border-border hover:border-[1px] px-2"
            variant={graphId === item.id ? "default" : "ghost"}
          >
            {item.name}
          </Button>
        ))}

        <Button
          className="flex justify-start gap-3 cursor-pointer border-[1px] border-transparent hover:border-border hover:border-[1px] px-2"
          variant={graphId === null ? "default" : "ghost"}
          onClick={() => newGraph()}
        >
          <>
            <PlusSquare className="h-5 w-5" />
            New Graph
          </>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[#838383] mb-2">Provided Graphs</Label>
        {universalGraphList?.map((item) => (
          <Button
            key={item.id}
            onClick={() => loadGraph(item.id, true)}
            className="flex justify-start gap-3 cursor-pointer border-[1px] border-transparent hover:border-border hover:border-[1px] px-2"
            variant={graphId === item.id ? "default" : "ghost"}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
