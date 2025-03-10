import { getAdminDatabase } from "./firebaseAdminCore";
import { Database } from "firebase-admin/database";

// Re-export the database from the core module
export const adminDb = getAdminDatabase();

/**
 * Fetches data from Firebase Realtime Database using admin privileges
 */
export async function adminFetchData(path: string): Promise<any> {
  if (!adminDb) {
    throw new Error("Firebase Admin DB is not initialized");
  }

  try {
    const dataRef = adminDb.ref(path);
    const snapshot = await dataRef.get();

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  } catch (error) {
    console.error(`Error fetching data from ${path} with admin:`, error);
    throw error;
  }
}

/**
 * Deletes data from Firebase Realtime Database using admin privileges
 */
export async function adminDeleteData(path: string): Promise<void> {
  if (!adminDb) {
    throw new Error("Firebase Admin DB is not initialized");
  }

  try {
    const dataRef = adminDb.ref(path);
    await dataRef.remove();
    console.log(`Successfully deleted data at ${path}`);
  } catch (error) {
    console.error(`Error deleting data at ${path} with admin:`, error);
    throw error;
  }
}

export default {
  adminDb,
  adminFetchData,
  adminDeleteData,
};
