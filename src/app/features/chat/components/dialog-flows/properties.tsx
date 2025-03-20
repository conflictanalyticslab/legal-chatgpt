import React, { useCallback, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import GPT4Tokenizer from "gpt4-tokenizer";
import { useUpdateNodeInternals } from "@xyflow/react";

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
  PDFNode,
} from "./nodes";
import { SWITCH_NODE_CONDITION_COLORS } from "./nodes/switch-node";

import invariant from "tiny-invariant";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ulid } from "ulid";
import { Slider } from "@/components/ui/slider";
import { useGlobalContext } from "@/app/store/global-context";
import { cn, titleCase } from "@/lib/utils";
import { postPDF } from "@/app/api/(api-service-layer)/post-pdf";
import { toast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

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
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input value={label} onChange={onLabelChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Body:</Label>
        <Textarea
          placeholder="You can leave this empty"
          wrap="soft"
          value={body}
          rows={10}
          onChange={onBodyChange}
        />
      </div>
    </>
  );
}

interface NodePropertiesPanelProps<T extends GraphFlowNode> {
  node: T;
  updateNode: (id: string, fn: (node: T) => T) => void;
}

function PDFNodePropertiesPanel({
  node,
  updateNode,
}: NodePropertiesPanelProps<PDFNode>) {
  const { setInfoAlert } = useGlobalContext();

  const [label, setLabel] = useState(node.data.label);
  const [content, setContent] = useState(node.data.content);

  const [isUploading, setIsUploading] = useState(false);

  const onLabelChange = (value: string) => {
    setLabel(value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, label: value },
      };
    });
  };

  const onContentChange = (value: string) => {
    setContent(value);
    updateNode(node.id, (thatNode) => {
      return {
        ...thatNode,
        data: { ...thatNode.data, content: value },
      };
    });
  };

  useEffect(() => {
    setLabel(node.data.label);
    setContent(node.data.content);
  }, [node]);

  type UploadFileResult =
    | { type: "success"; label: string; content: string }
    | { type: "error"; message: string };

  async function uploadFile(file: File): Promise<UploadFileResult> {
    const pdfContent = await postPDF(file); // Call the PDF processor api-end point to parse the pdf content

    // PDF file size check
    const pdfFileSize = file.size;
    if (pdfFileSize > 5 * 1024 * 1024) {
      return {
        type: "error",
        message: `The PDF file uploaded is too large, maximum of 5MB expected, your pdf is ${
          pdfFileSize / (1024 * 1024)
        } bytes!`,
      };
    }

    // PDF token count check
    const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
    const estimatedTokenCount = tokenizer.estimateTokenCount(
      pdfContent.content
    );
    if (estimatedTokenCount > 16384) {
      return {
        type: "error",
        message: `The PDF file uploaded exceeds limit, maximum of 8192 token in each PDF uploaded, your pdf contains ${estimatedTokenCount} tokens`,
      };
    }

    return { type: "success", label: file.name, content: pdfContent.content };
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input value={label} onChange={(e) => onLabelChange(e.target.value)} />
      </div>

      {content.length ? (
        <div className="flex flex-col gap-2">
          <Label className="text-neutral-500">Content:</Label>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={10}
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label className="text-neutral-500">File:</Label>
          <Dropzone
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            maxSize={5 * 1024 * 1024 /* 5 megabytes */}
            onDropAccepted={async (files) => {
              setIsUploading(true);
              const res = await uploadFile(files[0]);
              if (res.type === "success") {
                toast({ title: "PDF uploaded successfully!" });
                onLabelChange(res.label);
                onContentChange(res.content);
              } else {
                toast({ title: res.message, variant: "destructive" });
              }
              setIsUploading(false);
            }}
            onDropRejected={() =>
              setInfoAlert("File is too big. We have a 5 Mb limit.")
            }
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                className={cn(
                  "border-2 rounded-md border-dashed h-[250px] flex items-center justify-center ",
                  isDragActive || isUploading
                    ? "text-sky-500 border-sky-400/50 bg-sky-50/50"
                    : "border-neutral-300 text-neutral-500"
                )}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <p>{isUploading ? "Uploading..." : "Drop the file here"}</p>
              </div>
            )}
          </Dropzone>
        </div>
      )}
    </>
  );
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
    <div className="flex flex-col gap-2">
      <Label className="text-neutral-500">Label:</Label>
      <Input value={label} onChange={onLabelChange} />
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
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input value={label} onChange={onLabelChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Threshold:</Label>
        <Slider
          value={[threshold]}
          onValueChange={onThresholdChange}
          max={100}
          step={1}
        />
      </div>
    </>
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
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input value={label} onChange={onLabelChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Body:</Label>
        <Textarea
          placeholder="You can leave this empty"
          wrap="soft"
          value={body}
          rows={10}
          onChange={onBodyChange}
        />
      </div>
    </>
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
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input value={label} onChange={onLabelChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Body:</Label>
        <Textarea
          placeholder="You can leave this empty"
          wrap="soft"
          value={body}
          rows={2}
          onChange={onBodyChange}
        />
      </div>
    </>
  );
}

interface ConditionPropertiesPanelProps {
  index: number;
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
  index,
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

  // prettier-ignore
  const color = SWITCH_NODE_CONDITION_COLORS[index % SWITCH_NODE_CONDITION_COLORS.length];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border-2 border-white"
            style={{ backgroundColor: condition.color || color }}
          />
          <span className="text-sm">Condition {index + 1}</span>
        </div>
        <button
          className="text-sm text-red-500 hover:underline rounded-md"
          onClick={deleteCondition}
        >
          Delete
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>

        <Input value={label} onChange={onLabelChange} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Body:</Label>

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
  const updateNodeInternals = useUpdateNodeInternals();
  const { nodes, edges, setEdges, removeNode } = useDialogFlowStore();

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
    // prettier-ignore
    const color = SWITCH_NODE_CONDITION_COLORS[node.data.conditions.length % SWITCH_NODE_CONDITION_COLORS.length];
    updateNode(node.id, (node) => {
      return {
        ...node,
        data: {
          ...node.data,
          conditions: [
            ...node.data.conditions,
            {
              id: ulid(),
              label: "If...",
              body: "",
              color,
            },
          ],
        },
      };
    });
    updateNodeInternals(node.id);
  }, [node]);

  const onSourceChange = (id: string) => {
    const _edges = edges.filter((edge) => {
      return edge.source === node.id && edge.sourceHandle === id;
    });
    if (_edges.length) {
      const connectedNodeIds = _edges.map((edge) => edge.target);
      const ghost = nodes.find((node) => {
        return connectedNodeIds.includes(node.id) && node.type === "ghost";
      });
      if (ghost) removeNode(ghost.id);

      const edgeIds = _edges.map((edge) => edge.id);
      setEdges(edges.filter((edge) => !edgeIds.includes(edge.id)));
    }
  };

  const deleteCondition = (id: string) => {
    onSourceChange(id);

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
    updateNodeInternals(node.id);
  };

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
    onSourceChange("else");

    setOtherwiseEnabled(checked);
    updateNode(node.id, (node) => {
      return {
        ...node,
        data: {
          ...node.data,
          otherwise: checked
            ? {
                label: "Otherwise...",
                body: "",
                color: "#e0f2fe" /* sky.100 */,
              }
            : undefined,
        },
      };
    });
    updateNodeInternals(node.id);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-500">Label:</Label>
        <Input value={label} onChange={onLabelChange} />
      </div>

      {node.data.conditions.map((condition, i) => (
        <ConditionPropertiesPanel
          index={i}
          key={condition.id}
          condition={condition}
          updateCondition={updateCondition}
          deleteCondition={() => deleteCondition(condition.id)}
        />
      ))}

      <Button className="w-full shrink-0" size="sm" onClick={addCondition}>
        Add Condition
      </Button>

      <div className="flex flex-row items-center gap-2 justify-between">
        <Label className="text-neutral-500">Otherwise:</Label>
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
    </>
  );
}

type SelectedItem =
  | { type: "node"; node: GraphFlowNode }
  | { type: "edge"; edge: GraphFlowEdge };

export default function PropertiesPanel() {
  const { nodes, edges, updateNode, updateEdge } = useDialogFlowStore();

  const { item, close } = usePropertiesStore((state) => {
    return {
      item: (() => {
        const item = state.selectedItem;
        if (!item) return null;
        switch (item.type) {
          case "node":
            const node = nodes.find((n) => n.id === item.id);
            return node ? { type: "node", node } : null;
          case "edge":
            const edge = edges.find((e) => e.id === item.id);
            return edge ? { type: "edge", edge } : null;
        }
      })() as SelectedItem,
      close() {
        state.setSelectedItem(null);
      },
    };
  });
  if (!item) return;

  return (
    <div className="flex flex-col gap-4 fixed top-16 right-2 bg-neutral-100 rounded-lg border border-neutral-200 max-w-xs w-full py-2 shadow-lg shadow-neutral-100">
      <div className="flex-col flex gap-2 px-2">
        <div className="flex items-center gap-4 justify-between">
          <Label className="text-[grey]">
            {item.type === "edge"
              ? "Edge"
              : getNodeTypeDisplayText(item.node.type)}
          </Label>

          <button
            className="p-2 rounded-md hover:bg-neutral-200 hover:border-neutral-300 border border-neutral-200"
            onClick={close}
          >
            <X className="size-4" />
          </button>
        </div>

        <hr className="border-neutral-200" />
      </div>

      <div className="overflow-y-auto flex flex-col gap-4 flex-1 px-2">
        {(() => {
          switch (item.type) {
            case "node": {
              const node = item.node;
              invariant(node.type, "Node type is undefined");
              switch (node.type) {
                case "instruction":
                case "context":
                case "example":
                  return (
                    <GenericNodePropertiesPanel
                      node={node}
                      updateNode={(id, fn) =>
                        updateNode(
                          id,
                          fn as (node: GraphFlowNode) => GraphFlowNode
                        )
                      }
                    />
                  );
                case "switch":
                  return (
                    <SwitchNodePropertiesPanel
                      node={node}
                      updateNode={(id, fn) =>
                        updateNode(
                          id,
                          fn as (node: GraphFlowNode) => GraphFlowNode
                        )
                      }
                    />
                  );
                case "relevant":
                  return (
                    <RelevantNodePropertiesPanel
                      node={node}
                      updateNode={(id, fn) =>
                        updateNode(
                          id,
                          fn as (node: GraphFlowNode) => GraphFlowNode
                        )
                      }
                    />
                  );
                case "keyword-extractor":
                  return (
                    <KeywordExtractorNodePropertiesPanel
                      node={node}
                      updateNode={(id, fn) =>
                        updateNode(
                          id,
                          fn as (node: GraphFlowNode) => GraphFlowNode
                        )
                      }
                    />
                  );
                case "pdf":
                  return (
                    <PDFNodePropertiesPanel
                      node={node}
                      updateNode={(id, fn) =>
                        updateNode(
                          id,
                          fn as (node: GraphFlowNode) => GraphFlowNode
                        )
                      }
                    />
                  );
                case "ghost":
                  return null;
                default: {
                  const exhaustiveCheck: never = node.type;
                  throw new Error(`Unhandled node type: ${exhaustiveCheck}`);
                }
              }
            }
            case "edge":
              return (
                <EdgePropertiesPanel edge={item.edge} updateEdge={updateEdge} />
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
}

function getNodeTypeDisplayText(type: GraphFlowNode["type"]) {
  if (!type) return null;
  if (type === "keyword-extractor") return "Keyword Extractor Node";
  if (type === "pdf") return "PDF Node";
  return `${titleCase(type)} Node`;
}
