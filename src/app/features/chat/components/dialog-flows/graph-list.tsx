import React, { useState, useEffect } from "react";

import { auth } from "@/lib/firebase/firebase-admin/firebase";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { PlusSquare } from "lucide-react";

export default function GraphList(
  { 
    DBURL, setGraphId, graphId, setGraphLoading, handleNewGraph 
  }: {
    DBURL: string,
    setGraphId: React.Dispatch<React.SetStateAction<string | null>>,
    graphId: string | null,
    setGraphLoading: React.Dispatch<React.SetStateAction<boolean>>,
    handleNewGraph: () => void
  }
) {
  const [graphList, setGraphList] = useState<{name:string, id:string}[]>([]);
  const [universalGraphList, setUniversalGraphList] = useState<{name:string, id:string}[]>([]);

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
    })  
  }, []);

  return (
    <div className="flex flex-col px-4 mt-[60px] min-w-[180px] w-1/5">
      <Label className="text-[#838383] mb-2">
        User Created Graphs
      </Label>
      {graphList.map((item: {name: string, id: string}, key: number) => (
        <button key={key} type="button" onClick={()=>{
          if (graphId !== item.id) { // no update if the graph is already selected
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
  )
  
}
