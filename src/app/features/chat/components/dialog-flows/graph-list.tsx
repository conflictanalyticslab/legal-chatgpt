import React, { useState } from "react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { ChevronLeft, PlusSquare } from "lucide-react";
import {
  fetchDialogFlow,
  useFetchUniversalDialogFlows,
  useFetchUserDialogFlows,
} from "./api";
import { useDialogFlowStore } from "./store";
import {} from "zustand/react/shallow";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "./layout-store";

export default function GraphList() {
  const isVisible = useLayoutStore((state) => state.isGraphListVisibile);

  return (
    <div className={cn("w-full", isVisible ? "px-2 max-w-xs" : "max-w-0")}>
      {isVisible && <Header />}
      {isVisible && <Graphs />}
    </div>
  );
}

function Header() {
  const close = useLayoutStore((state) => {
    return () => state.setIsGraphListVisible(false);
  });
  const newGraph = useDialogFlowStore((state) => () => {
    if (state.graphId === null) return;
    state.setGraphId(null);
    state.setName("Untitled");
    state.setNodes([
      {
        id: "ghost",
        type: "ghost",
        position: { x: 0, y: 0 },
        data: { standalone: true },
      },
    ]);
    state.setEdges([]);
    state.setLastSaved(null);
    toast({ title: `New Dialog Flow created` });
  });

  return (
    <div className="h-14 flex items-center w-full gap-2">
      <button
        className="p-2 rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200"
        onClick={close}
      >
        <ChevronLeft className="size-4" />
      </button>

      <Button
        className="hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 gap-3 bg-white px-3 w-full h-9"
        variant="ghost"
        onClick={() => newGraph()}
      >
        <>
          <PlusSquare className="h-5 w-5" />
          New Graph
        </>
      </Button>
    </div>
  );
}

function Graphs() {
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  const user = useFetchUserDialogFlows();
  const universal = useFetchUniversalDialogFlows();

  const { activeId, loadGraph } = useDialogFlowStore((state) => ({
    activeId: state.graphId,
    async loadGraph(id: string, isUniversal: boolean) {
      if (state.graphId === id) return;
      setFetchingId(id);
      const graph = await fetchDialogFlow(id);
      setFetchingId(null);

      state.setSaveBlocked(isUniversal);
      state.setGraphId(id);
      state.setName(graph.name);
      state.setNodes(graph.nodes);
      state.setEdges(graph.edges);
      state.setLastSaved(new Date());
      state.setPublicGraph(false);
      toast({
        title: `Dialog Flow '${graph.name}' loaded`,
      });
    },
  }));

  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col gap-1 mt-2">
        <Label className="text-neutral-500 mb-2">User Created Graphs</Label>
        {!user.isPending ? (
          (user.data || []).map((item) => {
            const isFetching = fetchingId === item.id;
            const isSelected = fetchingId ? isFetching : activeId === item.id;
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
                {isFetching ? "Loading..." : item.name}
              </Button>
            );
          })
        ) : (
          <div className="text-sm flex items-center h-10 text-neutral-400">
            Loading...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 mt-4">
        <Label className="text-neutral-500 mb-2">Provided Graphs</Label>
        {!universal.isPending ? (
          (universal.data || []).map((item) => {
            const isFetching = fetchingId === item.id;
            const isSelected = fetchingId ? isFetching : activeId === item.id;
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
                {isFetching ? "Loading..." : item.name}
              </Button>
            );
          })
        ) : (
          <div className="text-sm flex items-center h-10 text-neutral-400">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
