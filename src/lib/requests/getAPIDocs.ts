/**
 * @file: fetchKeywordDocs.ts - Retrieves documents from courtlistener and Google Search Engine
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { auth } from "@/lib/firebase/firebase";
import { apiErrorResponse, errorResponse } from "@/utils/utils";

/**
 * Retrieves related documents via courtListener and GoogleAPI
 *
 * @param userQuery
 * @returns
 */
export async function fetchKeywordDocs(userQuery: string, namespace: string) {
  try {
    const response = await fetch("/api/conversation/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
      },
      body: JSON.stringify({ userQuery, namespace }),
    });

    // Retrieve keyword relevant docs
    if (response.ok) return await response.json();
    else return apiErrorResponse("Failed to fetch api docs");
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
