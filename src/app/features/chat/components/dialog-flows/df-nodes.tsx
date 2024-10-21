import React from "react";
import { Handle, Position, Node, NodeProps } from '@xyflow/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 

type DFNode = Node<{label: string, body: string}, string>
 
export function DFNode({ data }: NodeProps<DFNode>) {
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
        <TooltipContent sideOffset={10} side="right">
          <div style={{ fontSize: "8px", alignContent: "center" }}>
            {lines.map((line, i) => (
              <div key={i} style={{ height: "10px" }}>{line}</div> // insert line break
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger>
          <Handle type="target" position={Position.Top} />
        </TooltipTrigger>
        <TooltipContent sideOffset={30} side="top">
          <div style={{ fontSize: "8px", alignContent: "center" }}>
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
          <div style={{ fontSize: "8px", alignContent: "center" }}>
            Drag and drop this handle to create a new node. <br />
            The newly connected edge can also be edited just like a node.
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};