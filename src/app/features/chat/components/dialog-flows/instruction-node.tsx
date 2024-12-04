import React from "react";
import { Handle, Position, Node, NodeProps } from '@xyflow/react';
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
    <>
      <div className="flex w-[100px] h-[100px] justify-center bg-transparent">
        <div className="flex -translate-x-[0.5px] w-[75px] h-[75px] rotate-45 bg-transparent border-[1px] border-[#1a192b] rounded-md self-center">
          <div className="-rotate-45 text-[12px] bg-transparent self-center text-center">{data.label}</div>
        </div>
      </div>
    
      <Handle type="target" position={Position.Top} />
    
      <Handle type="source" position={Position.Bottom} />
        
    </>
  );
};