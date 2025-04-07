import admin from "firebase-admin";

// var serviceAccount = require("serviceAccountKey.json");

export function initBackendFirebaseApp() {

  
  // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
  if (admin.apps.length === 0) {

    // load Firebase configuration from a JSON file included above
    if (typeof serviceAccount !== 'undefined') {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      throw new Error(
        "Missing FIREBASE_ADMIN_SERVICE_ACCOUNT from environment variables"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(
        // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
        JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
      ),
      databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
    });
  }
}
