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
    const { id, ...data } = await req.json();

    let graphId = id;
    let name = data.name;
    const updated_at = Date.now();
    if (id) { // if id is provided, update the existing graph
      const graph = graphs.doc(id);

      const res = await graph.get();
      if (!res.exists) {
        return NextResponse.json(
          { success: false, error: "Not found", data: null },
          { status: 404 }
        );
      }

      const saved = res.data()!;
      if (data.public) {  // graph is public
        const doc = graphs.doc();
        graphId = doc.id;
        name = `${saved.name}_copy`;

        // create a private user-owned copy from public graphs
        doc.create({ user_id, ...data, name, updated_at, public: false });
      } else {  // graph is private
        const isShared = (saved.shared_with || []).includes(user_id);
        if (saved.user_id !== user_id && !isShared) {
          return NextResponse.json(
            { success: false, error: "Forbidden", data: null },
            { status: 403 }
          );
        }
        // user is the owner or is shared with
        graph.update({ ...data, updated_at });
      }
    } else {
      const graph = graphs.doc();
      graphId = graph.id;

      await graph.create({ user_id, ...data, updated_at });
    }

    return NextResponse.json({
      success: true,
      error: null,
      data: {
        id: graphId,
        name,
        updated_at,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 500 });
  }
}
