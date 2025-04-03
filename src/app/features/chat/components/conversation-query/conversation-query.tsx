import { useGlobalContext } from "@/app/store/global-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Edit, SquareMinus } from "lucide-react";

import UploadDocument from "../upload-document/upload-document";
import { FlowModal } from "../dialog-flows/flow-graph";
import useFetchQuery from "@/app/features/chat/hooks/use-fetch-query";
import { useGlobalDialogFlowStore } from "../dialog-flows/store";

export function ConversationQuery() {
  const { loading, userQuery, setUserQuery, num, stopQuery } =
    useGlobalContext();
  const { compiledDialogFlow, setCompiledDialogFlow } =
    useGlobalDialogFlowStore();
  const { fetchQuery } = useFetchQuery();
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
      className="shadow-none bg-[#f5f5f7] md:w-chat ml-auto md:mx-auto h-[80px] flex flex-col justify-center"
      onSubmit={handleSubmit}
    >
      <div className="relative flex h-[45px] md:h-[56px] w-full shrink-0">
        <UploadDocument />

        <FlowModal />

        <Input
          className="w-full flex bg-[#F8F8F8] pr-[60px] h-full focus-visible:ring-[none] text-base self-center"
          placeholder="Ask OpenJustice"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
        />
        {loading ? (
          <Button
            className="absolute right-2 top-[50%] translate-y-[-50%] h-auto"
            variant={"ghost"}
            onClick={stopQuery}
          >
            <div className="aspect-square w-[15px] md:w-[20px] h-auto relative">
              <Image src="/assets/icons/pause.svg" alt="pause" fill />
            </div>
          </Button>
        ) : (
          <Button
            className="absolute right-2 top-[50%] translate-y-[-50%] h-auto"
            variant={"ghost"}
            type="submit"
          >
            <div className="aspect-square w-[15px] md:w-[20px] h-auto relative">
              <Image src="/assets/icons/send-horizontal.svg" alt="send" fill />
            </div>
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center -mt-2 z-10">
        <label className="text-[grey] text-sm italic">
          {num === 0
            ? "No more prompts allowed. Please enter your final feedback."
            : `Prompts left: ${num}`}
        </label>

        <div className="flex items-center">
          <label className="text-[grey] text-sm italic ">
            {compiledDialogFlow
              ? "Dialog Flow in use: " + compiledDialogFlow.name
              : "Dialog Flow not in use"}
          </label>

          {compiledDialogFlow && (
            <>
              <Button
                variant={"ghost"}
                className="bg-transparent -mr-4"
                onClick={() => alert("TODO")}
              >
                <Edit />
              </Button>
              <Button
                variant={"ghost"}
                className="bg-transparent -mr-4"
                onClick={() => {
                  setCompiledDialogFlow(null);
                }}
              >
                <SquareMinus />
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
