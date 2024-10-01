import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobalContext } from "@/app/store/global-context";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash } from "lucide-react";
import { deleteDocument } from "@/lib/firebase/client/delete-document";
import { editDocument } from "@/lib/firebase/client/edit-document";

export default function UploadedDocuments() {
  const [editing, setEditing] = useState("");
  const [inputValue, setInputValue] = useState("");
  const textFieldRef = useRef<any>(null);

  const {
    documents,
    includedDocuments,
    setIncludedDocuments,
    documentContent,
    setDocumentContent,
    setDocuments,
  } = useGlobalContext();

  const toggleIncludeDocument = (document: any) => {
    // Toggles whether the document should be included or not based on whether it already exists
    if (includedDocuments.includes(document.uid)) {
      // Remove the documents text
      setDocumentContent(documentContent.replace(document.text, ""));

      // Remove the document's id from the list of included documents
      setIncludedDocuments(
        includedDocuments.filter((docUid: string) => docUid != document.uid)
      );
    } else {
      // Add the toggled documents content
      setDocumentContent(documentContent + " " + document.text);

      // Add the document's id from the list of included documents
      setIncludedDocuments([...includedDocuments, document.uid]);
    }
  };

  /**
   * Handles with deleting document
   * @param uid
   */
  const handleDeleteDoc = async (uid: string) => {
    try {
      await deleteDocument(uid);
      setDocuments(documents.filter((doc: any) => doc.uid !== uid));
      setIncludedDocuments(
        includedDocuments.filter((doc: any) => doc.uid !== uid)
      );
    } catch (error: any) {
      toast({
        title: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 grid grid-rows-[auto_1fr] items-start gap-4 py-8 overflow-hidden h-full">
      <Label className="font-bold pt-[1rem]">Uploaded Documents</Label>

      {/* Uploaded Documents */}
      <div className="grid grid-cols-1 gap-2 overflow-y-auto h-full">
        {documents.length > 0 ? (
          documents.map((document: any, i: number) => (
            <div key={i}>
              <Card className="bg-transparent">
                <CardHeader className="flex justify-between flex-row items-center">
                  {/* Document Title */}
                  <Label className="font-bold break-words">
                    {document.name}
                  </Label>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                  {/* Document Text */}
                  <p className="line-clamp-6 text-sm">{document.text}</p>

                  {/* Document Actions */}
                  <div className="flex gap-3 justify-end">
                    {/* Include Document In Conversation */}
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger className="!m-0" asChild>
                          <Checkbox
                            className="border-[1.5px] self-start h-[15px] w-[15px]"
                            checked={includedDocuments.includes(document.uid)}
                            onClick={() => toggleIncludeDocument(document)}
                          />
                        </TooltipTrigger>
                        <TooltipContent align="end" sideOffset={10}>
                          Include in conversation
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Edit Document */}
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => {
                            setEditing(document.uid);
                            setInputValue(document.text);
                            if (textFieldRef.current) {
                              textFieldRef.current.focus();
                            }
                          }}
                        >
                          <Pencil className="w-4 h-4"/>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                          Edit document text
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Delete Document */}
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => handleDeleteDoc(document.uid)}
                        >
                          <Trash className="w-4 h-4"/>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                          Delete document
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>

              {/* Edit PDF */}
              {editing && (
                <div className="flex flex-col gap-2 mt-[10px]">
                  <Label className="text-center mt-3 font-bold">
                    Editing: {document.name}:
                  </Label>
                  <div className="flex flex-col justify-end">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      ref={textFieldRef}
                      rows={10}
                    />
                    <Button
                      variant="default"
                      className="mt-3 self-end"
                      onClick={() => {
                        if (
                          textFieldRef.current &&
                          textFieldRef.current.value
                        ) {
                          try {
                            editDocument(editing, textFieldRef.current?.value);
                            // Questionable code...?
                            documents.filter(
                              (doc: any) => doc.uid === editing
                            )[0].text = textFieldRef.current?.value;
                            setEditing("");
                          } catch (e) {
                            console.error("Error editing document: " + e);
                          }
                        }
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <Card className="bg-transparent w-full ">
            <CardContent className="p-3 flex justify-center h-[100px] items-center">
              <Label className="text-center">No Documents Uploaded</Label>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
