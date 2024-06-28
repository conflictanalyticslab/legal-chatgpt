const {
    getFirestore,
  } = require("firebase-admin/firestore");
  const { initBackendFirebaseApp } = require("../../src/util/api/middleware/initBackendFirebaseApp");

import admin from "firebase-admin";
  
//   const { authenticateApiUser } = require("@/util/api/middleware/authenticateApiUser");
  
  exports.handler = async (event:any, context:any) => {
    const { uid, fullConversation, includedDocuments, title} = JSON.parse(event.body);
  
    // Authenticate the user 
    // const { earlyResponse, decodedToken } = await authenticateApiUser();
    // if (earlyResponse) return earlyResponse;

    // check if firebase admin backend is initialized, if not, initialize it here
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!)
        ),
        databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
      });
    }
  
    initBackendFirebaseApp();
  
    try {
      // get document reference in firestore
      const convoRef = getFirestore().collection("conversations").doc(uid);
  
      if (!convoRef) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "No matching conversation found" }),
        };
      }
      
      // update the conversation with the new data
      await convoRef.update({conversation: fullConversation, documents: includedDocuments, title: title });

      console.log("conversation: ", fullConversation);
      console.log("documents: ", includedDocuments);
      console.log("title: ", title);
      console.log("uid: ", uid);
      console.log("=================updateConversation===================")
  
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