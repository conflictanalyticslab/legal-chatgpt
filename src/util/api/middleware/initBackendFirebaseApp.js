"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBackendFirebaseApp = void 0;
var firebase_admin_1 = require("firebase-admin");
function initBackendFirebaseApp() {
    // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
    if (firebase_admin_1.default.apps.length === 0) {
        if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
            throw new Error("Missing FIREBASE_ADMIN_SERVICE_ACCOUNT from environment variables");
        }
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(
            // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
            JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)),
            databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
        });
    }
}
exports.initBackendFirebaseApp = initBackendFirebaseApp;
