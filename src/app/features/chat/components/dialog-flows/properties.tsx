import React, { useCallback, useEffect, useState } from "react";

import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDialogFlowStore, usePropertiesStore } from "./store";
import {
  ContextNode,
  ExampleNode,
  GraphFlowEdge,
  GraphFlowNode,
  InstructionNode,
  KeywordExtractorNode,
  RelevantNode,
  SwitchNode,
} from "./nodes";

import invariant from "tiny-invariant";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ulid } from "ulid";
import { Slider } from "@/components/ui/slider";

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

interface NodePropertiesPanelProps<T extends GraphFlowNode> {
  node: T;
  updateNode: (id: string, fn: (node: T) => T) => void;
}

function KeywordExtractorNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<KeywordExtractorNode>) {
  const [label, setLabel] = useState(node.data.label);

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, label: event.target.value },
      };
    });
  };

  useEffect(() => {
    setLabel(node.data.label);
  }, [node]);

  return (
    <div className="px-4 flex flex-col divide-y">
      <div className="py-4">
        <Label className="text-[grey]">Editing Keyword Extractor Node</Label>
      </div>

      <div className="py-4">
        <div className="flex flex-col">
          <Label className="py-2">Label:</Label>
          <Input value={label} onChange={onLabelChange} />
        </div>
      </div>
    </div>
  );
}

function RelevantNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<RelevantNode>) {
  const [label, setLabel] = useState(node.data.label);
  const [threshold, setThreshold] = useState(node.data.threshold);

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, label: event.target.value },
      };
    });
  };

  const onThresholdChange = (value: number[]) => {
    setThreshold(value[0]);
    updateNode(node.id, (thatNode) => {
      return { ...thatNode, data: { ...thatNode.data, threshold: value[0] } };
    });
  };

  useEffect(() => {
    setLabel(node.data.label);
    setThreshold(node.data.threshold);
  }, [node]);

  return (
    <div className="px-4 flex flex-col divide-y">
      <div className="py-4">
        <Label className="text-[grey]">Editing Relevant Node</Label>
      </div>

      <div className="py-4">
        <div className="flex flex-col">
          <Label className="py-2">Label:</Label>
          <Input value={label} onChange={onLabelChange} />
        </div>
        <div className="flex flex-col">
          <Label className="py-2">Threshold:</Label>
          <Slider
            value={[threshold]}
            onValueChange={onThresholdChange}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}

function GenericNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<InstructionNode | ContextNode | ExampleNode>) {
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

interface OtherwisePropertiesPanelProps {
  otherwise: Exclude<SwitchNode["data"]["otherwise"], undefined>;
  updateOtherwise: (
    fn: (
      otherwise: Exclude<SwitchNode["data"]["otherwise"], undefined>
    ) => Exclude<SwitchNode["data"]["otherwise"], undefined>
  ) => void;
}

function OtherwisePropertiesPanel({
  otherwise,
  updateOtherwise,
}: OtherwisePropertiesPanelProps) {
  const [label, setLabel] = useState(otherwise.label);
  const [body, setBody] = useState(otherwise.body);

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateOtherwise((thatOtherwise) => {
      return {
        ...thatOtherwise,
        label: event.target.value,
      };
    });
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    updateOtherwise((thatOtherwise) => {
      return {
        ...thatOtherwise,
        body: event.target.value,
      };
    });
  };

  return (
    <div className="flex flex-col">
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
          rows={2}
          onChange={onBodyChange}
        />
      </div>
    </div>
  );
}

interface ConditionPropertiesPanelProps {
  condition: SwitchNode["data"]["conditions"][number];
  updateCondition: (
    id: string,
    fn: (
      condition: SwitchNode["data"]["conditions"][number]
    ) => SwitchNode["data"]["conditions"][number]
  ) => void;
  deleteCondition: () => void;
}

function ConditionPropertiesPanel({
  condition,
  updateCondition,
  deleteCondition,
}: ConditionPropertiesPanelProps) {
  const [label, setLabel] = useState(condition.label);
  const [body, setBody] = useState(condition.body);

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateCondition(condition.id, (thatCondition) => {
      return {
        ...thatCondition,
        label: event.target.value,
      };
    });
  };

  const onBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    updateCondition(condition.id, (thatCondition) => {
      return {
        ...thatCondition,
        body: event.target.value,
      };
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <Label className="py-2">Label:</Label>
          <Button variant="ghost" size="icon" onClick={deleteCondition}>
            Delete
          </Button>
        </div>
        <Input value={label} onChange={onLabelChange} />
      </div>

      <div className="flex flex-col">
        <Label className="py-2">Body:</Label>
        <Textarea
          placeholder="You can leave this empty"
          wrap="soft"
          value={body}
          rows={2}
          onChange={onBodyChange}
        />
      </div>
    </div>
  );
}

function SwitchNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<SwitchNode>) {
  const [label, setLabel] = useState(node.data.label);
  const [otherwiseEnabled, setOtherwiseEnabled] = useState<boolean>(
    !!node.data.otherwise
  );

  const onLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, label: event.target.value },
      };
    });
  };

  useEffect(() => {
    setLabel(node.data.label);
  }, [node]);

  const addCondition = useCallback(() => {
    updateNode(node.id, (node) => {
      return {
        ...node,
        data: {
          ...node.data,
          conditions: [
            ...node.data.conditions,
            { id: ulid(), label: "If...", body: "" },
          ],
        },
      };
    });
  }, [node]);

  const deleteCondition = useCallback(
    (id: string) => {
      updateNode(node.id, (node) => {
        return {
          ...node,
          data: {
            ...node.data,
            conditions: node.data.conditions.filter(
              (condition) => condition.id !== id
            ),
          },
        };
      });
    },
    [node]
  );

  const updateCondition = useCallback(
    (
      id: string,
      fn: (
        condition: SwitchNode["data"]["conditions"][number]
      ) => SwitchNode["data"]["conditions"][number]
    ) => {
      updateNode(node.id, (node) => {
        const conditions = node.data.conditions.map((condition) =>
          condition.id === id ? fn(condition) : condition
        );

        return {
          ...node,
          data: { ...node.data, conditions },
        };
      });
    },
    [node]
  );

  const updateOtherwise = useCallback(
    (
      fn: (
        otherwise: Exclude<SwitchNode["data"]["otherwise"], undefined>
      ) => Exclude<SwitchNode["data"]["otherwise"], undefined>
    ) => {
      updateNode(node.id, (node) => {
        return {
          ...node,
          data: {
            ...node.data,
            otherwise: node.data.otherwise
              ? fn(node.data.otherwise)
              : undefined,
          },
        };
      });
    },
    [node]
  );

  const onOtherwiseChange = (checked: boolean) => {
    setOtherwiseEnabled(checked);
    updateNode(node.id, (node) => {
      return {
        ...node,
        data: {
          ...node.data,
          otherwise: checked ? { label: "Otherwise...", body: "" } : undefined,
        },
      };
    });
  };

  return (
    <div className="px-4 flex flex-col divide-y">
      <div className="py-4">
        <Label className="text-[grey]">Editing Switch Node</Label>
      </div>

      <div className="py-4">
        <div className="flex flex-col mb-2">
          <Label className="py-2">Label:</Label>
          <Input value={label} onChange={onLabelChange} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <Label className="py-2">Conditions:</Label>
            <Button variant="ghost" size="icon" onClick={addCondition}>
              Add
            </Button>
          </div>
          {node.data.conditions.map((condition) => (
            <ConditionPropertiesPanel
              key={condition.id}
              condition={condition}
              updateCondition={updateCondition}
              deleteCondition={() => deleteCondition(condition.id)}
            />
          ))}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-2">
            <Label className="py-2">Otherwise:</Label>
            <Switch
              checked={otherwiseEnabled}
              onCheckedChange={onOtherwiseChange}
            />
          </div>

          {node.data.otherwise && (
            <OtherwisePropertiesPanel
              otherwise={node.data.otherwise}
              updateOtherwise={updateOtherwise}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export type SelectedItem =
  | { type: "node"; node: GraphFlowNode }
  | { type: "edge"; edge: GraphFlowEdge };

interface PropertiesPanelProps {
  selectedItem: SelectedItem;
}

export default function PropertiesPanel({
  selectedItem,
}: PropertiesPanelProps) {
  const { updateNode, updateEdge } = useDialogFlowStore(
    useShallow((state) => ({
      updateNode: state.updateNode,
      updateEdge: state.updateEdge,
    }))
  );

  switch (selectedItem.type) {
    case "node": {
      const node = selectedItem.node;
      invariant(node.type, "Node type is undefined");
      switch (node.type) {
        case "instruction":
        case "context":
        case "example":
          return (
            <GenericNodePropertiesPanel
              node={node}
              updateNode={(id, fn) =>
                updateNode(id, fn as (node: GraphFlowNode) => GraphFlowNode)
              }
            />
          );
        case "switch":
          return (
            <SwitchNodePropertiesPanel
              node={node}
              updateNode={(id, fn) =>
                updateNode(id, fn as (node: GraphFlowNode) => GraphFlowNode)
              }
            />
          );
        case "relevant":
          return (
            <RelevantNodePropertiesPanel
              node={node}
              updateNode={(id, fn) =>
                updateNode(id, fn as (node: GraphFlowNode) => GraphFlowNode)
              }
            />
          );
        case "keyword-extractor":
          return (
            <KeywordExtractorNodePropertiesPanel
              node={node}
              updateNode={(id, fn) =>
                updateNode(id, fn as (node: GraphFlowNode) => GraphFlowNode)
              }
            />
          );
        default: {
          const exhaustiveCheck: never = node.type;
          throw new Error(`Unhandled node type: ${exhaustiveCheck}`);
        }
      }
    }
    case "edge":
      return (
        <EdgePropertiesPanel edge={selectedItem.edge} updateEdge={updateEdge} />
      );
    default:
      return null;
  }
}
