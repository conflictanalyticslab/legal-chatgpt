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
  type OnConnectStart,
  Connection,
  OnConnectEnd,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 

import { Route, HelpCircle } from 'lucide-react';

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
const getId = () => `${id++}`; // generates unique ids
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "85%",
  height: "85%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflow: "scroll",
  overflowY: "auto",
};

function FlowGraph() {
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
  // TODO: disable save button until this has loaded
  // const [graphId, setGraphId] = useState("Loading..."); 

  const { screenToFlowPosition } = useReactFlow();

  const onNodeClick = useCallback<{(_: any, node: Node): void}>(
    (_, node) => {
      chosenNodeId.current = node.id;
      chosenIsNode.current = true;
      setChosenLabel(node.data.label as string);
      setChosenBody(node.data.body as string);
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
        setChosenBody("");
      }
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
        const id = getId();
        const newNode: Node = {
          id,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { 
            label: `node ${id}`,
            body: 'default body'
          },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        const edgeParams = { 
          id,
          source: connectingNodeId.current, 
          target: id, 
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

  // const handleSubmit = () => {
  //   fetch('http://localhost:8080/graph/update', {
  //     method: 'POST',
  //     mode: 'cors',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       nodes: nodes,
  //       edges: edges,
  //       graphId: graphId
  //     }) 
  //   }).then(response => console.log(response)) // needs something better
  // }
  // useEffect(() => {
  //   // create new graph
  //   fetch('http://localhost:8080/graph/new', {
  //     method: 'GET',
  //     mode: 'cors',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }
  //   }).then(response => {
  //     return response.json();
  //   }).then(data => {
  //     setGraphId(data.id);
  //   })
  // }, []);

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
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        fitView
        minZoom={0.2}
      >
        <Controls />
        <Background />
        <div 
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            zIndex: 4,
            fontSize: "12px",
          }}
        >
          <label style={{display: "block"}}>label:</label>
          <input
            value={chosenLabel}
            onChange={(event) => setChosenLabel(event.target.value)}
          />
          <label style={{display: "block"}}>body:</label>
          <input 
            value={chosenBody} 
            onChange={(event) => setChosenBody(event.target.value)} 
          /> 
        </div>
      </ReactFlow>
    </div>
    
  );
};

export function FlowModal() {
  return (
    <ReactFlowProvider>
      <Dialog>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-[#E2E8F0] bg-[transparent] h-[56px] w-[56px] absolute left-[-60px]"
                  type="button"
                  aria-label="Flow Graph"
                >
                  <Route />
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
          className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[60vw] flex flex-col gap-5 overflow-auto box-border"
        >
          <DialogTitle className="hidden"></DialogTitle>
          <FlowGraph />
        </DialogContent>
      </Dialog>
    </ReactFlowProvider>
  );
}