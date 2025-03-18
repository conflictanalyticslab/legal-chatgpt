import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  useReactFlow,
  MiniMap,
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
import {
  ChevronRight,
  GlobeIcon,
  LockIcon,
  WandSparklesIcon,
  X,
  StickyNote,
  Info,
  Brain,
  TextSearch,
  FileText,
} from "lucide-react";
import autoAlign from "./auto-align";
import { DIAMETER } from "./nodes/circular-node";
import NodeContextMenu from "./node-context-menu";
import NodeSelectionMenu from "./node-selection-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose } from "@radix-ui/react-dialog";

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
    <div className="bg-white absolute bottom-0 left-[50%] translate-x-[-50%] z-10 border border-b-0 border-neutral-200 px-4 pb-2 rounded-t-lg">
      <div className="flex gap-4 -mt-10">
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "example")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            <StickyNote className="size-8 text-neutral-700" />
          </div>
          <div className="text-sm text-center">Example</div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "instruction")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            <Info className="size-8 text-neutral-700" />
          </div>
          <div className="text-sm text-center">Instruction</div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "context")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            <Brain className="size-8 text-neutral-700" />
          </div>
          <div className="text-sm text-center">Context</div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "switch")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            🚦
          </div>
          <div className="text-sm text-center">Switch</div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "relevant")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            🤔
          </div>
          <div className="text-sm text-center">Relevant</div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "keyword-extractor")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            <TextSearch className="size-8 text-neutral-700" />
          </div>
          <div className="text-sm text-center">
            Keyword
            <br />
            Extractor
          </div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "pdf")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            <FileText className="size-8 text-neutral-700" />
          </div>
          <div className="text-sm text-center">PDF</div>
        </div>
      </div>
    </div>
  );
}

function FlowGraph({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [activeGhost, setActiveGhost] = useState<HTMLElement | null>(null);

  const {
    name,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addEdge,
  } = useDialogFlowStore();

  const { type } = useToolbarStore();

  const { setCompiledDialogFlow } = useGlobalDialogFlowStore();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const { selectedItem, setSelectedItem } = usePropertiesStore();

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

  const onNodeClick = (e: React.MouseEvent, node: GraphFlowNode) => {
    if (node.type === "ghost") {
      return setActiveGhost(e.currentTarget as HTMLElement);
    }

    const target = e.target as HTMLElement;
    const isSourceHandle =
      target.classList.contains("react-flow__handle") &&
      target.classList.contains("source");
    if (!isSourceHandle) {
      return setSelectedItem({ id: node.id, type: "node" });
    }

    const handleId = target.dataset.handleid;

    const hasGhostNode = edges.some((edge) => {
      if (edge.source !== node.id) return false;
      if (handleId && edge.sourceHandle !== handleId) return false;

      const targetNode = nodes.find((n) => n.id === edge.target);
      return targetNode?.type === "ghost";
    });
    if (hasGhostNode) return;

    let y = node.position.y;
    if (handleId && (node.type === "switch" || node.type === "relevant")) {
      let index = 0;
      let middleIndex = 0;

      switch (node.type) {
        case "switch":
          const ids = [...node.data.conditions.map((c) => c.id), "else"];
          index = ids.findIndex((id) => id === handleId);
          middleIndex = (ids.length - 1) / 2;
          break;
        case "relevant":
          switch (handleId) {
            case "relevant":
              index = 0;
              break;
            case "notRelevant":
              index = 1;
              break;
            default:
              return;
          }
          middleIndex = (2 - 1) / 2;
          break;
        default:
          return;
      }

      const offset = Math.abs(index - middleIndex) * (DIAMETER + 10);
      y = index < middleIndex ? y - offset : y + offset;
    }

    const ghostId = `ghost-${node.id}-${Date.now()}`;
    addNode({
      id: ghostId,
      type: "ghost",
      position: {
        x: node.position.x + 200,
        y,
      },
      data: {},
    });

    addEdge({
      id: `e-${node.id}-${ghostId}`,
      source: node.id,
      sourceHandle: handleId,
      target: ghostId,
    });
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

  type ContextMenu = {
    node: GraphFlowNode;
    position: { x: number; y: number };
  };
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const onNodeContextMenu = (e: React.MouseEvent, node: GraphFlowNode) => {
    e.preventDefault();

    setContextMenu({
      node,
      position: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  };

  return (
    <div
      className={cn(
        "bg-white flex-1 border-x border-t border-neutral-200",
        selectedItem ? "rounded-t-lg" : "rounded-tl-lg"
      )}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={{ labelBgPadding: [4, 2] }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeClick={onEdgeClick}
        fitView
      >
        <Controls />
        <Toolbar />
        <MiniMap position="top-right" />
        {contextMenu && (
          <NodeContextMenu
            {...contextMenu}
            onClose={() => setContextMenu(null)}
          />
        )}

        <div className="flex gap-2 absolute bottom-[15px] right-[15px] z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                type="button"
                aria-label="Auto-align Graph"
                onClick={async () => {
                  const changes = await autoAlign(nodes, edges);
                  onNodesChange(changes);
                  window.requestAnimationFrame(() => fitView());
                }}
                className="p-2.5 h-[unset] border-neutral-200 aspect-square"
              >
                <WandSparklesIcon className="size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5}>
              Auto-align the current graph.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                type="button"
                aria-label="Save Graph"
                onClick={injectGraph}
                className="p-2.5 h-[unset] border-neutral-200 aspect-square"
              >
                <Image
                  src="/assets/icons/send-horizontal.svg"
                  alt="send"
                  width={24}
                  height={24}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="end" sideOffset={5}>
              Save the current graph to a query.
            </TooltipContent>
          </Tooltip>
        </div>
      </ReactFlow>

      <NodeSelectionMenu
        ghostRef={activeGhost}
        onClose={() => setActiveGhost(null)}
      />
    </div>
  );
}

interface FlowEditorProps {
  setOpen: (open: boolean) => void;
}

function FlowEditor({ setOpen }: FlowEditorProps) {
  const { selectedItem: selectedItemId, setSelectedItem } =
    usePropertiesStore();

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
      <div className="flex flex-col h-full grow">
        <nav
          className={cn(
            "grid grid-cols-3 gap-4 p-2 items-center pl-[15px]",
            selectedItem ? "pr-[15px]" : "pr-[50px]"
          )}
        >
          <div className="text-left shrink-0 text-neutral-500 text-sm">
            {isPending ? "Saving: " : "Last saved: "}
            {lastSaved
              ? lastSaved.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Never"}
          </div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your dialog flow"
            className="text-center bg-transparent border-transparent focus:bg-white focus:border-neutral-300 hover:border-neutral-300"
          />

          <div className="flex gap-4 justify-end items-center">
            <Select defaultValue="GPT-4">
              <SelectTrigger className="border-neutral-200 bg-white shadow-none w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPT-4">GPT-4</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Switch
                checked={publicGraph}
                onCheckedChange={(checked) => setPublicGraph(checked)}
              />
              <Badge
                variant={publicGraph ? "default" : "secondary"}
                className="flex gap-2"
              >
                {publicGraph ? (
                  <GlobeIcon className="h-4 w-4" />
                ) : (
                  <LockIcon className="h-4 w-4" />
                )}

                {publicGraph ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </nav>

        <FlowGraph setOpen={setOpen} />
      </div>

      <nav
        className={cn(
          "relative flex flex-col w-full transition-all overflow-auto shrink-0 pt-14",
          selectedItem ? "max-w-xs" : "max-w-0"
        )}
      >
        <button
          className="absolute top-14 right-2 p-2 rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200"
          onClick={() => setSelectedItem(null)}
        >
          <ChevronRight className="size-4" />
        </button>
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
              className="size-full !rounded-none flex max-w-[unset] bg-neutral-100 p-0 outline-none border-0 gap-0"
              useDefaultClose={false}
            >
              <DialogClose className="fixed top-[11px] right-2 p-2 rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200 bg-white">
                <X className="size-4" />
              </DialogClose>
              <GraphList />
              <FlowEditor setOpen={setOpen} />
            </DialogContent>
          </Dialog>
        </TooltipProvider>
      </ReactFlowProvider>
    </QueryClientProvider>
  );
}
