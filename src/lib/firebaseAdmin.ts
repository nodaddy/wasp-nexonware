import { getAdminAuth, getAdminFirestore } from "./firebaseAdminCore";
import { Firestore } from "firebase-admin/firestore";
import { Auth } from "firebase-admin/auth";
import { FirebaseAdminInstance } from "@/types/firebase";

// Re-export the services from the core module
export const auth = getAdminAuth();
export const db = getAdminFirestore();

// For backward compatibility
export function initializeFirebaseAdmin(): FirebaseAdminInstance {
  return {
    db,
    auth,
  };
}
