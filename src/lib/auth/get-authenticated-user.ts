import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/lib/middleware/authenticate-api-user";

/**
 * Authenticates User
 *
 * @returns
 */
export async function getAuthenticatedUser() {
  const { errorResponse, decodedToken } = await authenticateApiUser();
  if (!decodedToken) return errorResponse;
  return decodedToken;
}
