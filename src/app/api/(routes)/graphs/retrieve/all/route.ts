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
      .where("user_id", "==", decodedToken.user_id)
      .get();
    return NextResponse.json(
      {
        success: true,
        error: null,
        data: snapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, name: data.name };
        }),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 400 });
  }
}
