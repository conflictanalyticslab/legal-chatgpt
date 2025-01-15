import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import type { SwitchNode } from "../nodes";

export default function SwitchNode({ data }: NodeProps<SwitchNode>) {
  return (
    <div className="flex flex-col gap-2">
      {data.label}

      <Handle type="target" position={Position.Top} />

      <div className="flex flex-col gap-2">
        {data.conditions.map((condition, index) => (
          <div className="bg-[#eee] rounded-sm p-1" key={condition.id}>
            {condition.label}

            <Handle
              type="source"
              style={{
                position: "absolute",
                top: `${index * 40 + 40}px`,
                right: 0,
              }}
              id={condition.id}
              position={Position.Right}
            />
          </div>
        ))}
      </div>

      {data.otherwise && (
        <div className="bg-[#eee] rounded-sm p-1">
          {data.otherwise.label}

          <Handle
            type="source"
            style={{
              position: "absolute",
              top: `${data.conditions.length * 40 + 40}px`,
              right: 0,
            }}
            id="else"
            position={Position.Right}
          />
        </div>
      )}
    </div>
  );
}
