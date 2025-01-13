import { Handle, NodeProps, Position } from "@xyflow/react";
import type { RelevantNode } from "../nodes";

export default function RelevantNode({ data }: NodeProps<RelevantNode>) {
  return (
    <div className="flex flex-col gap-2">
      🤔 {data.label}
      <div className="flex flex-col gap-2">
        <div className="bg-[#eee] rounded-sm p-1">
          Query
          <Handle
            type="target"
            style={{
              position: "absolute",
              top: "47px",
              right: 0,
            }}
            id="query"
            position={Position.Left}
          />
        </div>
        <div className="bg-[#eee] rounded-sm p-1">
          Subject
          <Handle
            type="target"
            style={{
              position: "absolute",
              top: "87px",
              right: 0,
            }}
            id="subject"
            position={Position.Left}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="bg-[#eee] rounded-sm p-1">
          Relevant
          <Handle
            type="source"
            style={{
              position: "absolute",
              top: "125px",
              right: 0,
            }}
            id="relevant"
            position={Position.Right}
          />
        </div>
        <div className="bg-[#eee] rounded-sm p-1">
          Not Relevant
          <Handle
            type="source"
            style={{
              position: "absolute",
              top: "160px",
              right: 0,
            }}
            id="notRelevant"
            position={Position.Right}
          />
        </div>
      </div>
    </div>
  );
}
