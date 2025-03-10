import { FirebaseApp } from "firebase/app";
import { Auth, User as FirebaseUser, UserCredential } from "firebase/auth";
import { Firestore } from "firebase-admin/firestore";
import { Auth as AdminAuth } from "firebase-admin/auth";

// Firebase client types
export interface FirebaseClientInstance {
  app: FirebaseApp | null;
  auth: Auth | null;
}

// Firebase admin types
export interface FirebaseAdminInstance {
  db: Firestore | null;
  auth: AdminAuth | null;
}

// Firebase configuration type
export interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
  databaseURL: string | undefined;
}

// User types
export interface CustomClaims {
  role?: string;
  companyId?: string;
  [key: string]: any;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
  customClaims?: CustomClaims;
  createdAt?: string;
  getIdToken?: () => Promise<string>;
}
