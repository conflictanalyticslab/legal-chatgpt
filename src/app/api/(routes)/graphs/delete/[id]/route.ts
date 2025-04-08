import { type NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { apiErrorResponse } from "@/lib/utils";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", data: null },
      { status: 401 }
    );
  }
  const user_id = decodedToken.user_id;

  initBackendFirebaseApp();

  const graphs = getFirestore().collection("graphs");
  try {
    const graphRef = graphs.doc(id);

    const res = await graphRef.get();
    if (!res.exists) {
      return NextResponse.json(
        { success: false, error: "Not found", data: null },
        { status: 404 }
      );
    }

    const graph = res.data()!;
    if (graph.user_id !== user_id) {
      return NextResponse.json(
        { success: false, error: "Not Found", data: null },
        { status: 404 }
      );
    }

    await graphRef.delete();
    return NextResponse.json({ success: true, error: null, data: null });
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 500 });
  }
}
