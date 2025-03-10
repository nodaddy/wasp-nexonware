import { db } from "./firebaseAdmin";
import { ExtensionPolicy, defaultExtensionPolicy } from "@/types/policies";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";
import { app } from "./firebase";

// Client-side Firestore instance
let firestore: Firestore | null = null;

// Initialize Firestore lazily
const getFirestoreInstance = (): Firestore | null => {
  if (firestore) return firestore;

  if (app) {
    firestore = getFirestore(app);
    return firestore;
  }

  console.error("Firebase app not initialized");
  return null;
};

/**
 * Get extension policy for a company
 * @param companyId - The company ID
 * @returns The extension policy or default policy if not found
 */
export async function getExtensionPolicy(
  companyId: string
): Promise<ExtensionPolicy> {
  if (!companyId) {
    console.warn("getExtensionPolicy called without companyId");
    return defaultExtensionPolicy;
  }

  try {
    const db = getFirestoreInstance();
    if (!db) {
      console.error("Firestore not initialized");
      return defaultExtensionPolicy;
    }

    const policyRef = doc(db, `companies/${companyId}/policies/extensions`);
    const policyDoc = await getDoc(policyRef);

    if (policyDoc.exists()) {
      const data = policyDoc.data();

      return {
        version: 2,
        actions: {
          paste: {
            restrictSensitive:
              data.actions?.paste?.restrictSensitive ??
              defaultExtensionPolicy.actions.paste.restrictSensitive,
            restrict:
              data.actions?.paste?.restrict ??
              defaultExtensionPolicy.actions.paste.restrict,
            warnBeforePaste:
              data.actions?.paste?.warnBeforePaste ??
              defaultExtensionPolicy.actions.paste.warnBeforePaste,
          },
        },
        metricsCollection: {
          urlCapture:
            data.metricsCollection?.urlCapture ??
            defaultExtensionPolicy.metricsCollection.urlCapture,
          fileUploads:
            data.metricsCollection?.fileUploads ??
            defaultExtensionPolicy.metricsCollection.fileUploads,
          fileDownloads:
            data.metricsCollection?.fileDownloads ??
            defaultExtensionPolicy.metricsCollection.fileDownloads,
          clipboardEvents:
            data.metricsCollection?.clipboardEvents ??
            defaultExtensionPolicy.metricsCollection.clipboardEvents,
        },
        metricsSettings: {
          retentionDays:
            data.metricsSettings?.retentionDays ??
            defaultExtensionPolicy.metricsSettings.retentionDays,
          anonymizeUserData:
            data.metricsSettings?.anonymizeUserData ??
            defaultExtensionPolicy.metricsSettings.anonymizeUserData,
          persistData:
            data.metricsSettings?.persistData ??
            defaultExtensionPolicy.metricsSettings.persistData,
        },
        blocklist: Array.isArray(data.blocklist) ? data.blocklist : [],
        allowlist: Array.isArray(data.allowlist) ? data.allowlist : [],
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };
    } else {
      return defaultExtensionPolicy;
    }
  } catch (error) {
    console.error("Error getting extension policy:", error);
    return defaultExtensionPolicy;
  }
}

/**
 * Save extension policy for a company
 * @param companyId - The company ID
 * @param policy - The extension policy to save
 * @param userId - The ID of the user saving the policy
 * @returns True if successful, false otherwise
 */
export async function saveExtensionPolicy(
  companyId: string,
  policy: ExtensionPolicy,
  userId: string
): Promise<boolean> {
  if (!companyId || !userId) {
    console.warn("saveExtensionPolicy called without companyId or userId");
    return false;
  }

  try {
    const db = getFirestoreInstance();
    if (!db) {
      console.error("Firestore not initialized");
      return false;
    }

    const policyRef = doc(db, `companies/${companyId}/policies/extensions`);

    // Ensure the policy has version 2
    const policyWithMeta = {
      ...policy,
      version: 2,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };

    // Check if document exists first
    const policyDoc = await getDoc(policyRef);

    if (policyDoc.exists()) {
      await updateDoc(policyRef, policyWithMeta);
    } else {
      await setDoc(policyRef, policyWithMeta);
    }

    return true;
  } catch (error) {
    console.error("Error saving extension policy:", error);
    return false;
  }
}
