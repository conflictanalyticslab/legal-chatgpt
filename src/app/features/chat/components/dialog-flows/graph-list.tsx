import React from "react";

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
import { cn } from "@/lib/utils";

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
    setNodes(graph.nodes);
    setEdges(graph.edges);
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
    <div className="px-2 max-w-xs w-full">
      <div className="h-14 flex items-center justify-start w-full">
        <Button
          className="hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 gap-3 bg-white px-3 w-full"
          variant={graphId === null ? "default" : "ghost"}
          onClick={() => newGraph()}
        >
          <>
            <PlusSquare className="h-5 w-5" />
            New Graph
          </>
        </Button>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <Label className="text-[#838383] mb-2">User Created Graphs</Label>
        {graphList?.map((item) => {
          const isSelected = graphId === item.id;
          return (
            <Button
              key={item.id}
              onClick={() => loadGraph(item.id, false)}
              className={cn(
                "justify-start px-3",
                !isSelected &&
                  "hover:bg-neutral-200 border border-transparent hover:border-neutral-300"
              )}
              variant={isSelected ? "default" : "ghost"}
            >
              {item.name}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 mt-4">
        <Label className="text-[#838383] mb-2">Provided Graphs</Label>
        {universalGraphList?.map((item) => {
          const isSelected = graphId === item.id;

          return (
            <Button
              key={item.id}
              onClick={() => loadGraph(item.id, true)}
              className={cn(
                "justify-start px-3",
                !isSelected &&
                  "hover:bg-neutral-200 border border-transparent hover:border-neutral-300"
              )}
              variant={isSelected ? "default" : "ghost"}
            >
              {item.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
