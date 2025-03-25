import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { ChevronLeft, PlusSquare } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import {
  fetchDialogFlow,
  useFetchUserDialogFlows,
  useFetchSharedDialogFlows,
  useFetchUniversalDialogFlows,
  type DialogFlowListItem,
} from "./api";
import { useDialogFlowStore } from "./store";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "./layout-store";

export default function GraphList() {
  const isVisible = useLayoutStore((state) => state.isGraphListVisibile);
  if (!isVisible) return;

  return (
    <div className="w-full px-2.5 max-w-xs">
      <Header />
      <Graphs />
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
        className="size-9 flex items-center justify-center shrink-0 rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200 bg-white"
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
  const user = useFetchUserDialogFlows();
  const shared = useFetchSharedDialogFlows();
  const universal = useFetchUniversalDialogFlows();

  return (
    <div className="overflow-y-auto h-[calc(100%-56px)] pb-2">
      <Section
        title="User Created Graphs"
        graphs={user.data || []}
        isLoading={user.isPending}
      />

      {!shared.isPending && shared.data?.length ? (
        <Section title="Shared Graphs" graphs={shared.data} />
      ) : null}

      <Section
        title="Provided Graphs"
        graphs={universal.data || []}
        isLoading={universal.isPending}
      />
    </div>
  );
}

type SectionProps = {
  title: string;
  graphs: DialogFlowListItem[];
  isLoading?: boolean;
};

function Section({ title, graphs, isLoading }: SectionProps) {
  const { fitView } = useReactFlow();

  const [isExpanded, setIsExpanded] = useState(false);

  const { activeId, fetchingId, loadGraph } = useDialogFlowStore((state) => ({
    activeId: state.graphId,
    fetchingId: state.fetchingId,

    async loadGraph(id: string, isUniversal: boolean) {
      if (state.graphId === id) return;
      state.setFetchingId(id);
      const graph = await fetchDialogFlow(id);
      state.setFetchingId(null);

      state.setSaveBlocked(isUniversal);
      state.setGraphId(id);
      state.setName(graph.name);
      state.setNodes(graph.nodes);
      state.setEdges(graph.edges);
      state.setSharedWith(graph.shared_with || []);
      state.setLastSaved(graph.updated_at || null);
      state.setPublicGraph(graph.public || false);
      toast({
        title: `Dialog Flow '${graph.name}' loaded`,
      });
      window.requestAnimationFrame(() => fitView());
    },
  }));

  return (
    <div className="flex flex-col gap-1 mt-2">
      <Label className="text-neutral-500 mb-2">{title}</Label>
      {!isLoading ? (
        <>
          {(isExpanded ? graphs : graphs.slice(0, 5)).map((item) => {
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
          })}
          {graphs.length > 5 ? (
            <button
              className="font-semibold self-start text-sm px-3 hover:underline"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? "Show Less" : "Show All"}
            </button>
          ) : null}
        </>
      ) : (
        <div className="text-sm flex items-center h-10 text-neutral-400">
          Loading...
        </div>
      )}
    </div>
  );
}
