import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getDatabase, Database } from "firebase-admin/database";

// Define a type for the Firebase Admin instance
export interface FirebaseAdminCore {
  app: App | null;
  db: Firestore | null;
  auth: Auth | null;
  rtdb: Database | null;
}

// Singleton instance
let instance: FirebaseAdminCore | null = null;

/**
 * Initialize Firebase Admin SDK - centralized initialization for the entire project
 * This function ensures that Firebase Admin is initialized only once
 */
export function getFirebaseAdminCore(): FirebaseAdminCore {
  if (instance) {
    return instance;
  }

  const apps = getApps();
  let app: App | null = null;

  // Initialize the app if it doesn't exist
  if (!apps.length) {
    try {
      // Check for required environment variables
      if (
        !process.env.FIREBASE_ADMIN_PROJECT_ID ||
        !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
        !process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ) {
        console.error("Missing Firebase Admin environment variables");
        instance = { app: null, db: null, auth: null, rtdb: null };
        return instance;
      }

      // Replace newlines in the private key
      let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

      // Handle different formats of private key
      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      console.log("Initializing Firebase Admin Core...");

      // Initialize the app with all required configurations
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });

      console.log("Firebase Admin Core initialized successfully");
    } catch (error) {
      console.error("Firebase Admin Core initialization error:", error);
      instance = { app: null, db: null, auth: null, rtdb: null };
      return instance;
    }
  } else {
    // Use the existing app
    app = apps[0];
    console.log("Using existing Firebase Admin app");
  }

  try {
    // Initialize all services
    const db = getFirestore(app);
    const auth = getAuth(app);
    const rtdb = getDatabase(app);

    instance = { app, db, auth, rtdb };
    return instance;
  } catch (error) {
    console.error("Error initializing Firebase Admin services:", error);
    instance = { app, db: null, auth: null, rtdb: null };
    return instance;
  }
}

// Export individual services for convenience
export function getAdminAuth(): Auth {
  const { auth } = getFirebaseAdminCore();
  if (!auth) {
    throw new Error("Firebase Admin Auth is not initialized");
  }
  return auth;
}

export function getAdminFirestore(): Firestore {
  const { db } = getFirebaseAdminCore();
  if (!db) {
    throw new Error("Firebase Admin Firestore is not initialized");
  }
  return db;
}

export function getAdminDatabase(): Database {
  const { rtdb } = getFirebaseAdminCore();
  if (!rtdb) {
    throw new Error("Firebase Admin Realtime Database is not initialized");
  }
  return rtdb;
}

// Initialize Firebase Admin on module load
getFirebaseAdminCore();
