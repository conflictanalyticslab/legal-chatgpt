import { useGlobalContext } from '@/app/store/global-context';
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

import { auth } from "@/lib/firebase/firebase-admin/firebase";

import '@xyflow/react/dist/style.css';

import { cn } from "@/lib/utils";
import { NodeTooltip } from './node-tooltip';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PlusSquare } from "lucide-react";

import Image from "next/image";
import { Switch } from "@/components/ui/switch";

const DBURL = "https://graph-module.openjustice.ai"; 
// const DBURL = "http://localhost:8080";

const lastGraphKey = 'OJLatestGraphId';

function genUniqueId(): string {
  /**
   * Generates a unique id based on the current date and a random number.
   * Ensures all id are unique.
   */
  const dateStr = Date
    .now()
    .toString(36); // convert num to base 36 and stringify

  const randomStr = Math
    .random()
    .toString(36)
    .substring(2, 8); // start at index 2 to skip decimal point

  return `${dateStr}-${randomStr}`;
}

const nodeTypes = {
  default: NodeTooltip,
};

const initialNodes = [
  {
    id: genUniqueId(),
    type: 'default',
    data: { 
        label: 'node 0',
        body: 'default body'
    },
    position: {
      x: 0,
      y: 0,
    }
  }
];

function FlowGraph({setOpen}: {setOpen: (open: boolean) => void}) {
  const { setDialogFlow, setDialogFlowName } = useGlobalContext();
  // no need to trigger rerender
  const connectingNodeId = useRef<string>("");
  const chosenNodeId = useRef<string>("");
  const chosenEdgeId = useRef<string>("");
  const chosenIsNode = useRef<boolean>(false);
  // trigger rerender
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [chosenLabel, setChosenLabel] = useState<string>("");
  const [chosenBody, setChosenBody] = useState<string>("");
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [graphId, setGraphId] = useState<string|null>(null);
  const [graphName, setGraphName] = useState<string>("Default Name"); 
  const [graphList, setGraphList] = useState<{name:string, id:string}[]>([]);
  const [universalGraphList, setUniversalGraphList] = useState<{name:string, id:string}[]>([]);
  const [graphLoading, setGraphLoading] = useState<boolean>(false);
  const [useCustomLabel, setUseCustomLabel] = useState<boolean>(false);

  const { screenToFlowPosition } = useReactFlow();
  const { setViewport } = useReactFlow();

  const onNodeClick = useCallback<{(_: any, node: Node): void}>(
    (_, node) => {
      let prevChosenNodeId = chosenNodeId.current; // stores the value before it is changed
      let prevChosenIsNode = chosenIsNode.current;
      chosenNodeId.current = node.id;
      chosenIsNode.current = true;
      setChosenLabel(node.data.label as string);
      setChosenBody(node.data.body as string);
      setEditOpen(prevEditOpen => !prevEditOpen || !prevChosenIsNode || node.id != prevChosenNodeId); // only closes if a node is clicked again
    }, []
  );

  const onEdgeClick = useCallback<{(_: any, edge: Edge): void}>(
    (_, edge) => {
      let prevChosenEdgeId = chosenEdgeId.current; // stores the value before it is changed
      let prevChosenIsNode = chosenIsNode.current;
      chosenEdgeId.current = edge.id;
      chosenIsNode.current = false;
      setChosenLabel(edge.label as string);
      setChosenBody(edge.data?.body as string);
      setEditOpen(prevEditOpen => !prevEditOpen || prevChosenIsNode || edge.id != prevChosenEdgeId); // only closes if an edge is clicked again
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
        const nodeId = genUniqueId();
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
          id: genUniqueId() + '-edge', // just in case
          source: connectingNodeId.current, 
          target: nodeId, 
          style: {
            strokeWidth: 1,
            stroke: 'gray',
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
              color: 'gray',
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
      if (!auth.currentUser) throw new Error("User is not authenticated");
      auth.currentUser.getIdToken().then(token => {
        fetch(new URL('update', DBURL), {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: graphId, // if this is empty, it will create a new graph
            name: graphName,
            data: rfInstance.toObject()
          }) // create a json object of the graph
        }).then(response =>{ 
          if (!response.ok) throw new Error("Failed to save graph");
          else return response.json()
        }).then(body => {
          localStorage.setItem(lastGraphKey, JSON.stringify(body.id));
          setGraphId(body.id)
        }) // will waste an api call, but it's the simplest solution for now
      })
    }
    
    // make the query. 
    let queryArray: [string, string, string][] = [];
    edges.forEach((edge) => {
      let source: Node | undefined = nodes.find((node) => node.id === edge.source);
      let target: Node | undefined = nodes.find((node) => node.id === edge.target);
      if (source && target) { // should always pass
        queryArray.push([source.data.body, edge.data?.body, target.data.body] as [string, string, string]);
      }
    });
    setDialogFlow(JSON.stringify(queryArray));
    setDialogFlowName(graphName);
    setOpen(false);
  }

  const handleNewGraph = () => {
    setGraphId(null);
    setGraphName("Default Name");
    setNodes(initialNodes);
    setEdges([]);
    setViewport({ zoom: 2, x: 500, y: 500 });
    setGraphLoading(false);
  }

  useEffect(() => {
    if (!auth.currentUser) throw new Error("User is not authenticated");
    auth.currentUser.getIdToken().then(token => { // get user token for auth
      // load all user graphs
      fetch(new URL('retrieve/all', DBURL), {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        return response.json();
      }).then(data => {
        setGraphList(data);
      })

      // load universal graphs
      fetch(new URL('retrieve/universal', DBURL), {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        return response.json();
      }).then(data => {
        setUniversalGraphList(data);
      })
      const latestGraphData = localStorage.getItem(lastGraphKey);

      // load the last used graph
      if (latestGraphData) {
        setGraphId(JSON.parse(latestGraphData));
        setGraphLoading(true)
      }
    })  
  }, []);

  useEffect(() => {
    if (!graphId) return;
    // retrieve the graph from the backend
    if (!auth.currentUser) throw new Error("User is not authenticated");
    auth.currentUser.getIdToken().then(token => {
      setEditOpen(false); // close the edit dialog
      fetch(new URL(`retrieve/id/${graphId}`, DBURL), {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then(response => {
        if (!response.ok) throw new Error("Failed to retrieve graph. Creating new graph.");
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
        setGraphLoading(false); // preferablly, this would use a proper trigger
      }).catch((error) => {
        console.error(error);
        handleNewGraph();
      })
    })
  }, [graphId]);

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
        className="w-[30vw] flex min-h-[56px] pr-[60px] self-center focus-visible:ring-[none]"
        placeholder="Graph Name"
        value={graphName}
        onChange={(e) => setGraphName(e.target.value)}
      />
      <div className="flex flex-row min-h-[550px] min-w-[320px] h-full max-h-[85vh]">
        <div className="flex flex-col px-4 mt-[60px] min-w-[180px] w-1/5">
          <Label className="text-[#838383] mb-2">
            User Created Graphs
          </Label>
          {graphList.map((item: {name: string, id: string}, key: number) => (
            <button key={key} type="button" onClick={()=>{
              if (graphId !== item.id) {
                setGraphLoading(true)
                setGraphId(item.id)
              }
            }} className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md">
              {item.name}
            </button>
          ))}

          <Button
            className="flex justify-start gap-3 cursor-pointer border-[1px] border-transparent hover:border-border hover:border-[1px] px-2"
            variant={"ghost"}
            onClick={() => handleNewGraph()}
          >
            <>
              <PlusSquare className="h-5 w-5" />
              New Graph
            </>
          </Button>

          <Label className="text-[#838383] mb-2">
            Provided Graphs
          </Label>
          {universalGraphList.map((item: {name: string, id: string}, key: number) => (
            <button key={key} type="button" onClick={()=>{
              if (graphId !== item.id) {
                setGraphLoading(true)
                setGraphId(item.id)
              }
            }} className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md">
              {item.name}
            </button>
          ))}
        </div>
        {graphLoading ? (
          <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center gap-3 flex-col text-nowrap">
            Loading Graph
            <LoadingSpinner />
          </Label> 
        ) : 
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
              <TooltipTrigger asChild>
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
        } 
        
        <nav
          className={cn(
            "relative transition-all flex flex-col w-[0px] border-l-[#e2e8f0] duration-300 ease-in-out h-screen overflow-auto scrollbar-thin",
            {
              "w-1/3": editOpen,
            }
          )}
        >
          {editOpen && (
            <>
              <div className="px-4 flex flex-col divide-y">
                <div className="py-4">
                  {chosenIsNode.current ? (
                    <Label className="text-[grey]">Editing Node</Label>
                  ) : (
                    <Label  className="text-[grey]">Editing Edge</Label>
                  )}
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-row space-x-2 py-4">
                      <Switch onCheckedChange={(checked: boolean) => setUseCustomLabel(checked)}/>
                      <Label className="py-2">Use Custom Label</Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Customize how your graph is displayed. OpenJustice will NOT use this to generate a response.
                  </TooltipContent>
                </Tooltip>
                
                <div className="py-4">
                  {useCustomLabel && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col">
                          <Label className="py-2">Label:</Label>
                          <Input
                            value={chosenLabel}
                            onChange={(event) => setChosenLabel(event.target.value)} 
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                          Edit how the node or edge is shown in the Dialog Flow window. OpenJustice will NOT use this to generate a response.
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col">
                        <Label className="py-2">Body:</Label>
                        <Textarea
                          wrap="soft" 
                          value={chosenBody} 
                          onChange={(event) => setChosenBody(event.target.value)} 
                        /> 
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      Edit the content of the node or edge. OpenJustice will use this to generate a response.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-nowrap border-top-width-0">
                Use this dialog to edit the selected node or edge. 
              </Label>
            </>
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
          <FlowGraph setOpen={setOpen}/>
        </DialogContent>
      </Dialog>
    </ReactFlowProvider>
  );
}