import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/lib/middleware/authenticate-api-user";

/**
 * Authenticates User
 *
 * @returns
 */
export async function getAuthenticatedUser() {
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) return earlyResponse;
  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }
  return decodedToken;
}
