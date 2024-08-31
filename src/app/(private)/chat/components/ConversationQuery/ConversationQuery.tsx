import { useChatContext } from "../../store/ChatContext"

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import Image from "next/image";

import UploadDocument from "./UploadDocument/UploadDocument";
import { FlowModal } from "../FlowGraph/FlowGraph";
import useFetchQuery from "../../hooks/useFetchQuery";
import { useEffect } from "react";

export function ConversationQuery() {
  const {
    enableRag,
    loading,
    userQuery,
    setUserQuery,
    num,
    stopQuery,
  } = useChatContext();

  const {fetchQuery} = useFetchQuery()
  /**
   * Submits the user's query
   * To Do: make it so that handle submit only calls the LLM output so we don't have to wait until all the other proccess are complete before generating output
   *
   * @returns {void}
   */
  const handleSubmit = async (event: React.MouseEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchQuery(userQuery);
  };

  return (
    <form
      className="shadow-none bg-[#f5f5f7] w-chat mx-auto h-[100px]"
      onSubmit={handleSubmit}
    >
      <div className="relative">
        <UploadDocument/> 

        <FlowModal setUserQuery={setUserQuery}/>

        <Input
          className="w-full flex bg-[#F8F8F8] min-h-[56px] pr-[60px] focus-visible:ring-[none] "
          placeholder="Ask OpenJustice"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
        />
        {loading ? (
          <Button
            className="absolute right-0 top-[50%] translate-y-[-50%]"
            variant={"ghost"}
            onClick={stopQuery}
          >
            {enableRag ? (
              <LoadingSpinner />
            ) : (
              <Image
                src="/assets/icons/pause.svg"
                alt="pause"
                width={20}
                height={20}
              />
            )}
          </Button>
        ) : (
          <Button
            className="absolute right-[0.5rem] top-[50%] translate-y-[-50%]"
            variant={"ghost"}
            type="submit"
          >
            <Image
              src="/assets/icons/send-horizontal.svg"
              alt="send"
              width={20}
              height={20}
            />
          </Button>
        )}
        <label className="text-[grey] text-sm absolute bottom-[-20px] italic ">
          {num === 0
            ? "No more prompts allowed. Please enter your final feedback."
            : `Prompts left: ${num}`}
        </label>
      </div>
    </form>
  );
}
