import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";
import "./xy-theme.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Image from "next/image";
import {
  useDialogFlowStore,
  useGlobalDialogFlowStore,
  usePropertiesStore,
  useToolbarStore,
} from "./store";
import {
  createEmptyNode,
  GraphFlowEdge,
  GraphFlowNode,
  GraphFlowNodeTypes,
  nodeTypes,
} from "./nodes";
import Properties, { SelectedItem } from "./properties";
import { compileGraph } from "./compiler";
import { useShallow } from "zustand/react/shallow";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CircularDependencyError } from "@baileyherbert/dependency-graph";
import { toast } from "@/components/ui/use-toast";
import GraphList from "./graph-list";
import { useSaveDialogFlow } from "./api";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GlobeIcon, LockIcon, WandSparklesIcon } from "lucide-react";
import autoAlign from "./auto-align";

function Toolbar() {
  const { setType } = useToolbarStore();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    type: GraphFlowNodeTypes
  ) => {
    setType(type);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-row gap-2 z-10 bg-white absolute top-0 left-[50%] translate-x-[-50%] border-[1px] border-[#1a192b] p-4 rounded-lg gap-8">
      <div
        className="flex w-[100px] h-[100px] rounded-full bg-white border-[1px] border-[#1a192b] justify-center"
        onDragStart={(e) => onDragStart(e, "example")}
        draggable
      >
        <div className="text-[12px] self-center text-center">Example Node</div>
      </div>

      <div
        className="flex w-[100px] h-[100px] justify-center bg-transparent"
        onDragStart={(e) => onDragStart(e, "instruction")}
        draggable
      >
        <div className="flex -translate-x-[0.5px] w-[75px] h-[75px] rotate-45 bg-transparent border-[1px] border-[#1a192b] rounded-md self-center">
          <div className="-rotate-45 text-[12px] bg-transparent self-center text-center">
            Instruction Node
          </div>
        </div>
      </div>

      <div
        className="flex w-[100px] h-[100px] bg-white border-[1px] border-[#1a192b] justify-center"
        onDragStart={(e) => onDragStart(e, "context")}
        draggable
      >
        <div className="text-[12px] self-center text-center">Context Node</div>
      </div>

      <div
        className="flex w-[100px] h-[100px] bg-white border-[1px] border-[#1a192b] justify-center"
        onDragStart={(e) => onDragStart(e, "switch")}
        draggable
      >
        <div className="text-[12px] self-center text-center">Switch Node</div>
      </div>

      <div
        className="flex w-[100px] h-[100px] bg-white border-[1px] border-[#1a192b] justify-center"
        onDragStart={(e) => onDragStart(e, "relevant")}
        draggable
      >
        <div className="text-[12px] self-center text-center">Relevant Node</div>
      </div>

      <div
        className="flex w-[100px] h-[100px] bg-white border-[1px] border-[#1a192b] justify-center"
        onDragStart={(e) => onDragStart(e, "keyword-extractor")}
        draggable
      >
        <div className="text-[12px] self-center text-center">
          Keyword Extractor Node
        </div>
      </div>

      <div
        className="flex w-[100px] h-[100px] bg-white border-[1px] border-[#1a192b] justify-center"
        onDragStart={(e) => onDragStart(e, "pdf")}
        draggable
      >
        <div className="text-[12px] self-center text-center">PDF Node</div>
      </div>
    </div>
  );
}

function FlowGraph({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { screenToFlowPosition } = useReactFlow();

  const {
    name,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useDialogFlowStore();

  const { type } = useToolbarStore();

  const { setCompiledDialogFlow } = useGlobalDialogFlowStore();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const { setSelectedItem } = usePropertiesStore();

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const node = createEmptyNode(type, position);
      addNode(node);
    },
    [type, screenToFlowPosition, addNode]
  );

  const onNodeClick = (event: React.MouseEvent, node: GraphFlowNode) => {
    setSelectedItem({ id: node.id, type: "node" });
  };

  const onEdgeClick = (event: React.MouseEvent, edge: GraphFlowEdge) => {
    setSelectedItem({ id: edge.id, type: "edge" });
  };

  function injectGraph() {
    try {
      const prompt = compileGraph(nodes, edges);

      setCompiledDialogFlow({
        prompt,
        name,
      });

      setOpen(false);

      toast({
        title: `Dialog Flow activated: ${name}`,
        description: "The dialog flow has been activated in the conversation.",
      });
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        const node = nodes.find((n) => n.id === error.node);
        const path = error.path
          .map((n) => nodes.find((x) => x.id === n)?.data.label)
          .join(" -> ");
        toast({
          title: "Uh oh! Circular dependency detected.",
          description: `${node?.data.label} is causing a circular dependency. The path is: ${path}.`,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Uh oh! Something went wrong.",
          description:
            "Unknown error has occurred. Contact support if this persists.",
          variant: "destructive",
        });
      }

      console.error(error);
    }
  }

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes.map((node) => ({
        ...node,
        className: cn("group", node.className),
      }))}
      edges={edges}
      defaultEdgeOptions={{ labelBgPadding: [4, 2] }}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Controls />
        </TooltipTrigger>
        <TooltipContent side="right">
          Controls for the flow graph.
        </TooltipContent>
      </Tooltip>

      <div
        className="flex gap-4"
        style={{
          position: "absolute",
          right: "5px",
          bottom: "20px",
          zIndex: 4, // ensure it is above the graph
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              aria-label="Auto-align Graph"
              onClick={async () => {
                const changes = await autoAlign(nodes, edges);
                onNodesChange(changes);
              }}
            >
              <WandSparklesIcon className="size-[30px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            Auto-align the current graph.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              aria-label="Save Graph"
              onClick={injectGraph}
            >
              <Image
                src="/assets/icons/send-horizontal.svg"
                alt="send"
                width={30}
                height={30}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end" sideOffset={5}>
            Save the current graph to a query.
          </TooltipContent>
        </Tooltip>
      </div>

      <Toolbar />
    </ReactFlow>
  );
}

interface FlowEditorProps {
  setOpen: (open: boolean) => void;
}

function FlowEditor({ setOpen }: FlowEditorProps) {
  const { selectedItem: selectedItemId } = usePropertiesStore();

  const {
    name,
    setName,
    publicGraph,
    setPublicGraph,
    nodes,
    edges,
    lastSaved,
    setLastSaved,
    saveBlocked,
    model,
    setModel,
  } = useDialogFlowStore(
    useShallow((state) => ({
      name: state.name,
      setName: state.setName,
      publicGraph: state.publicGraph,
      setPublicGraph: state.setPublicGraph,
      nodes: state.nodes,
      edges: state.edges,
      lastSaved: state.lastSaved,
      setLastSaved: state.setLastSaved,
      saveBlocked: state.saveBlocked,
      model: state.model,
      setModel: state.setModel,
    }))
  );

  const selectedItem = useMemo<SelectedItem | null>(() => {
    if (!selectedItemId) return null;

    switch (selectedItemId.type) {
      case "node":
        const node = nodes.find((n) => n.id === selectedItemId.id);
        return node
          ? {
              type: "node",
              node,
            }
          : null;
      case "edge":
        const edge = edges.find((e) => e.id === selectedItemId.id);
        return edge
          ? {
              type: "edge",
              edge,
            }
          : null;
    }
  }, [nodes, edges, selectedItemId]);

  const { mutate: saveGraph, isPending } = useSaveDialogFlow({
    onSuccess: () => {
      setLastSaved(new Date());
    },
  });
  const debouncedSaveGraph = useDebouncedCallback(saveGraph, 1500, {
    maxWait: 5000,
  });

  useEffect(() => {
    if (nodes.length === 0 || edges.length === 0) return;
    if (saveBlocked) return;
    debouncedSaveGraph();
  }, [debouncedSaveGraph, nodes, edges, name, publicGraph]);

  return (
    <>
      <div className="flex flex-col min-h-[550px] min-w-[320px] h-full max-h-[85vh] grow">
        <nav className="flex flex-row justify-between items-center m-4 gap-4">
          <div className="flex flex-row gap-2 justify-center w-[180px]">
            <Switch
              checked={publicGraph}
              onCheckedChange={(checked) => setPublicGraph(checked)}
            />
            <Badge
              variant={publicGraph ? "default" : "secondary"}
              className="flex flex-row gap-2"
            >
              {publicGraph ? (
                <GlobeIcon className="h-4 w-4" />
              ) : (
                <LockIcon className="h-4 w-4" />
              )}

              {publicGraph ? "Public" : "Private"}
            </Badge>
          </div>

          <div className="flex flex-row gap-2 justify-center w-[180px]">
            <Switch
              checked={model === "GPT-4"}
              onCheckedChange={(checked) =>
                setModel(checked ? "GPT-4" : "Claude")
              }
            />
            <Badge
              variant={model === "GPT-4" ? "default" : "secondary"}
              className="flex flex-row gap-2"
            >
              {model === "GPT-4" ? "GPT-4" : "Claude"}
            </Badge>
          </div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your dialog flow"
          />

          <div className="w-[300px] flex flex-row justify-center">
            <Badge variant={isPending ? "default" : "secondary"}>
              {isPending ? "Saving: " : "Last saved: "}
              {lastSaved
                ? lastSaved.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </Badge>
          </div>
        </nav>
        <FlowGraph setOpen={setOpen} />
      </div>

      <nav
        className={cn(
          "relative transition-all flex flex-col w-[0px] border-l-[#e2e8f0] duration-300 ease-in-out overflow-auto scrollbar-thin",
          {
            "w-1/6": !!selectedItem,
          }
        )}
      >
        {selectedItem && <Properties selectedItem={selectedItem} />}
      </nav>
    </>
  );
}

const queryClient = new QueryClient();

export function FlowModal() {
  const [open, setOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        <TooltipProvider delayDuration={0}>
          <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
              <DialogTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "hover:bg-[#E2E8F0] bg-[transparent] h-[56px] w-[56px] absolute left-[-115px]"
                    )}
                    type="button"
                    aria-label="Flow Graph"
                  >
                    <Image
                      src="/assets/icons/route.svg"
                      alt="send"
                      width={30}
                      height={30}
                    />
                  </Button>
                </TooltipTrigger>
              </DialogTrigger>
              <TooltipContent>Open Dialog Flows</TooltipContent>
            </Tooltip>
            <DialogContent
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[85vw] flex flex-col gap-5 overflow-auto box-border"
            >
              <div className="flex flex-row min-h-[550px] min-w-[320px] h-full max-h-[85vh]">
                <GraphList />
                <FlowEditor setOpen={setOpen} />
              </div>
            </DialogContent>
          </Dialog>
        </TooltipProvider>
      </ReactFlowProvider>
    </QueryClientProvider>
  );
}
