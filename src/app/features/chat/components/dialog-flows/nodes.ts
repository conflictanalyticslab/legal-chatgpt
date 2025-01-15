import type { Edge, Node, XYPosition } from "@xyflow/react";
import { ulid } from "ulid";

export type ExampleNode = Node<{label: string, body: string}, 'example'>
export type InstructionNode = Node<{label: string, body: string}, 'instruction'>
export type ContextNode = Node<{label: string, body: string}, 'context'>

type SwitchData = {
    label: string;
    conditions: Array<{id: string, label: string, body: string}>;
    otherwise?: {label: string, body: string};
}

export type SwitchNode = Node<SwitchData, 'switch'>


export type GraphFlowNode = ExampleNode | InstructionNode | ContextNode | SwitchNode;
export type GraphFlowNodeTypes = Exclude<GraphFlowNode['type'], undefined>;
export type GraphFlowEdge = Edge<{body: string}>;

export function createEmptyNode(type: GraphFlowNodeTypes, position: XYPosition): GraphFlowNode {
    switch (type) {
        case 'example':
        case 'instruction':
        case 'context':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: type,
                    body: ''
                }
            }
        case 'switch':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Switch',
                    conditions: [
                        {
                            id: ulid(),
                            label: 'If...',
                            body: ''
                        },
                        {
                            id: ulid(),
                            label: 'If else...',
                            body: ''
                        }
                    ],
                    otherwise: {
                        label: 'Otherwise...',
                        body: ''
                    }
                }
            }
    }
}
