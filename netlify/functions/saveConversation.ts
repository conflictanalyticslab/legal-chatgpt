const {
    getFirestore,
  } = require("firebase-admin/firestore");
  
//   const { authenticateApiUser } = require("@/util/api/middleware/authenticateApiUser");
const { auth } = require('firebase-admin');
const { initBackendFirebaseApp } = require("../../src/util/api/middleware/initBackendFirebaseApp");
import admin from "firebase-admin";
// const { userConverter } = require("@/util/User");

exports.handler = async (event:any, context:any) => {
    const { fullConversation, includedDocuments, title} = JSON.parse(event.body);

    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!)
      ),
      databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
    });
  
    // Authenticate the user 
    // Since this is a serverless function, you won't be able to use cookies.
    // You'll need to pass the user's token in the request body and validate it here.
    // const { earlyResponse, decodedToken } = await authenticateApiUser();
    // if (earlyResponse) return earlyResponse;

    const decodedToken = await auth().verifyIdToken(event.headers.authorization.split('Bearer ')[1]);
    const uid = decodedToken.uid;
  
    initBackendFirebaseApp();
  
    try {
      const docRef = await getFirestore().collection("conversations").doc();

      // console.log("conversation: ", conversation);
      // console.log("documents: ", documents);
      // console.log("title: ", title);
      // console.log("uid: ", uid);

      await docRef.create({
        conversation: fullConversation,
        documents: includedDocuments,
        title: title,
        userUid: uid,
      });
  
      // const userDocRef = getFirestore().collection("users").doc(user).withConverter(userConverter);
  
      // const data = (await userDocRef.get()).data();
      // if (data) {
      //   const to_update = ((data == null) ? [] : data.conversations).concat([docRef.id]);
  
      //   await userDocRef.update({conversations: to_update});
      // }
  
      return {
        statusCode: 201,
        body: JSON.stringify({ uid: docRef.id }),
      };
    } catch (error:any) {
      console.error(error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };