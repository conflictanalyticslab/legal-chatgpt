import React from "react";
import {
  Handle as BaseHandle,
  useEdges,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";

import CircularNode, { RADIUS } from "./circular-node";

import type { SwitchNode } from "../nodes";
import { cn } from "@/lib/utils";
import { angleToCoordinates, calculateHandleAngles } from "./helpers";

export const SWITCH_NODE_CONDITION_COLORS = [
  "#ffe4e6" /* rose.100 */,
  "#fef3c7" /* amber.100 */,
  "#ecfccb" /* lime.100 */,
];

export default function SwitchNode({ id, data }: NodeProps<SwitchNode>) {
  const sourceAngles = calculateHandleAngles(data.conditions.length + 1, 0);
  const connectedSources = useEdges().reduce((handleIds, edge) => {
    if (edge.source !== id || !edge.sourceHandle) return handleIds;
    return [...handleIds, edge.sourceHandle];
  }, [] as string[]);

  return (
    <CircularNode icon="🚦" label={data.label}>
      <BaseHandle type="target" position={Position.Left} />
      {data.conditions.map((condition, i) => (
        <Handle
          key={i}
          id={condition.id}
          angle={sourceAngles[i]}
          color={condition.color || SWITCH_NODE_CONDITION_COLORS[i % SWITCH_NODE_CONDITION_COLORS.length]}
          isConnected={connectedSources.includes(condition.id)}
        />
      ))}
      {data.otherwise && (
        <Handle
          id="else"
          angle={sourceAngles[sourceAngles.length - 1]}
          color={data.otherwise.color || "#e0f2fe" /* sky.100 */}
          isConnected={connectedSources.includes("else")}
        />
      )}
    </CircularNode>
  );
}

type HandleProps = {
  id: string;
  angle: number;
  color: string;
  isConnected: boolean;
};

function Handle({ id, angle, color, isConnected }: HandleProps) {
  const coords = angleToCoordinates(angle, RADIUS);
  return (
    <div
      className={cn(
        "absolute !left-[var(--left)] !top-[var(--top)] -translate-x-1/2 -translate-y-1/2",
        !isConnected &&
          "group/handle hover:!left-[calc(var(--left)+var(--hover-left))] hover:!top-[calc(var(--top)+var(--hover-top))] transition-[top,left] before:content-[''] before:size-6 before:-ml-6 flex"
      )}
      style={
        {
          "--left": `${RADIUS + coords.x}px`,
          "--hover-left": `${Math.cos((angle * Math.PI) / 180) * 12}px`,
          "--top": `${RADIUS + coords.y}px`,
          "--hover-top": `${Math.sin((angle * Math.PI) / 180) * 12}px`,
          "--bg": color,
        } as React.CSSProperties
      }
    >
      <BaseHandle
        id={id}
        type="source"
        position={Position.Right}
        className="!static flex items-center justify-center text-[var(--text)] !transform-none"
      >
        {!isConnected && (
          <Plus className="size-4 opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none" />
        )}
      </BaseHandle>
    </div>
  );
}
