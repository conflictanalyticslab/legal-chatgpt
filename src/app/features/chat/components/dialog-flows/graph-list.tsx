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
  const { graphId, setGraphId, setName, setNodes, setEdges } =
    useDialogFlowStore(
      useShallow((state) => ({
        graphId: state.graphId,
        setGraphId: state.setGraphId,
        setName: state.setName,
        setNodes: state.setNodes,
        setEdges: state.setEdges,
      }))
    );

  const { data: graphList } = useFetchUserDialogFlows();
  const { data: universalGraphList } = useFetchUniversalDialogFlows();

  async function loadGraph(id: string) {
    const graph = await fetchDialogFlow(id);
    setGraphId(id);
    setName(graph.name);
    setNodes(graph.data.nodes);
    setEdges(graph.data.edges);
    toast({
      title: `Dialog Flow '${graph.name}' loaded`,
    });
  }

  function newGraph() {
    setGraphId(null);
    setName("Untitled");
    setNodes([]);
    setEdges([]);
    toast({
      title: `New Dialog Flow created`,
    });
  }

  return (
    <div className="flex flex-col px-4 mt-[60px] min-w-[180px] w-1/5">
      <Label className="text-[#838383] mb-2">User Created Graphs</Label>
      {graphList?.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => loadGraph(item.id)}
          disabled={graphId === item.id}
          className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
        >
          {item.name}
        </button>
      ))}

      <Button
        className="flex justify-start gap-3 cursor-pointer border-[1px] border-transparent hover:border-border hover:border-[1px] px-2"
        variant={"ghost"}
        onClick={() => newGraph()}
      >
        <>
          <PlusSquare className="h-5 w-5" />
          New Graph
        </>
      </Button>

      <Label className="text-[#838383] mb-2">Provided Graphs</Label>
      {universalGraphList?.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => loadGraph(item.id)}
          disabled={graphId === item.id}
          className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
