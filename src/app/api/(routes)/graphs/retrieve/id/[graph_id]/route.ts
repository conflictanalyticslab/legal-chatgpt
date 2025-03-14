import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { apiErrorResponse } from "@/lib/utils";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ graph_id: string }> }
) {
  const { graph_id } = await params;

  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  initBackendFirebaseApp();

  try {
    const doc = await getFirestore().collection("graphs").doc(graph_id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Not found", data: null },
        { status: 404 }
      );
    }

    const { user_id, ...data } = doc.data()!;

    return NextResponse.json(
      {
        success: true,
        error: null,
        data: {
          id: doc.id,
          ...data,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 400 });
  }
}
