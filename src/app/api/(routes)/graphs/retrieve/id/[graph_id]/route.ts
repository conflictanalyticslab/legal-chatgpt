import { NextResponse } from "next/server";
import { FieldPath, getFirestore } from "firebase-admin/firestore";

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
  const firestore = getFirestore();

  try {
    const doc = await firestore.collection("graphs").doc(graph_id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Not found", data: null },
        { status: 404 }
      );
    }

    const { user_id, ...data } = doc.data()!;

    let shared_with = [];
    if (data.shared_with?.length) {
      const users = await firestore
        .collection("users")
        .where(FieldPath.documentId(), "in", data.shared_with)
        .get();

      let m: Record<string, string> = {};
      users.forEach((user) => (m[user.id] = user.data().email));

      shared_with = data.shared_with.reduce((emails: string[], id: string) => {
        if (id in m) return [...emails, m[id]];
        return emails;
      }, []); // keep the original order
    }

    return NextResponse.json(
      {
        success: true,
        error: null,
        data: {
          id: doc.id,
          ...data,
          shared_with,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 400 });
  }
}
