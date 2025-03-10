"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserData } from "@/types/firebase";

// Define the Auth Context type
interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  getUserToken: () => Promise<string | null>;
  isAdmin: boolean;
  isAnalyst: boolean;
  userRole: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props type
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAnalyst, setIsAnalyst] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    // Check if auth is initialized
    if (!auth) {
      console.error("Firebase auth is not initialized");
      setError("Firebase auth is not initialized");
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get the ID token
            const token = await getIdToken(firebaseUser, true);

            // Fetch user data from our API
            const response = await fetch("/api/auth/user", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const userData = await response.json();

              // Check if user has admin role
              const role = userData.customClaims?.role;
              const hasAdminRole = role === "admin";
              const hasAnalystRole = role === "analyst";

              setIsAdmin(hasAdminRole);
              setIsAnalyst(hasAnalystRole);
              setUserRole(role || null);

              setUser({
                ...userData,
                getIdToken: () => getIdToken(firebaseUser, true),
              });
            } else {
              // If API call fails, still set basic user data
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                emailVerified: firebaseUser.emailVerified,
                getIdToken: () => getIdToken(firebaseUser, true),
              });

              // Reset role status since we couldn't verify
              setIsAdmin(false);
              setIsAnalyst(false);
              setUserRole(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setError((error as Error).message);
            setIsAdmin(false);
            setIsAnalyst(false);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsAnalyst(false);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sign in
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);

      if (!auth) {
        throw new Error("Firebase auth is not initialized");
      }

      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      setError((error as Error).message);
      return false;
    }
  };

  // Sign out
  const signOut = async (): Promise<boolean> => {
    try {
      if (!auth) {
        throw new Error("Firebase auth is not initialized");
      }

      await firebaseSignOut(auth);
      setIsAdmin(false);
      setIsAnalyst(false);
      setUserRole(null);
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      setError((error as Error).message);
      return false;
    }
  };

  // Get user token for API calls
  const getUserToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return (await user.getIdToken?.()) || null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    getUserToken,
    isAdmin,
    isAnalyst,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
