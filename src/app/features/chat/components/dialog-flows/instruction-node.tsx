import React from "react";
import { Handle, Position, Node, NodeProps } from '@xyflow/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { DFNode } from "./df-node";
 
export function InstructionNode({ data }: NodeProps<DFNode>) {
  // split a string to lines of 50 characters
  const lines: string[] = [];
  
  if (data.body.length <= 50) {
    lines.push(data.body);
  } else {
    let startIndex = 0;
    while (startIndex < data.body.length) {
      lines.push(data.body.substring(startIndex, startIndex+50));
      startIndex += 50;
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex w-[100px] h-[100px] justify-center bg-transparent">
            <div className="flex -translate-x-[0.5px] w-[75px] h-[75px] rotate-45 bg-transparent border-[1px] border-[#1a192b] rounded-md self-center">
              <div className="-rotate-45 text-[12px] bg-transparent self-center">{data.label}</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={10} side="right">
          <div className="flex text-[8px] content-center justify-center">
            {lines.map((line, i) => (
              <div key={i} className="h-[20px]">{line}</div> // insert line break
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger>
          <Handle type="target" position={Position.Top} />
        </TooltipTrigger>
        <TooltipContent sideOffset={30} side="top">
          <div className="flex text-[8px] content-center justify-center">
            Drag and drop this handle to create a new node. <br />
            The newly connected edge can also be edited just like a node.
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger>
          <Handle type="source" position={Position.Bottom} />
        </TooltipTrigger>
        <TooltipContent sideOffset={20} side="bottom">
          <div className="flex text-[8px] content-center justify-center">
            Drag and drop this handle to create a new node. <br />
            The newly connected edge can also be edited just like a node.
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};