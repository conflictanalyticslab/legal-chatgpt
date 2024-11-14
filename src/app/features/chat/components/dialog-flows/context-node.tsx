import React from "react";
import { Handle, Position, Node, NodeProps } from '@xyflow/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { DFNode } from "./df-node";
 
export function ContextNode({ data }: NodeProps<DFNode>) {
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
      {data.label}
      
      <Handle type="target" position={Position.Top} />

      <Handle type="source" position={Position.Bottom} />
    </>
  );
};