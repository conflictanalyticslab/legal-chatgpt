const {
    getFirestore,
  } = require("firebase-admin/firestore");
  
//   const { authenticateApiUser } = require("@/util/api/middleware/authenticateApiUser");
const { initBackendFirebaseApp } = require("../../src/util/api/middleware/initBackendFirebaseApp");
  
  exports.handler = async (event, context) => {
    const { uid, conversation, documents, title} = JSON.parse(event.body);
  
    // Authenticate the user 
    // const { earlyResponse, decodedToken } = await authenticateApiUser();
    // if (earlyResponse) return earlyResponse;
  
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
    } catch (error) {
      console.error("conversation uid: ", uid, error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };