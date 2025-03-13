import { useState, useEffect } from "react";
import { useGlobalContext } from "@/app/store/global-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { Paperclip } from "lucide-react";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";
import GPT4Tokenizer from "gpt4-tokenizer";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { uploadPdfDocument } from "@/app/api/(api-service-layer)/upload-pdf-document";
import { postPDF } from "@/app/api/(api-service-layer)/post-pdf";
import Dropzone from "react-dropzone";

const ACCEPT = ["application/pdf", ".pdf"];
const MAX_FILES = 1;
const MAX_SIZE = 5 * 1024 * 1024; /* 5 megabytes */

const REJECTED_MESSAGE = "File is too big. We have a 5 Mb limit.";

export default function UploadDocument() {
  const {
    setInfoAlert,
    documents,
    setDocuments,
    includedDocuments,
    setIncludedDocuments,
    setDocumentContent,
    loadingPDF,
    setLoadingPDF,
  } = useGlobalContext();

  const { openFilePicker } = useFilePicker({
    accept: ACCEPT[1],
    readAs: "ArrayBuffer", // ArrayBuffer takes exactly as much space as the original file. DataURL, the default, would make it bigger.
    validators: [
      new FileAmountLimitValidator({ max: MAX_FILES }),
      new FileSizeValidator({
        maxFileSize: MAX_SIZE,
      }),
    ],
    onFilesSelected: () => {
      setLoadingPDF(true);
    },
    onFilesRejected: ({ errors }) => {
      setInfoAlert(REJECTED_MESSAGE);
      setLoadingPDF(false);
    },
    onFilesSuccessfullySelected: async ({ plainFiles }: any) => {
      filesSuccessfullyUploaded(plainFiles);
    },
  });

  function handleUploadFile() {
    if (loadingPDF) return;
    openFilePicker();
  }

  async function filesSuccessfullyUploaded(plainFiles: any) {
    // this callback is called when there were no validation errors
    let estimatedTokenCount = -1;
    let pdfFileSize = -1;

    try {
      const pdfContent = await postPDF(plainFiles[0]); // Call the PDF processor api-end point to parse the pdf content

      // PDF file size check
      pdfFileSize = plainFiles[0].size;
      if (pdfFileSize > 5 * 1024 * 1024) {
        throw new Error("PDF File uploaded too large");
      }

      // PDF token count check
      const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
      estimatedTokenCount = tokenizer.estimateTokenCount(pdfContent.content);
      if (estimatedTokenCount > 16384) {
        throw new Error("PDF token limit exceeded");
      }

      // Add to the list of pdf content and add the document to the list of included documents
      setDocumentContent(pdfContent.content);
      const newDoc = await uploadPdfDocument({
        content: pdfContent.content,
        name: plainFiles[0].name,
      });

      // Add the documents to the list of uploaded documents
      setDocuments([...documents, newDoc]);
      setIncludedDocuments([...includedDocuments, newDoc.uid]);

      toast({
        title: "PDF uploaded successfully!",
      });

      setLoadingPDF(false);
    } catch (err: Error | any) {
      if (err.message === "PDF File uploaded too large") {
        toast({
          title:
            "The PDF file uploaded is too large, maximum of 5MB expected, your pdf is ' + pdfFileSize/(1024*1024) + ' bytes!",
          variant: "destructive",
        });
      } else if (
        err.message === "PDF token limit exceeded" &&
        estimatedTokenCount !== -1
      ) {
        toast({
          title:
            "The PDF file uploaded exceeds limit, maximum of 8192 token in each PDF uploaded, your pdf contains ' + estimatedTokenCount + ' tokens",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingPDF(false);
    }
  }

  const [isDropzoneVisible, setIsDropzoneVisible] = useState(false);
  const [isUploadingFileFromDropzone, setIsUploadingFileFromDropzone] =
    useState(false);

  // this effect makes the dropzone visible when the user drags a file onto the page
  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) {
        setIsDropzoneVisible(true);
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) {
        setIsDropzoneVisible(false);
      }
    };

    const handleDrop = () => {
      setIsDropzoneVisible(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <>
      {/**
       * the dropzone will be visible when:
       * - the user is dragging a file onto the page
       * - after dropping the file and it's accepted
       */}
      {isDropzoneVisible || isUploadingFileFromDropzone ? (
        <Dropzone
          accept={{ [ACCEPT[0]]: [ACCEPT[1]] }}
          maxFiles={MAX_FILES}
          maxSize={MAX_SIZE}
          onDropAccepted={async (files) => {
            setIsUploadingFileFromDropzone(true);
            setLoadingPDF(true);
            await filesSuccessfullyUploaded(files);
            setIsUploadingFileFromDropzone(false);
          }}
          onDropRejected={() => setInfoAlert(REJECTED_MESSAGE)}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              className={cn(
                "absolute bottom-[calc(100%+1rem)] left-0 right-0 border-2 rounded-md border-dashed h-[250px] flex items-center justify-center ",
                isDragActive || isUploadingFileFromDropzone
                  ? "text-sky-500 border-sky-400/50 bg-sky-50/50"
                  : "border-neutral-300 text-neutral-500"
              )}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <p>
                {isUploadingFileFromDropzone
                  ? "Uploading..."
                  : "Drop the file here for the LLM to use"}
              </p>
            </div>
          )}
        </Dropzone>
      ) : null}

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "hover:bg-transparent bg-[transparent] md:px-4 md:absolute left-[-70px] transition-all self-center",
                {
                  "opacity-[0.5] cursor-not-allowed": loadingPDF,
                }
              )}
              type="button"
              aria-label="Attach PDF"
              onClick={handleUploadFile}
            >
              {loadingPDF ? (
                <LoadingSpinner />
              ) : (
                <Paperclip className="w-3 md:w-5 h-3 md:h-5 rotate-[-45deg]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload document for the LLM to use</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
