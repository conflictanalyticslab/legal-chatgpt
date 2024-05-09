const {
    getFirestore,
  } = require("firebase-admin/firestore");
  const { initBackendFirebaseApp } = require("../../src/util/api/middleware/initBackendFirebaseApp");

import admin from "firebase-admin";
  
//   const { authenticateApiUser } = require("@/util/api/middleware/authenticateApiUser");
  
  exports.handler = async (event:any, context:any) => {
    const { uid, conversation, documents, title} = JSON.parse(event.body);
  
    // Authenticate the user 
    // const { earlyResponse, decodedToken } = await authenticateApiUser();
    // if (earlyResponse) return earlyResponse;

    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!)
      ),
      databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
    });
  
    initBackendFirebaseApp();
  
    try {
      const convoRef = getFirestore().collection("conversations").doc(uid);
  
      if (!convoRef) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "No matching conversation found" }),
        };
      }
  
      await convoRef.update({conversation: conversation, documents: documents, title: title });
  
      return {
        statusCode: 200,
        body: JSON.stringify({ uid }),
      };
    } catch (error:any) {
      console.error("conversation uid: ", uid, error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };