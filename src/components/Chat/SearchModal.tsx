'use client'
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { similaritySearch } from "../../app/chat/api/semantic-search";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useChatContext } from "./store/ChatContext";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { elasticDtoToRelevantDocuments, pineconeDtoToRelevantDocuments } from "@/app/chat/api/documents/transform";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import Container from "../ui/Container";
import { postSearchTerms } from "@/util/requests/postSearchTerms";

const SearchModal = () => {
  const { relevantDocs, setRelevantDocs, documentQuery, setDocumentQuery, namespace, documentQueryMethod, setAlert, setLoading } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    documentQuery: z.string().min(0, {
      message: "Query shouldn't be empty",
    }).optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentQuery: documentQuery,
    },
  });

  const onsubmit = async (form: z.infer<typeof formSchema>) => {
    if(isLoading)
      return;
    
    setIsLoading(true);

    const query = form?.documentQuery as string;

    if (documentQueryMethod=== "elastic") {
      console.log("SEARCHING FROM ELASTIC")
      // Generate elastic search prompt and document prompt from Open AI
      const elasticSearchResp = await postSearchTerms(documentQuery);

      if (!elasticSearchResp.ok) {
        const errorData = await elasticSearchResp.json();
        setAlert(errorData.error);
        setLoading(false);
        return;
      }

      // Retrieve elastic search results and get selected pdf document(s) text
      const { elasticSearchResults } = await elasticSearchResp.json();

      setRelevantDocs(elasticDtoToRelevantDocuments(elasticSearchResults))
    } else {
      console.log("SEARCHING FROM PINECONE")

      try {
        const similarDocs = await similaritySearch(query, 3, namespace);
        setRelevantDocs(pineconeDtoToRelevantDocuments(similarDocs));
      } catch (e) {
        console.log(e);
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="w-full flex gap-5 justify-start">
          <Image
            src="/assets/icons/search.svg"
            height={15}
            width={15}
            alt="search"
          />
          Search PDFs
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[60vw] flex flex-col gap-5 overflow-auto box-border"
      >
        <DialogTitle className="hidden"></DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="documentQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-black">
                    Search for relevant PDFs.
                  </FormLabel>
                  <div className="flex gap-4">
                    {/* Document Query Input */}
                    <FormControl>
                      <Input
                        placeholder="What is employment Law?"
                        {...field}
                        value={documentQuery}
                        onChange={(event) =>
                          setDocumentQuery(event.target.value)
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div
          className={cn(
            `flex flex-col gap-3 w-full bg-transparent relative ${
              relevantDocs.length === 0 ? "h-full" : "h-[min-content]"
            }`
          )}
        >
          {relevantDocs && relevantDocs.length > 0 ? (
            relevantDocs.map((doc: any, i: number) => (
              <Card key={i}>
                <a href={doc.url} target="_blank">
                  <CardHeader>
                    <CardTitle className="font-normal">
                      {doc.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <Label className="font-bold">URL:</Label>
                      <output>{doc.url}</output>
                    </div>
                    <div className="flex flex-col">
                      <Label className="font-bold">Abstract</Label>
                      <output className="max-h-[200px] text-ellipsis line-clamp-6">
                        {doc.content}
                      </output>
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))
          ) : isLoading ? (
            <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center gap-3 flex-col">
              Finding Relevant Documents
              <LoadingSpinner />
            </Label>
          ) : (
            <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              No Documents Available.
            </Label>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
