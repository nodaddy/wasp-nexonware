import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { firebaseConfig } from "../firebaseConfig";

// Updated Firebase client instance type
interface FirebaseClientInstance {
  app: FirebaseApp | null;
  auth: Auth | null;
  database: Database | null;
}

// Initialize Firebase for client-side
function initializeFirebase(): FirebaseClientInstance {
  const apps = getApps();

  if (!apps.length) {
    try {
      const app = initializeApp(firebaseConfig);
      return {
        app,
        auth: getAuth(app),
        database: getDatabase(app),
      };
    } catch (error) {
      console.error("Firebase client initialization error:", error);
      return {
        app: null,
        auth: null,
        database: null,
      };
    }
  } else {
    return {
      app: apps[0],
      auth: getAuth(apps[0]),
      database: getDatabase(apps[0]),
    };
  }
}

// Export Firebase client instances
export const { app, auth, database } = initializeFirebase();
