import React, { useCallback, useEffect, useState } from "react";

import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from "@radix-ui/react-tooltip";
import { useDialogFlowStore, usePropertiesStore } from "./store";
import {
  ContextNode,
  ExampleNode,
  GraphFlowEdge,
  GraphFlowNode,
  InstructionNode,
} from "./nodes";

import invariant from "tiny-invariant";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ulid } from "ulid";

interface EdgePropertiesPanelProps {
  edge: GraphFlowEdge;
  updateEdge: (id: string, fn: (edge: GraphFlowEdge) => GraphFlowEdge) => void;
}

function EdgePropertiesPanel({ edge, updateEdge }: EdgePropertiesPanelProps) {
  const [label, setLabel] = useState(edge.label as string);
  const [body, setBody] = useState(edge.data?.body ?? "");

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateEdge(edge.id, (edge) => ({
      ...edge,
      label: event.target.value,
    }));
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    updateEdge(edge.id, (edge) => ({
      ...edge,
      data: { ...edge.data, body: event.target.value },
    }));
  };

  useEffect(() => {
    setLabel(edge.label as string);
    setBody(edge.data?.body ?? "");
  }, [edge]);

  return (
    <div className="px-4 flex flex-col divide-y">
      <div className="py-4">
        <Label className="text-[grey]">Editing Edge</Label>
      </div>

      <div className="py-4">
        <div className="flex flex-col">
          <Label className="py-2">Label:</Label>
          <Input value={label} onChange={onLabelChange} />
        </div>

        <div className="flex flex-col">
          <Label className="py-2">Body:</Label>
          <Textarea
            placeholder="You can leave this empty"
            wrap="soft"
            value={body}
            rows={10}
            onChange={onBodyChange}
          />
        </div>
      </div>
    </div>
  );
}

interface GenericNodePropertiesPanelProps<
  T = InstructionNode | ContextNode | ExampleNode
> {
  node: T;
  updateNode: (id: string, fn: (node: T) => T) => void;
}

function GenericNodePropertiesPanel({
  node,
  updateNode,
}: GenericNodePropertiesPanelProps) {
  const [label, setLabel] = useState(node.data.label);
  const [body, setBody] = useState(node.data.body);

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, label: event.target.value },
      };
    });
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, body: event.target.value },
      };
    });
  };

  useEffect(() => {
    setLabel(node.data.label);
    setBody(node.data.body);
  }, [node]);

  return (
    <div className="px-4 flex flex-col divide-y">
      <div className="py-4">
        <Label className="text-[grey]">Editing {node.type} Node</Label>
      </div>

      <div className="py-4">
        <div className="flex flex-col">
          <Label className="py-2">Label:</Label>
          <Input value={label} onChange={onLabelChange} />
        </div>

        <div className="flex flex-col">
          <Label className="py-2">Body:</Label>
          <Textarea
            placeholder="You can leave this empty"
            wrap="soft"
            value={body}
            rows={10}
            onChange={onBodyChange}
          />
        </div>
      </div>
    </div>
  );
}


  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    switch (selectedItem?.type) {
      case "node":
        updateNode(selectedItem?.id, (node) => ({
          ...node,
          data: { ...node.data, label: event.target.value },
        }));
        break;
      case "edge":
        updateEdge(selectedItem?.id, (edge) => ({
          ...edge,
          label: event.target.value,
        }));
        break;
    }
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    switch (selectedItem?.type) {
      case "node":
        updateNode(selectedItem?.id, (node) => ({
          ...node,
          data: { ...node.data, body: event.target.value },
        }));
        break;
      case "edge":
        updateEdge(selectedItem?.id, (edge) => ({
          ...edge,
          data: { ...edge.data, body: event.target.value },
        }));
        break;
    }
  };

  return (
    <div className="px-4 flex flex-col divide-y">
      <div className="py-4">
        {selectedItem?.type === "node" ? (
          <Label className="text-[grey]">Editing Node</Label>
        ) : (
          <Label className="text-[grey]">Editing Edge</Label>
        )}
      </div>

      <div className="py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col">
              <Label className="py-2">Label:</Label>
              <Input value={label} onChange={onLabelChange} />
            </div>
          </TooltipTrigger>

          <TooltipPortal container={document.getElementById("df-main")}>
            <TooltipContent side="left">
              <Label className="shadow-lg">
                Edit how the node or edge is shown in the Dialog Flow window.
                OpenJustice will NOT use this to generate a response.
              </Label>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col">
              <Label className="py-2">Body:</Label>
              <Textarea
                placeholder="You can leave this empty"
                wrap="soft"
                value={body}
                rows={10}
                onChange={onBodyChange}
              />
            </div>
          </TooltipTrigger>

          <TooltipPortal container={document.getElementById("df-main")}>
            <TooltipContent side="left">
              <Label className="shadow-lg bg-inherit">
                Edit the content of the node or edge. OpenJustice will use this
                to generate a response.
              </Label>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
    </div>
  );
}
        case "switch":
          return (
            <SwitchNodePropertiesPanel
              node={node}
              updateNode={(id, fn) =>
                updateNode(id, fn as (node: GraphFlowNode) => GraphFlowNode)
              }
            />
          );
