import { type NextRequest, NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";

export async function POST(
  req: NextRequest,
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

  const firestore = getFirestore();
  const graphRef = firestore.collection("graphs").doc(id);

  const res = await graphRef.get();
  if (!res.exists) {
    return NextResponse.json(
      { success: false, error: "Not Found", data: null },
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

  const body = (await req.json()) as { add: string[]; delete: string[] };
  if (!body.add.length && !body.delete.length) {
    return NextResponse.json(
      { success: false, error: "Bad Request", data: null },
      { status: 400 }
    );
  }

  const users = await firestore
    .collection("users")
    .where("email", "in", [...body.add, ...body.delete])
    .get();

  let m: Record<string, string> = {};
  users.forEach((user) => {
    if (user.id === user_id) return;
    m[user.data().email] = user.id;
  });

  const ids = {
    add: body.add.reduce((ids, email) => {
      if (email in m) return [...ids, m[email]];
      return ids;
    }, [] as string[]),
    delete: body.delete.reduce((ids, email) => {
      if (email in m) return [...ids, m[email]];
      return ids;
    }, [] as string[]),
  };

  const updated_at = Date.now();
  await graphRef.update({
    shared_with: [
      ...(graph.shared_with || []).filter((id: string) => {
        return !ids.delete.includes(id);
      }),
      ...ids.add,
    ],
    updated_at,
  });

  return NextResponse.json(
    {
      success: true,
      error: null,
      data: {
        id,
        updated_at,
        shared_with: {
          add: body.add.filter((email) => email in m),
          delete: body.delete.filter((email) => email in m),
        },
      },
    },
    { status: 200 }
  );
}
