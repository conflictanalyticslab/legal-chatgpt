import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  useReactFlow,
  MarkerType,
  type Node, 
  type Edge,
  type ReactFlowJsonObject,
  type OnConnectStart,
  Connection,
  OnConnectEnd,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { cn } from "@/utils/utils";
import { NodeTooltip } from './NodeTooltip';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import Image from "next/image";

const DBURL = "https://48.217.241.192:8080"; // temporary solution, this would go in the .env preferably

const nodeTypes = {
  default: NodeTooltip,
};

const initialNodes = [
  {
    id: '0',
    type: 'default',
    data: { 
        label: 'node 0',
        body: 'default body'
    },
    position: {
      x: 0,
      y: 0,
    },
  }
];

let id = 1;
function getId() { return `${id++}`; }

function FlowGraph({setOpen}: {setOpen: (open: boolean) => void}) {
  const { setDialogFlow } = useChatContext();
  // no need to trigger rerender
  const connectingNodeId = useRef<string>("");
  const chosenNodeId = useRef<string>("");
  const chosenEdgeId = useRef<string>("");
  const chosenIsNode = useRef<boolean>(false);
  // changing these should trigger rerender
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [chosenLabel, setChosenLabel] = useState<string>("");
  const [chosenBody, setChosenBody] = useState<string>("");
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [rfInstance, setRfInstance] = useState<any>(null);
  // TODO: disable save button until this has loaded
  const [graphId, setGraphId] = useState<string|null>(null);
  const [graphName, setGraphName] = useState<string>("Default Name"); 
  const [graphList, setGraphList] = useState<{name:string, id:string}[]>([]);

  const { screenToFlowPosition } = useReactFlow();
  const { setViewport } = useReactFlow();

  const onNodeClick = useCallback<{(_: any, node: Node): void}>(
    (_, node) => {
      chosenNodeId.current = node.id;
      chosenIsNode.current = true;
      setChosenLabel(node.data.label as string);
      setChosenBody(node.data.body as string);
      setEditOpen(true);
    }, []
  );

  const onEdgeClick = useCallback<{(_: any, edge: Edge): void}>(
    (_, edge) => {
      chosenEdgeId.current = edge.id;
      chosenIsNode.current = false;
      if (edge.label){
        setChosenLabel(edge.label as string);
      } else {
        setChosenLabel("");
      }
      if (edge.data) {
        setChosenBody(edge.data.body as string);
      } else {
        setChosenBody("Click to edit");
      }
      setEditOpen(true);
    }, []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      connectingNodeId.current = ""; // reset connecting node
      setEdges((eds) => addEdge(params, eds));
    }, []
  );

  const onConnectStart: OnConnectStart = useCallback(
      (_, { nodeId }) => connectingNodeId.current = nodeId ?? '', // record start node
      []
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = (event.target as HTMLElement).classList.contains('react-flow__pane');

      if (targetIsPane && event instanceof MouseEvent) { // touch does not work
        // we need to remove the wrapper bounds, in order to get the correct position
        const nodeId = getId();
        const newNode: Node = {
          id: nodeId,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { 
            label: `node ${nodeId}`,
            body: 'default body'
          },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        const edgeParams = { 
          id: nodeId,
          source: connectingNodeId.current, 
          target: nodeId, 
          style: {
            strokeWidth: 2,
            stroke: 'blue',
          },
          label: 'edge',
          data: { body: 'default body' }
        }
        setEdges((eds) =>
          addEdge({
            ...edgeParams,
            markerEnd: { // workaround, forces typescript to acknowledge the type
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
              color: 'blue',
            },
          }, eds)
        );
      }
    },
    [screenToFlowPosition],
  );

  const handleSubmit = () => { // only saves on submission for now
    if (edges.length === 0 || nodes.length === 1) return; // no changes have been made
    // saves the graph to the database
    if (rfInstance) {
      fetch(new URL('update', DBURL), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: graphId, // if this is empty, it will create a new graph
          name: graphName,
          data: rfInstance.toObject()
        }) // create a json object of the graph
      }).then(response =>{ 
        return response.json()
      }).then(body => setGraphId(body.id)) // will waste an api call, but it's the simplest solution for now
    }
    

    // make the query. TODO: call the assistant agent
    let queryArray: [string, string, string][] = [];
    edges.forEach((edge) => {
      let source: Node | undefined = nodes.find((node) => node.id === edge.source);
      let target: Node | undefined = nodes.find((node) => node.id === edge.target);
      if (source && target) { // should always pass
        queryArray.push([source.data.body, edge.data?.body, target.data.body] as [string, string, string]);
      }
    });
    setDialogFlow(JSON.stringify(queryArray));
    setOpen(false);
  }

  useEffect(() => {
    // TODO: make this a button instead, and default to the first retrieved graph
    // create new graph in the backend
    id = 1; // reset id
    fetch(new URL('retrieve/all', DBURL), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      return response.json();
    }).then(data => {
      setGraphList(data);
    })
  }, []);

  useEffect(() => {
    if (!graphId) return;
    // retrieve the graph from the backend
    fetch(new URL(`retrieve/id/${graphId}`, DBURL), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      return response.json();
    }).then((body : {
      data: ReactFlowJsonObject,
      id: string,
      name: string
    }) => {
      setGraphName(body.name);
      setNodes(body.data.nodes);
      setEdges(body.data.edges);
      setViewport(body.data.viewport);
    })
  }, [graphId])

  // nodes and edges are detected as changed on movement and edit 
  
  // }, [nodes, edges]);

  useEffect(() => {
    if (chosenIsNode.current) { // chosenNodeId would be defined
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === chosenNodeId.current) {
            return {
              ...node,
              data: {
                ...node.data,
                label: chosenLabel,
              },
            };
          }
  
          return node;
        }),
      );
    } else {
      if (!chosenEdgeId) return;
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === chosenEdgeId.current) {
            return {
              ...edge,
              label: chosenLabel,
            };
          }
  
          return edge;
        }),
      );
    }
    
  }, [chosenLabel, setNodes]);

  useEffect(() => {
    if (chosenIsNode.current) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === chosenNodeId.current) {
            return {
              ...node,
              data: {
                ...node.data,
                body: chosenBody,
              },
            };
          }
  
          return node;
        }),
      );
    } else {
      if (!chosenEdgeId) return;
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === chosenEdgeId.current) {
            return {
              ...edge,
              data: { body: chosenBody },
            };
          }
  
          return edge;
        }),
      );
    }
  }, [chosenBody, setNodes]);

  return (
    <TooltipProvider delayDuration={0}>
      <Input
        className="w-[30vw] flex min-h-[56px] pr-[60px] focus-visible:ring-[none]"
        placeholder="Graph Name"
        value={graphName}
        onChange={(e) => setGraphName(e.target.value)}
      />
      <div className="flex flex-row min-h-[550px] min-w-[320px] h-full max-h-[85vh]">
        <div className="flex flex-col px-4 mt-[60px] min-w-[180px] w-1/5">
          <Label className="text-[#838383] mb-2">
            Previous Conversations
          </Label>
          {/* Chat History */}
          {graphList.map((item: {name: string, id: string}) => (
            <button type="button" onClick={()=>setGraphId(item.id)} className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md">{item.name}</button>
          ))}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onInit={setRfInstance}
          fitView
          minZoom={0.2}
        >
          <Tooltip>
            <TooltipTrigger>
              <Controls />
            </TooltipTrigger>
            <TooltipContent side="right">
              Controls for the flow graph.
            </TooltipContent>
          </Tooltip>
        
          <Background />

          <Tooltip>
            <TooltipTrigger asChild>
            <div 
                style={{
                  position: "absolute",
                  right: "5px",
                  bottom: "20px",
                  zIndex: 4, // ensure it is above the graph
                }}
              >
                <Button
                  variant="ghost"
                  type="button"
                  aria-label="Save Graph"
                  onClick={handleSubmit}
                >
                  <Image
                    src="/assets/icons/send-horizontal.svg"
                    alt="send"
                    width={30}
                    height={30}
                  />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={5}>
              Save the current graph to a query.
            </TooltipContent>
          </Tooltip>
        </ReactFlow>
        
        <nav
          className={cn(
            "relative transition-all flex flex-col w-[0px] border-l-[#e2e8f0] duration-300 ease-in-out h-screen overflow-auto scrollbar-thin",
            {
              "w-1/3": editOpen,
            }
          )}
        >
          {editOpen && (
            <div className="px-4">
              <Label>Label:</Label>
              <Input
                value={chosenLabel}
                onChange={(event) => setChosenLabel(event.target.value)}
              />
              <Label>Body:</Label>
              <Input 
                value={chosenBody} 
                onChange={(event) => setChosenBody(event.target.value)} 
              /> 
            </div>
          )}
        </nav>
        
      </div>
    </TooltipProvider>
  );
};

export function FlowModal() {
  const [open, setOpen] = useState(false);
  return (
    <ReactFlowProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "hover:bg-[#E2E8F0] bg-[transparent] h-[56px] w-[56px] absolute left-[-115px]"
                  )}
                  type="button"
                  aria-label="Flow Graph"
                >
                  <Image
                    src="/assets/icons/route.svg"
                    alt="send"
                    width={30}
                    height={30}
                  />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent>
              Open Dialog Flows
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[85vw] flex flex-col gap-5 overflow-auto box-border"
        >
          <DialogTitle className="hidden"></DialogTitle>
          <FlowGraph setOpen={setOpen}/>
        </DialogContent>
      </Dialog>
    </ReactFlowProvider>
  );
}