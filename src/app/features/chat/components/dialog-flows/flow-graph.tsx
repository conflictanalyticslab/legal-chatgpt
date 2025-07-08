import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  MiniMap,
  useStore,
  reconnectEdge,
  SelectionMode,
  Background,
  BackgroundVariant,
  useViewport,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";
import "./xy-theme.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import Properties from "./properties";
import { compileGraph } from "./compiler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CircularDependencyError } from "@baileyherbert/dependency-graph";
import { toast } from "@/components/ui/use-toast";
import GraphList from "./graph-list";
import { useGenerateDialogFlow, useSaveDialogFlow } from "./api";
import { useDebounce } from "use-debounce";
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
  RefreshCcw,
} from "lucide-react";
import autoAlign from "./auto-align";
import { DIAMETER } from "./nodes/circular-node";
import NodeContextMenu from "./node-context-menu";
import NodeSelectionMenu, {
  type NodeSelectionMenuHandle,
} from "./node-selection-menu";
import { useLayoutStore } from "./layout-store";
import Share from "./share";
import Controls from "./controls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";


function Toolbar({ onAdd }: { onAdd(): void }) {
  const viewport = useViewport();
  const { setType } = useToolbarStore();
  const { nodes, setNodes, addNode } = useDialogFlowStore();

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    type: GraphFlowNodeTypes
  ) => {
    setType(type);
    event.dataTransfer.effectAllowed = "move";
  };

  const onClick = (type: GraphFlowNodeTypes) => {
    // prettier-ignore
    const isStandaloneGhostExist = nodes.length === 1 && nodes.find((node) => node.type === "ghost" && node.data.standalone);
    if (isStandaloneGhostExist) setNodes([]);

    const el = document.querySelector(".react-flow");
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const node = createEmptyNode(type, {
      x: (rect.width / 2 - viewport.x) / viewport.zoom - DIAMETER / 2,
      y: (rect.height / 2 - viewport.y) / viewport.zoom - DIAMETER / 2,
    });
    addNode(node);
    onAdd();
  };

  return (
    <div className="bg-white absolute bottom-0 left-[50%] translate-x-[-50%] z-10 border border-b-0 border-neutral-200 px-4 pb-2 rounded-t-lg">
      <div className="flex gap-4 -mt-10">
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "example")}
          onClick={() => onClick("example")}
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
          onClick={() => onClick("instruction")}
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
          onClick={() => onClick("context")}
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
          onClick={() => onClick("switch")}
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
          onClick={() => onClick("relevant")}
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
          onClick={() => onClick("keyword-extractor")}
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
          onDragStart={(e) => onDragStart(e, "extractor")}
          onClick={() => onClick("extractor")}
          draggable
        >
          <div className="w-[80px] h-[80px] rounded-full bg-neutral-200 flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
            <Brain className="size-8 text-neutral-700" />
          </div>
          <div className="text-sm text-center">
            Extractor
          </div>
        </div>
        <div
          className="flex flex-col gap-2 items-center group"
          onDragStart={(e) => onDragStart(e, "pdf")}
          onClick={() => onClick("pdf")}
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
  const isLocked = useStore((s) => !s.nodesConnectable);
  const { screenToFlowPosition } = useReactFlow();

  const nodeSelectionMenuRef = useRef<NodeSelectionMenuHandle>(null);

  const {
    origin,
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addEdge,
  } = useDialogFlowStore();

  const { type } = useToolbarStore();

  const { isGraphListVisibile } = useLayoutStore();
  const { setIsOutdated } = useGlobalDialogFlowStore();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const { setSelectedItem } = usePropertiesStore();

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isLocked) return;

    if (!type) return;

    // prettier-ignore
    const isStandaloneGhostExist = nodes.length === 1 && nodes.find((node) => node.type === "ghost" && node.data.standalone);
    if (isStandaloneGhostExist) setNodes([]);

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const node = createEmptyNode(type, position);
    addNode(node);
  };

  const onNodeClick = (e: React.MouseEvent, node: GraphFlowNode) => {
    if (node.type === "ghost") {
      if (isLocked) return;
      return nodeSelectionMenuRef.current?.open("add", node);
    }

    const target = e.target as HTMLElement;
    const isSourceHandle =
      target.classList.contains("react-flow__handle") &&
      target.classList.contains("source");
    if (!isSourceHandle) {
      setSelectedItem({ id: node.id, type: "node" });
      return;
    }

    if (isLocked) return;

    const handleId = target.dataset.handleid;

    const hasGhostNode = edges.some((edge) => {
      if (edge.source !== node.id) return false;
      if (handleId && edge.sourceHandle !== handleId) return false;

      const targetNode = nodes.find((n) => n.id === edge.target);
      return targetNode?.type === "ghost";
    });
    if (hasGhostNode) return;

    const x = node.position.x + 200;
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

      const offset = Math.abs(index - middleIndex) * ((DIAMETER / 2) * 3);
      y = index < middleIndex ? y - offset : y + offset;
    } else {
      while (nodes.some((n) => n.position.x === x && n.position.y === y)) {
        y = y - (DIAMETER / 2) * 3;
      }
    }

    const ghost = createEmptyNode("ghost", { x, y });
    addNode(ghost);

    addEdge({
      id: `e-${node.id}-${ghost.id}`,
      source: node.id,
      sourceHandle: handleId,
      target: ghost.id,
    });
    setUpdate((prev) => prev + 1);
    setIsOutdated(true);
  };

  const edgeReconnectSuccessful = useRef(true);

  const onEdgeClick = (e: React.MouseEvent, edge: GraphFlowEdge) => {
    setSelectedItem({ id: edge.id, type: "edge" });
  };

  type ContextMenu = {
    node: GraphFlowNode;
    position: { x: number; y: number };
  };
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const onNodeContextMenu = (e: React.MouseEvent, node: GraphFlowNode) => {
    e.preventDefault();
    if (isLocked) return;

    setContextMenu({
      node,
      position: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  };

  const save = useSaveDialogFlow();

  const [update, setUpdate] = useState(0);
  const [debouncedUpdate] = useDebounce(update, 1000);

  useEffect(() => {
    if (!debouncedUpdate) return;
    if (nodes.length === 1 && nodes[0].type === "ghost") return;
    save.mutate();
  }, [debouncedUpdate]);

  return (
    <div
      className={cn(
        "bg-white flex-1 border-l border-t border-neutral-200",
        isGraphListVisibile && "rounded-tl-lg"
      )}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={{ labelBgPadding: [4, 2] }}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          if (changes.every((change) => change.type === "select")) return;
          if (changes.every((change) => change.type === "dimensions")) return;
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          if (changes.every((change) => change.type === "select")) return;
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
        onConnect={(connection) => {
          onConnect(connection);
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
        onReconnectStart={() => {
          edgeReconnectSuccessful.current = false;
        }}
        onReconnect={(oldEdge, newConnection) => {
          edgeReconnectSuccessful.current = true;
          setEdges(reconnectEdge(oldEdge, newConnection, edges));
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
        onReconnectEnd={(_, edge) => {
          if (!edgeReconnectSuccessful.current) {
            setEdges(edges.filter((e) => e.id !== edge.id));
            setUpdate((prev) => prev + 1);
            setIsOutdated(true);
          }
          edgeReconnectSuccessful.current = true;
        }}
        onDragOver={onDragOver}
        onDrop={(e) => {
          onDrop(e);
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeClick={onEdgeClick}
        fitView
        minZoom={0.1}
        maxZoom={2}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        snapToGrid
        snapGrid={[10, 10]}
        onlyRenderVisibleElements
      >
        <Background variant={BackgroundVariant.Dots} gap={[20, 20]} />
        <Controls />
        {!isLocked && <Toolbar onAdd={() => setUpdate((prev) => prev + 1)} />}
        {origin === "shared" && (
          <Button
            className="absolute bottom-2.5 left-[50%] translate-x-[-50%] z-10"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? "Copying..." : "Make a Copy"}
          </Button>
        )}
        <MiniMap position="top-left" />
        {contextMenu && (
          <NodeContextMenu
            {...contextMenu}
            onReplace={() => {
              setContextMenu(null);
              nodeSelectionMenuRef.current?.open("replace", contextMenu.node);
            }}
            onClose={() => setContextMenu(null)}
          />
        )}
      </ReactFlow>

      <NodeSelectionMenu
        ref={nodeSelectionMenuRef}
        onReplace={() => {
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
      />
    </div>
  );
}

interface FlowEditorProps {
  setOpen: (open: boolean) => void;
}

function FlowEditor({ setOpen }: FlowEditorProps) {
  const { fitView } = useReactFlow();
  const { isGraphListVisibile, showGraphList } = useLayoutStore((state) => ({
    isGraphListVisibile: state.isGraphListVisibile,
    showGraphList() {
      state.setIsGraphListVisible(true);
    },
  }));
  const {
    origin,
    graphId,
    name,
    setName,
    nodes,
    onNodesChange,
    edges,
    publicGraph,
    setPublicGraph,
    lastSaved,
  } = useDialogFlowStore();
  const {
    isOutdated,
    setIsOutdated,
    compiledDialogFlow,
    setCompiledDialogFlow,
  } = useGlobalDialogFlowStore();

  // const { setLastSaved } = useDialogFlowStore(
  //   useShallow((state) => ({
  //     setLastSaved: state.setLastSaved,
  //   }))
  // );

  function injectGraph() {
    try {
      if (isOutdated || !compiledDialogFlow) {
        const prompt = compileGraph(graphId, nodes, edges); // has access to graphId
        setCompiledDialogFlow({ prompt, name });
      } else {
        setCompiledDialogFlow({ name, prompt: compiledDialogFlow.prompt });
      }

      setOpen(false); // Closes the current window.

      toast({
        title: `Dialog Flow activated: ${name}`,
        description: "The dialog flow has been activated in the conversation.",
      });
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        const node = nodes.find((n) => n.id === error.node);
        const path = error.path
          .map((n) => {
            const node = nodes.find((x) => x.id === n);
            return node?.data
              ? "label" in node.data
                ? node.data.label
                : node.type
              : node?.type;
          })
          .join(" -> ");

        const label = node?.data
          ? "label" in node.data
            ? node.data.label
            : node.type
          : node?.type;
        toast({
          title: "Uh oh! Circular dependency detected.",
          description: `${label} is causing a circular dependency. The path is: ${path}.`,
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

  // Saves the current user's graph at a given time.
  function saveCurrentGraph() {
    try {
      setUpdate((prev) => prev + 1);
      
      toast({
        title: `Dialog Flow saved: ${name}`,
        description: "The dialog flow has been saved to cloud.",
      });
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        const node = nodes.find((n) => n.id === error.node);
        const path = error.path
          .map((n) => {
            const node = nodes.find((x) => x.id === n);
            return node?.data
              ? "label" in node.data
                ? node.data.label
                : node.type
              : node?.type;
          })
          .join(" -> ");

        const label = node?.data
          ? "label" in node.data
            ? node.data.label
            : node.type
          : node?.type;
        toast({
          title: "Uh oh! Circular dependency detected.",
          description: `${label} is causing a circular dependency. The path is: ${path}.`,
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

  const save = useSaveDialogFlow();
  const generate = useGenerateDialogFlow({
    onSuccess() {
      setUpdate((prev) => prev + 1);
      setIsOutdated(true);
    },
  });

  const [update, setUpdate] = useState(0);
  const [debouncedUpdate] = useDebounce(update, 1000);

  useEffect(() => {
    if (!debouncedUpdate) return;
    save.mutate();
  }, [debouncedUpdate]);

  return (
    <div className="flex flex-col h-full grow">
      <nav
        className={cn(
          "grid grid-cols-3 gap-4 py-2 items-center pr-2.5",
          !isGraphListVisibile && "pl-2.5"
        )}
      >
        <div className="flex items-center gap-2">
          {!isGraphListVisibile ? (
            <button
              className="rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200 bg-white size-9 flex items-center justify-center"
              onClick={showGraphList}
            >
              <ChevronRight className="size-4" />
            </button>
          ) : null}

          <Share />

          {lastSaved ? (
            <div className="text-left shrink-0 text-neutral-500 text-sm">
              Last saved:{" "}
              {new Date(lastSaved).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          ) : null}
        </div>

        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setUpdate((prev) => prev + 1);
          }}
          disabled={origin === "universal"}
          placeholder="Name your dialog flow"
          className="text-center bg-transparent border-transparent focus:bg-white focus:border-neutral-300 hover:border-neutral-300"
        />

        <div className="flex gap-4 justify-end items-center">
          {/* {origin === "user" && (
            <Select
              value={model}
              onValueChange={(value) => setModel(value as typeof model)}
            >
              <SelectTrigger className="border-neutral-200 bg-white shadow-none w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPT-4">GPT-4</SelectItem>
                <SelectItem value="Claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          )} */}

          {origin === "user" && (
            <div className="flex gap-2 items-center">
              <Switch
                checked={publicGraph}
                onCheckedChange={(checked) => {
                  setPublicGraph(checked);
                  setUpdate((prev) => prev + 1);
                }}
              />
              <Badge
                variant={publicGraph ? "default" : "secondary"}
                className="flex gap-2 p-1 pr-3"
              >
                {publicGraph ? (
                  <GlobeIcon className="size-4" />
                ) : (
                  <LockIcon className="size-4" />
                )}
                {publicGraph ? "Public" : "Private"}
              </Badge>
            </div>
          )}

          <div className="flex gap-2">
            {!graphId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    aria-label="Generate Graph"
                    onClick={async () => {
                      const query = prompt("What would you like to generate?"); // TODO
                      if (!query) return;
                      generate.mutate(query);
                    }}
                    disabled={generate.isPending}
                    className="size-9 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-200 p-0"
                  >
                    <RefreshCcw
                      className={cn(
                        "size-4",
                        generate.isPending && "animate-spin"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5}>
                  Generate graph.
                </TooltipContent>
              </Tooltip>
            )}

            {origin !== "shared" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    aria-label="Auto-align Graph"
                    onClick={async () => {
                      onNodesChange(await autoAlign(nodes, edges));
                      setUpdate((prev) => prev + 1);
                      window.requestAnimationFrame(() => fitView());
                    }}
                    className="size-9 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-200 p-0"
                  >
                    <WandSparklesIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5}>
                  Auto-align the current graph.
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  aria-label="Save Graph"
                  onClick={saveCurrentGraph}
                  className="size-9 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-200 p-0"
                >
                  <Image
                    src="/assets/icons/save-cloud.svg"
                    alt="save"
                    width={16}
                    height={16}
                  />
                </Button>
              </TooltipTrigger>
              {origin !== "shared" ? (
                <TooltipContent side="top" align="end" sideOffset={5}>
                  Save the current graph.
                </TooltipContent>
              ) : (
                <TooltipContent side="top" align="end" sideOffset={5}>
                  Save the current graph as a copy.
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  aria-label="Save & Use Graph"
                  onClick={injectGraph}
                  className="size-9 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-200 p-0"
                >
                  <Image
                    src="/assets/icons/send-horizontal.svg"
                    alt="send"
                    width={16}
                    height={16}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="end" sideOffset={5}>
                Save and send the current graph to a query.
              </TooltipContent>
            </Tooltip>
          </div>

          {graphId && <SaveCompiledDialogFlow />}

          <DialogClose className="size-9 flex items-center justify-center rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200 bg-white">
            <X className="size-4" />
          </DialogClose>
        </div>
      </nav>

      <FlowGraph setOpen={setOpen} />

      <Properties
        onUpdate={() => {
          setUpdate((prev) => prev + 1);
          setIsOutdated(true);
        }}
      />
    </div>
  );
}

function SaveCompiledDialogFlow() {
  const { graphId, name, nodes, edges } = useDialogFlowStore();
  const { isOutdated, compiledDialogFlow, setCompiledDialogFlow } =
    useGlobalDialogFlowStore();

  const [value, setValue] = useState("");
  const hasChanges = value !== compiledDialogFlow?.prompt;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 bg-white px-3 h-9"
          variant="ghost"
          onClick={() => {
            if (isOutdated || !compiledDialogFlow) {
              const prompt = compileGraph(graphId, nodes, edges); // does not have access to graphId
              setCompiledDialogFlow({ prompt, name });
              setValue(prompt);
            } else {
              setValue(compiledDialogFlow.prompt);
            }
          }}
        >
          Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[1024px] max-h-[calc(100vh-48px)] p-4 flex flex-col gap-4 w-full !top-6 !translate-y-[unset]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center pt-1">
            <span>Dialog Flow Prompt</span>
            {hasChanges && (
              <span className="text-xs text-amber-500 font-normal">
                Unsaved changes
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Edit the prompt to adjust how responses are generated. Changes apply
            only to this session and won't be saved.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          className="flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <DialogClose asChild>
          <Button
            className={cn("w-full", !hasChanges && "opacity-50")}
            disabled={!hasChanges}
            onClick={() => {
              setCompiledDialogFlow({
                name: compiledDialogFlow!.name,
                prompt: value.trim(),
                isCustom: true,
              });
            }}
          >
            Save
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
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
              onInteractOutside={(e) => e.preventDefault()}
            >
              <GraphList />
              <FlowEditor setOpen={setOpen} />
            </DialogContent>
          </Dialog>
        </TooltipProvider>
      </ReactFlowProvider>
    </QueryClientProvider>
  );
}
