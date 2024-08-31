/**
 * @file: postSearchTerms.ts - Retrieves documents from courtlistener and Google Search Engine
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { auth } from "@/lib/firebase/firebase";
import { apiErrorResponse } from "@/utils/utils";

/**
 * Retrieves related documents via courtListener and GoogleAPI
 *
 *
 * @param userQuery
 * @returns
 */
export async function postSearchTerms(userQuery: string) {
  try {
    // TODO: fix the file route directory name it should really be called api/conversation/documents/route.ts
    const response = await fetch("/api/conversation/searchTerms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
      },
      body: JSON.stringify({ userQuery }),
    });

    // Retrieve elastic search results and get selected pdf document(s) text
    if (response.status === 400) {
      throw "Couldn't fetch keyword searched documents from ";
    }

    return { success: true, error: null, data: await response.json() };
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
