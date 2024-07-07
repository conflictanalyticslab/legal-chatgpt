import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { UserDocument } from "@/util/requests/getDocumentsOwnedByUser";
import { editDocument } from "@/util/api/firebase_utils/editDocument";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";

type Props = {
    documents: UserDocument[];
    disabled: boolean,
    deleteDocument: (uid: string) => void;
    documentContent: string;
    setDocumentContent: React.Dispatch<React.SetStateAction<string>>;
    includedDocuments: string[];
    setIncludedDocuments: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function PDFModal({ documents, disabled,  deleteDocument, documentContent, setDocumentContent, includedDocuments, setIncludedDocuments }: Props) {
  const [editing, setEditing] = useState("");
  const [inputValue, setInputValue] = useState("");
  const textFieldRef = useRef<any>(null);

  const handleUpdateDocumentContent = (document:any) => {
    if (includedDocuments.includes(document.uid)) {
      // Remove the document's content from the state variable
      setDocumentContent(
        documentContent.replace(document.text, "")
      );
      
      // Remove the document's id from the list of included documents
      setIncludedDocuments(
        includedDocuments.filter(
          (docUid: string) => docUid != document.uid
        )
      );
    } else {
      // Add the document's content from the state variable
      setDocumentContent(
        documentContent + " " + document.text
      );

      // Add the document's id from the list of included documents
      setIncludedDocuments([
        ...includedDocuments,
        document.uid,
      ]);
    }
  }

  return (
    <Dialog>
      {/* Add Document Dropdown Menu Option */}
      <DialogTrigger asChild disabled={disabled}>
        <Button
          variant={"ghost"}
          className="w-full flex gap-5 justify-start"
        >
          <Image
            src={"/assets/icons/file-text.svg"}
            width={16}
            height={22}
            alt={"pdf file"}
          />
          <Label>Documents</Label>
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[60vw] flex flex-col gap-5 overflow-auto box-border"
      >
        <DialogTitle className="hidden"></DialogTitle>
        <div className="flex flex-col gap-4">
          <Label className="font-bold">Uploaded PDFs</Label>
          {/* Uploaded Documents */}
            <div className="grid grid-cols-1 gap-2">
              {documents.map((document, i) => (
                <div key={i}>
                  <Card className="">
                    <CardHeader className="flex justify-between flex-row items-center">

                      {/* Document Title */}
                      <Label className="font-bold break-words">{document.name}</Label>

                      {/* Include Document In Conversation */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="!m-0" asChild>
                            <Checkbox
                              checked={includedDocuments.includes(document.uid)}
                              onClick={()=>handleUpdateDocumentContent(document)}
                            />
                          </TooltipTrigger>
                          <TooltipContent align="end" sideOffset={10}>
                            Include in conversation
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3">
                      {/* Document Text */}
                      <p className="line-clamp-6">{document.text}</p>

                      {/* Document Actions */}
                      <div className="flex gap-3 justify-end">
                        {/* Edit Document */}
                        <TooltipProvider>
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
                              <Image
                                src={"/assets/icons/pencil.svg"}
                                alt="delete"
                                height={20}
                                width={20}
                              />
                            </TooltipTrigger>
                            <TooltipContent align="end">
                              Edit document text
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Delete Document */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => {
                                deleteDocument(document.uid);
                              }}
                            >
                              <Image
                                src={"/assets/icons/trash.svg"}
                                alt="delete"
                                height={20}
                                width={20}
                              />
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
                      <Label className="text-center">
                        Editing {document.name}:
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
                                editDocument(
                                  editing,
                                  textFieldRef.current?.value
                                );
                                documents.filter(
                                  (doc) => doc.uid == editing
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
              ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}