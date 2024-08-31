const { getFirestore } = require("firebase-admin/firestore");
const { auth } = require("firebase-admin");
const {
  initBackendFirebaseApp,
} = require("../../src/util/api/middleware/initBackendFirebaseApp");
import admin from "firebase-admin";

exports.handler = async (event: any, context: any) => {
  const { fullConversation, includedDocuments, title } = JSON.parse(event.body);

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!)
      ),
      databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
    });
  }

  // Authenticate the user
  // Since this is a serverless function, you won't be able to use cookies.
  // You'll need to pass the user's token in the request body and validate it here.
  // const { earlyResponse, decodedToken } = await authenticateApiUser();
  // if (earlyResponse) return earlyResponse;

  const decodedToken = await auth().verifyIdToken(
    event.headers.authorization.split("Bearer ")[1]
  );
  const uid = decodedToken.uid;

  initBackendFirebaseApp();

  try {
    const docRef = await getFirestore().collection("conversations").doc();

    await docRef.create({
      conversation: fullConversation,
      documents: includedDocuments,
      title: title,
      userUid: uid,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ uid: docRef.id }),
    };
  } catch (error: any) {
    console.error(error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
