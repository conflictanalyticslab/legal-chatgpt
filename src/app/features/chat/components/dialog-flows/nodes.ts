/**
 * This file contains the type definitions for the nodes in the graph.
 */
import type { Edge, Node, NodeProps, XYPosition } from "@xyflow/react";
import { ulid } from "ulid";
import ExampleNode from "./nodes/example-node";
import InstructionNode from "./nodes/instruction-node";
import ContextNode from "./nodes/context-node";
import SwitchNode from "./nodes/switch-node";
import RelevantNode from "./nodes/relevant-node";
import KeywordExtractorNode from "./nodes/keyword-extractor-node";
import ExtractorNode from "./nodes/extractor-node";
import PDFNode from "./nodes/pdf-node";
import GhostNode from "./nodes/ghost-node";

import { titleCase } from "@/lib/utils";

export type ExampleNode = Node<{label: string, body: string}, 'example'>
export type InstructionNode = Node<{label: string, body: string}, 'instruction'>
export type ContextNode = Node<{label: string, body: string}, 'context'>


export enum PrecedentTypes {
    STATUTE = "statute",
    REGULATION = "regulation",
    SUPREME_COURT = "supreme_court",
    COURT_OF_APPEAL = "court_of_appeal",
    LOWER_COURT = "lower_court",
    UNKNOWN = "unspecified",
};

export type Criteria = {
    id: string, 
    label: string, 
    description: string,
    type: PrecedentTypes;
    citation: string; // might replace with a citation class later for easier formatting...?
}
type ExtractorData = {
    label: string;
    factDescription: string;
    factPrompt: string;
    searchCaseLaw: boolean;
    criteria: Array<Criteria>;

}
export type ExtractorNode = Node<ExtractorData, 'extractor'>

type SwitchData = {
    label: string;
    conditions: Array<{id: string, label: string, body: string, color: string}>;
    otherwise?: {label: string, body: string, color: string};
}

export type SwitchNode = Node<SwitchData, 'switch'>

type RelevantData = {
    label: string;
    threshold: number;
}

export type RelevantNode = Node<RelevantData, 'relevant'>

type KeywordExtractorData = {
    label: string;
}

export type KeywordExtractorNode = Node<KeywordExtractorData, 'keyword-extractor'>

type PDFData = {
  label: string;
  content: string;
};


export type PDFNode = Node<PDFData, 'pdf'>;


export type GhostNode = Node<{standalone?: boolean}, 'ghost'>;

/** The types of all nodes in the graph. */
export type GraphFlowNode = ExampleNode | InstructionNode | ContextNode | SwitchNode | RelevantNode | KeywordExtractorNode | ExtractorNode | PDFNode | GhostNode;

/** Shorthand to get the type values of all node types without the undefined type. */
export type GraphFlowNodeTypes = Exclude<GraphFlowNode['type'], undefined>;

/** The type of all edges in the graph. */
export type GraphFlowEdge = Edge<{body: string}>;

type NodeTypesRecord = {
    [K in GraphFlowNode as Exclude<K['type'], undefined>]: React.ComponentType<NodeProps<K>>
}

/**
 * The types of all nodes in the graph associated with their React components to render them.
 */
export const nodeTypes: NodeTypesRecord = {
    example: ExampleNode,
    instruction: InstructionNode,
    context: ContextNode,
    switch: SwitchNode,
    relevant: RelevantNode,
    "keyword-extractor": KeywordExtractorNode,
    extractor: ExtractorNode,
    pdf: PDFNode,
    ghost: GhostNode,
};

/**
 * Creates an empty node of the given type.
 * @param type - The type of the node to create.
 * @param position - The position of the node in the graph.
 * @returns The created node.
 */
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
                    label: titleCase(type),
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
                            body: '',
                            color: "#ffe4e6" /* rose.100 */
                        },
                        {
                            id: ulid(),
                            label: 'If else...',
                            body: '',
                            color: "#fef3c7" /* amber.100 */
                        }
                    ],
                    otherwise: {
                        label: 'Otherwise...',
                        body: '',
                        color: "#e0f2fe" /* sky.100 */
                    }
                }
            }
        case 'relevant':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Relevant',
                    threshold: 50
                }
            }
        case 'keyword-extractor':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Keyword Extractor',
                }
            }
        case 'extractor':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'Extractor',
                    factDescription: '',
                    factPrompt: '',
                    searchCaseLaw: false,
                    criteria: [
                        {
                            id: ulid(),
                            label: '',
                            description: '',
                            type: PrecedentTypes.UNKNOWN,
                            citation: "",
                        },
                    ],

                }
            }
        case 'pdf':
            return {
                id: ulid(),
                type,
                position,
                data: {
                    label: 'PDF',
                    content: ''
                }
            }
        case 'ghost':
            return {
                id: ulid(),
                type,
                position,
                data: {}
            }
    }
}