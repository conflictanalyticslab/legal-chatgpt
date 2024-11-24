import React from "react";
import { Handle, Position, NodeProps } from '@xyflow/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { DFNode } from "./df-node";
 
export function ExampleNode({ data }: NodeProps<DFNode>) {
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
    <>
      <div className="flex w-[100px] h-[100px] rounded-full bg-white border-[1px] border-[#1a192b] justify-center">
        <div className="text-[12px] self-center text-center">
          {data.label}
        </div>
      </div>
  
      <Handle type="target" position={Position.Top} />

  
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};