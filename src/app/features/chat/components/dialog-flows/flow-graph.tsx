import { useGlobalContext } from "@/app/store/global-context";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
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
  usePropertiesStore,
  useToolbarStore,
} from "./store";
import ExampleNode from "./nodes/example-node";
import InstructionNode from "./nodes/instruction-node";
import ContextNode from "./nodes/context-node";
import {
  createEmptyNode,
  GraphFlowEdge,
  GraphFlowNode,
  GraphFlowNodeTypes,
} from "./nodes";
import Properties from "./properties";
import SwitchNode from "./nodes/switch-node";

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
    <div className="flex flex-row gap-2 z-10 bg-white absolute bottom-0 left-[50%] translate-x-[-50%] border-[1px] border-[#1a192b] p-4 rounded-lg gap-8">
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
    </div>
  );
}

function FlowGraph({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      example: ExampleNode,
      instruction: InstructionNode,
      context: ContextNode,
      switch: SwitchNode,
    }),
    []
  );

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useDialogFlowStore();

  const { type } = useToolbarStore();

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

  return (
    <div className="flex flex-row min-h-[550px] min-w-[320px] h-full max-h-[85vh] grow">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
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

        <Background />

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              style={{
                position: "absolute",
                right: "5px",
                bottom: "20px",
                zIndex: 4, // ensure it is above the graph
              }}
            >
              <Button variant="ghost" type="button" aria-label="Save Graph">
                <Image
                  src="/assets/icons/send-horizontal.svg"
                  alt="send"
                  width={30}
                  height={30}
                />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={5}>
            Save the current graph to a query.
          </TooltipContent>
        </Tooltip>

        <Toolbar />
      </ReactFlow>
    </div>
  );
}

export function FlowModal() {
  const [open, setOpen] = useState(false);
  const { selectedItem } = usePropertiesStore();

  return (
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
              <FlowGraph setOpen={setOpen} />

              <nav
                className={cn(
                  "relative transition-all flex flex-col w-[0px] border-l-[#e2e8f0] duration-300 ease-in-out h-screen overflow-auto scrollbar-thin",
                  {
                    "w-1/3": !!selectedItem,
                  }
                )}
              >
                <Properties />
              </nav>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </ReactFlowProvider>
  );
}
