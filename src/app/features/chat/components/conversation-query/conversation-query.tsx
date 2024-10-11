import { useGlobalContext } from "@/app/store/global-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

import UploadDocument from "../upload-document/upload-document";
import { FlowModal } from "../dialog-flows/flow-graph";
import useFetchQuery from "@/app/features/chat/hooks/use-fetch-query";

export function ConversationQuery() {
  const { loading, userQuery, setUserQuery, num, stopQuery, dialogFlowName } = useGlobalContext();

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
      className="shadow-none bg-[#f5f5f7] w-full ml-auto md:mx-auto h-[80px] flex items-start justify-center"
      onSubmit={handleSubmit}
    >
      <div className="relative flex h-[45px] md:h-[56px] w-full md:w-chat mx-2">
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
        <label className="text-[grey] text-sm absolute left-[45px] md:left-auto bottom-[-20px] italic ">
          {num === 0
            ? "No more prompts allowed. Please enter your final feedback."
            : `Prompts left: ${num}`}
        </label>
        <label className="text-[grey] text-sm absolute bottom-[-20px] right-[0px] italic ">
          {dialogFlowName === ""
            ? "Dialog Flow not in use"
            : "Dialog Flow in use: " + dialogFlowName}
        </label>
      </div>
    </form>
  );
}
