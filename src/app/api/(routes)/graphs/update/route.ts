import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { apiErrorResponse } from "@/lib/utils";

export async function POST(req: Request) {
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
    const { id, name, ...data } = await req.json();

    let graphId = id;
    const updated_at = Date.now();
    if (id) {
      const graph = graphs.doc(id);

      const res = await graph.get();
      if (!res.exists) {
        return NextResponse.json(
          { success: false, error: "Not found", data: null },
          { status: 404 }
        );
      }

      const saved = res.data()!;
      if (!saved.user_id /* universal */) {
        // create a user-owned copy from universal graph
        const doc = graphs.doc();
        doc.set(
          { user_id, name: `${saved.name}_copy`, updated_at },
          { merge: true }
        );

        graphId = doc.id;
      } else {
        if (saved.user_id !== user_id) {
          return NextResponse.json(
            { success: false, error: "Forbidden", data: null },
            { status: 403 }
          );
        }
        graph.update({ user_id, name, ...data, updated_at });
      }
    } else {
      const graph = graphs.doc();
      await graph.create({ user_id, name, ...data, updated_at });

      graphId = graph.id;
    }

    return NextResponse.json({
      success: true,
      error: null,
      data: {
        id: graphId,
        updated_at,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 400 });
  }
}
