import {
  ref,
  get,
  query,
  orderByKey,
  limitToLast,
  onValue,
  off,
  DataSnapshot,
} from "firebase/database";
import { database } from "./firebase";
import { MetricsData, UserMetrics, EventTypes } from "../types/metrics";

// Type for callback functions
type DataCallback<T> = (data: T | null) => void;

/**
 * Fetches all metrics data from the Realtime Database
 */
export async function getAllMetrics(): Promise<MetricsData | null> {
  if (!database) {
    console.error("Realtime Database not initialized");
    return null;
  }

  try {
    const metricsRef = ref(database, "metrics");
    const snapshot = await get(metricsRef);

    if (snapshot.exists()) {
      return snapshot.val() as MetricsData;
    } else {
      console.log("No metrics data available");
      return null;
    }
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}

/**
 * Subscribes to real-time updates for all metrics data
 * Returns an unsubscribe function that should be called when no longer needed
 */
export function subscribeToAllMetrics(
  callback: DataCallback<MetricsData>
): () => void {
  if (!database) {
    console.error("Realtime Database not initialized");
    callback(null);
    return () => {};
  }

  const metricsRef = ref(database, "metrics");

  const listener = onValue(
    metricsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as MetricsData);
      } else {
        console.log("No metrics data available");
        callback(null);
      }
    },
    (error) => {
      console.error("Error subscribing to metrics:", error);
      callback(null);
    }
  );

  // Return unsubscribe function
  return () => off(metricsRef);
}

/**
 * Fetches metrics for a specific company
 */
export async function getCompanyMetrics(
  companyId: string
): Promise<Record<string, UserMetrics> | null> {
  if (!database) {
    console.error("Realtime Database not initialized");
    return null;
  }

  try {
    const companyRef = ref(database, `metrics/${companyId}`);
    const snapshot = await get(companyRef);

    if (snapshot.exists()) {
      return snapshot.val() as Record<string, UserMetrics>;
    } else {
      console.log(`No metrics data available for company: ${companyId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching metrics for company ${companyId}:`, error);
    return null;
  }
}

/**
 * Subscribes to real-time updates for company metrics
 * Returns an unsubscribe function that should be called when no longer needed
 */
export function subscribeToCompanyMetrics(
  companyId: string,
  callback: DataCallback<Record<string, UserMetrics>>
): () => void {
  if (!database) {
    console.error("Realtime Database not initialized");
    callback(null);
    return () => {};
  }

  const companyRef = ref(database, `metrics/${companyId}`);

  const listener = onValue(
    companyRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Record<string, UserMetrics>);
      } else {
        console.log(`No metrics data available for company: ${companyId}`);
        callback(null);
      }
    },
    (error) => {
      console.error(
        `Error subscribing to metrics for company ${companyId}:`,
        error
      );
      callback(null);
    }
  );

  // Return unsubscribe function
  return () => off(companyRef);
}

/**
 * Fetches metrics for a specific user within a company
 */
export async function getUserMetrics(
  companyId: string,
  userId: string
): Promise<UserMetrics | null> {
  if (!database) {
    console.error("Realtime Database not initialized");
    return null;
  }

  try {
    const userRef = ref(database, `metrics/${companyId}/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val() as UserMetrics;
    } else {
      console.log(`No metrics data available for user: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching metrics for user ${userId}:`, error);
    return null;
  }
}

/**
 * Subscribes to real-time updates for user metrics
 * Returns an unsubscribe function that should be called when no longer needed
 */
export function subscribeToUserMetrics(
  companyId: string,
  userId: string,
  callback: DataCallback<UserMetrics>
): () => void {
  if (!database) {
    console.error("Realtime Database not initialized");
    callback(null);
    return () => {};
  }

  const userRef = ref(database, `metrics/${companyId}/${userId}`);

  const listener = onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as UserMetrics);
      } else {
        console.log(`No metrics data available for user: ${userId}`);
        callback(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to metrics for user ${userId}:`, error);
      callback(null);
    }
  );

  // Return unsubscribe function
  return () => off(userRef);
}

/**
 * Fetches specific event type data for a user
 */
export async function getUserEventData<T extends keyof EventTypes>(
  companyId: string,
  userId: string,
  eventType: T
): Promise<EventTypes[T] | null> {
  if (!database) {
    console.error("Realtime Database not initialized");
    return null;
  }

  try {
    const eventRef = ref(
      database,
      `metrics/${companyId}/${userId}/${String(eventType)}`
    );
    const snapshot = await get(eventRef);

    if (snapshot.exists()) {
      return snapshot.val() as EventTypes[T];
    } else {
      console.log(`No ${String(eventType)} data available for user: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching ${String(eventType)} for user ${userId}:`,
      error
    );
    return null;
  }
}

/**
 * Subscribes to real-time updates for specific event type data
 * Returns an unsubscribe function that should be called when no longer needed
 */
export function subscribeToUserEventData<T extends keyof EventTypes>(
  companyId: string,
  userId: string,
  eventType: T,
  callback: DataCallback<EventTypes[T]>
): () => void {
  if (!database) {
    console.error("Realtime Database not initialized");
    callback(null);
    return () => {};
  }

  const eventRef = ref(
    database,
    `metrics/${companyId}/${userId}/${String(eventType)}`
  );

  const listener = onValue(
    eventRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as EventTypes[T]);
      } else {
        console.log(
          `No ${String(eventType)} data available for user: ${userId}`
        );
        callback(null);
      }
    },
    (error) => {
      console.error(
        `Error subscribing to ${String(eventType)} for user ${userId}:`,
        error
      );
      callback(null);
    }
  );

  // Return unsubscribe function
  return () => off(eventRef);
}

/**
 * Fetches the most recent events of a specific type (limited by count)
 */
export async function getRecentEvents<T extends keyof EventTypes>(
  companyId: string,
  userId: string,
  eventType: T,
  count: number = 10
): Promise<EventTypes[T] | null> {
  if (!database) {
    console.error("Realtime Database not initialized");
    return null;
  }

  try {
    const eventsRef = ref(
      database,
      `metrics/${companyId}/${userId}/${String(eventType)}`
    );
    const recentEventsQuery = query(
      eventsRef,
      orderByKey(),
      limitToLast(count)
    );
    const snapshot = await get(recentEventsQuery);

    if (snapshot.exists()) {
      return snapshot.val() as EventTypes[T];
    } else {
      console.log(
        `No recent ${String(eventType)} available for user: ${userId}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching recent ${String(eventType)} for user ${userId}:`,
      error
    );
    return null;
  }
}

/**
 * Subscribes to real-time updates for recent events
 * Returns an unsubscribe function that should be called when no longer needed
 */
export function subscribeToRecentEvents<T extends keyof EventTypes>(
  companyId: string,
  userId: string,
  eventType: T,
  count: number = 10,
  callback: DataCallback<EventTypes[T]>
): () => void {
  if (!database) {
    console.error("Realtime Database not initialized");
    callback(null);
    return () => {};
  }

  const eventsRef = ref(
    database,
    `metrics/${companyId}/${userId}/${String(eventType)}`
  );

  const recentEventsQuery = query(eventsRef, orderByKey(), limitToLast(count));

  const listener = onValue(
    recentEventsQuery,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as EventTypes[T]);
      } else {
        console.log(
          `No recent ${String(eventType)} available for user: ${userId}`
        );
        callback(null);
      }
    },
    (error) => {
      console.error(
        `Error subscribing to recent ${String(eventType)} for user ${userId}:`,
        error
      );
      callback(null);
    }
  );

  // Return unsubscribe function
  return () => off(recentEventsQuery);
}
