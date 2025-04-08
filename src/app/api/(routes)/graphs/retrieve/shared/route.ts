import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { apiErrorResponse } from "@/lib/utils";

export async function GET(_: Request) {
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
    const snapshot = await getFirestore()
      .collection("graphs")
      .where("shared_with", "array-contains", decodedToken.user_id)
      .where("public", "==", false)
      .get();
    return NextResponse.json(
      {
        success: true,
        error: null,
        data: snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              updated_at: (data.updated_at as number) || null,
            };
          })
          .sort((a, b) => {
            if (a.updated_at === null) return 1;
            if (b.updated_at === null) return -1;
            return b.updated_at - a.updated_at;
          }),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 500 });
  }
}
