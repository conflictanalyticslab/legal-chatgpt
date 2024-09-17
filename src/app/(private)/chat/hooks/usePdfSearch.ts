import { fetchKeywordDocs } from "@/lib/requests/getAPIDocs";
import { fetchSemanticDocs } from "../api/actions/fetchSemanticDocs";
import { auth } from "@/lib/firebase/firebase";
import { PineconeNamespaces } from "../enum/enums";
import { RelevantDocument } from "../types/RelevantDocument";
import { useChatContext } from "../store/ChatContext";
import { errorResponse } from "@/utils/utils";
import { toast } from "@/components/ui/use-toast";

/**
 * Retrieve relevant pdfs from either CourtListener or Static PDFs from Pinecone
 *
 * Note: since we are only doing either CourtListener or Static Semantic PDF search frrom Pinecone we don't need to specify the index name
 *
 * @param documentQueryMethod
 * @param userQuery
 * @param namespace
 * @param setRelevantDocs
 * @param setPdfLoading
 * @param setInfoAlert
 */
export function usePdfSearch() {
  const { setPdfLoading, setRelevantDocs, setInfoAlert } = useChatContext();

  /**
   * Fetches the relevant documents from either an api or pinecone
   * @param userQuery
   * @param namespace
   */
  const pdfSearch = async (userQuery: string, namespace: string) => {
    try {
      setPdfLoading(true);
      
      // Assign promises to variables to be called concurrently
      const keywordDocPromise = fetchKeywordDocs(userQuery, namespace);
      const semanticDocPromise = fetchSemanticDocs(
        (await auth?.currentUser?.getIdToken()) ?? "",
        userQuery,
        3,
        namespace
      );

      const useSemanticPromise =
        namespace === PineconeNamespaces.canadian_law ||
        namespace === PineconeNamespaces.french_law ||
        namespace === PineconeNamespaces.australian_law ||
        namespace === PineconeNamespaces.minimum_standards_termination ||
        namespace === PineconeNamespaces.reasonable_notice_termination ||
        namespace === PineconeNamespaces.without_cause_termination ||
        namespace === PineconeNamespaces.constructive_dismissal ||
        namespace === PineconeNamespaces.factors_affecting_notice ||
        namespace === PineconeNamespaces.just_cause_dismissal ||
        namespace === PineconeNamespaces.procedure_on_dismissal;
      const useKeywordPromise =
        namespace === PineconeNamespaces.canadian_law ||
        namespace === PineconeNamespaces.unitedStates_law;

      const documentResults: RelevantDocument[] = [];
      const [keywordDocs, pineconeDocs] = await Promise.all([
        keywordDocPromise,
        semanticDocPromise,
      ]);
      // Checks to see whether we are using Keyword and/or Semantic search
      if (useSemanticPromise && useKeywordPromise) {
        // Semantic && Keyword Promise
        if (!pineconeDocs?.success || !keywordDocs.success) {
          console.log("Pinecone docs", pineconeDocs);
          console.log("keyword docs", keywordDocs);
          throw new Error(pineconeDocs?.error ?? "");
        }

        documentResults.push(...(pineconeDocs.data as RelevantDocument[]));
        documentResults.push(...keywordDocs.data);
      } else if (useSemanticPromise) {
        // Semantic Promise
        if (!pineconeDocs?.success)
          throw new Error("Failed to fetch relevant documents");

        documentResults.push(...(pineconeDocs.data as RelevantDocument[]));
      } else if (useKeywordPromise) {
        // Keyword Promise
        if (!keywordDocs?.success)
          throw new Error("Failed to fetch relevant documents");

        documentResults.push(...keywordDocs.data);
      }

      // Notify if there were no documents available
      if (documentResults?.length === 0)
        toast({
          title: "No documents available for this dataset.",
          variant: "default",
        });

      setRelevantDocs(documentResults);
    } catch (e: unknown) {
      setInfoAlert(errorResponse(e));
    } finally {
      setPdfLoading(false);
    }
  };
  return { pdfSearch };
}
