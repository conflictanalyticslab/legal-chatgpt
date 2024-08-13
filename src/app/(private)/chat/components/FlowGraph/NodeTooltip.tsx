import React from "react";
import { Handle, Position, Node, NodeProps } from '@xyflow/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 

type NodeTooltip = Node<{label: string, body: string}, string>
 
export function NodeTooltip({ data }: NodeProps<NodeTooltip>) {
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
          {data.label}
        </TooltipTrigger>
        <TooltipContent sideOffset={5}>
          <div style={{ fontSize: "8px", alignContent: "center" }}>
            {lines.map((line, i) => (
              <div key={i} style={{ height: "10px" }}>{line}</div> // insert line break
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
 
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </TooltipProvider>
  );
};