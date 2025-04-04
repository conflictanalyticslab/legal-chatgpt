import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { ChevronLeft, PlusSquare, Trash } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  fetchDialogFlow,
  useFetchUserDialogFlows,
  useFetchPublicDialogFlows,
  useFetchSharedDialogFlows,
  useFetchUniversalDialogFlows,
  type DialogFlowListItem,
  useDeleteDialogFlow,
} from "./api";
import { useDialogFlowStore } from "./store";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "./layout-store";

function useNewGraph() {
  const { setCenter } = useReactFlow();
  const temporal = useDialogFlowStore.temporal.getState();
  return useDialogFlowStore((state) => () => {
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
    state.setOrigin("user");
    state.setLastSaved(null);
    temporal.clear();
    toast({ title: `New Dialog Flow created` });
    window.requestAnimationFrame(() => setCenter(0, 0, { zoom: 1 }));
  });
}

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

  const newGraph = useNewGraph();

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
  const pub = useFetchPublicDialogFlows();
  const shared = useFetchSharedDialogFlows();
  const universal = useFetchUniversalDialogFlows();

  return (
    <div className="overflow-y-auto h-[calc(100%-56px)] pb-2">
      <Section
        origin="user"
        title="User Created Graphs"
        graphs={user.data || []}
        isLoading={user.isPending}
      />

      {!pub.isPending && pub.data?.length ? (
        <Section origin="shared" title="Public Graphs" graphs={pub.data} />
      ) : null}

      {!shared.isPending && shared.data?.length ? (
        <Section origin="shared" title="Shared Graphs" graphs={shared.data} />
      ) : null}

      <Section
        origin="universal"
        title="Provided Graphs"
        graphs={universal.data || []}
        isLoading={universal.isPending}
      />
    </div>
  );
}

type SectionProps = {
  origin: "user" | "shared" | "universal";
  title: string;
  graphs: DialogFlowListItem[];
  isLoading?: boolean;
};

function Section({ origin, title, graphs, isLoading }: SectionProps) {
  const { fitView } = useReactFlow();

  const [isExpanded, setIsExpanded] = useState(false);

  const temporal = useDialogFlowStore.temporal.getState();
  const newGraph = useNewGraph();
  const { activeId, fetchingId, loadGraph } = useDialogFlowStore((state) => ({
    activeId: state.graphId,
    fetchingId: state.fetchingId,

    async loadGraph(id: string) {
      if (state.graphId === id) return;
      state.setFetchingId(id);
      const graph = await fetchDialogFlow(id);
      state.setFetchingId(null);

      state.setOrigin(origin);
      state.setGraphId(id);
      state.setName(graph.name);
      state.setNodes(graph.nodes);
      state.setEdges(graph.edges);
      state.setSharedWith(graph.shared_with || []);
      state.setLastSaved(graph.updated_at || null);
      state.setPublicGraph(graph.public || false);
      window.requestAnimationFrame(() => fitView());
      temporal.clear();
      toast({ title: `Dialog Flow '${graph.name}' loaded` });
    },
  }));

  const del = useDeleteDialogFlow();

  return (
    <div className="flex flex-col gap-1 mt-2">
      <Label className="text-neutral-500 mb-2">{title}</Label>
      {!isLoading ? (
        <>
          {(isExpanded ? graphs : graphs.slice(0, 5)).map((item) => {
            const isFetching = fetchingId === item.id;
            const isDeleting = del.variables === item.id && del.isPending;
            const isSelected = fetchingId ? isFetching : activeId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "justify-start flex items-center h-10 rounded-md text-sm group",
                  isSelected
                    ? "bg-neutral-950 text-white"
                    : "hover:bg-neutral-200 border border-transparent hover:border-neutral-300",
                  isDeleting && "text-neutral-400"
                )}
              >
                <button
                  className="px-3 flex-1 py-2 text-left truncate"
                  onClick={() => loadGraph(item.id)}
                >
                  {isFetching
                    ? "Loading..."
                    : isDeleting
                    ? "Deleting..."
                    : item.name}
                </button>
                {origin === "user" && !isDeleting && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className={cn(
                          "aspect-square flex items-center justify-center shrink-0 group-hover:text-red-500 hover:bg-red-500 size-10 -m-px rounded-r-md hover:!text-red-100",
                          isSelected ? "text-neutral-700" : "text-neutral-300"
                        )}
                      >
                        <Trash className="size-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your graph.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 text-white hover:bg-red-400"
                          onClick={() => {
                            del.mutate(item.id);
                            if (isSelected) newGraph();
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
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
