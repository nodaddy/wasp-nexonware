import { useState, useEffect } from "react";
import {
  getAllMetrics,
  getCompanyMetrics,
  getUserMetrics,
  getUserEventData,
  getRecentEvents,
  subscribeToAllMetrics,
  subscribeToCompanyMetrics,
  subscribeToUserMetrics,
  subscribeToUserEventData,
  subscribeToRecentEvents,
} from "../lib/realtimeDb";
import { MetricsData, UserMetrics, EventTypes } from "../types/metrics";

// Hook for fetching all metrics
export function useAllMetrics(realtime: boolean = false) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (realtime) {
      // Use real-time subscription
      const unsubscribe = subscribeToAllMetrics((metrics) => {
        setData(metrics);
        setLoading(false);
      });

      // Cleanup function
      return () => {
        unsubscribe();
      };
    } else {
      // Use one-time fetch
      async function fetchData() {
        try {
          setLoading(true);
          const metrics = await getAllMetrics();
          setData(metrics);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Unknown error occurred")
          );
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }
  }, [realtime]);

  return { data, loading, error };
}

// Hook for fetching company metrics
export function useCompanyMetrics(
  companyId: string,
  realtime: boolean = false
) {
  const [data, setData] = useState<Record<string, UserMetrics> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError(new Error("Company ID is required"));
      setLoading(false);
      return;
    }

    if (realtime) {
      // Use real-time subscription
      const unsubscribe = subscribeToCompanyMetrics(companyId, (metrics) => {
        setData(metrics);
        setLoading(false);
      });

      // Cleanup function
      return () => {
        unsubscribe();
      };
    } else {
      // Use one-time fetch
      async function fetchData() {
        try {
          setLoading(true);
          const metrics = await getCompanyMetrics(companyId);
          setData(metrics);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Unknown error occurred")
          );
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }
  }, [companyId, realtime]);

  return { data, loading, error };
}

// Hook for fetching user metrics
export function useUserMetrics(
  companyId: string,
  userId: string,
  realtime: boolean = false
) {
  const [data, setData] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId || !userId) {
      setError(new Error("Company ID and User ID are required"));
      setLoading(false);
      return;
    }

    if (realtime) {
      // Use real-time subscription
      const unsubscribe = subscribeToUserMetrics(
        companyId,
        userId,
        (metrics) => {
          setData(metrics);
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        unsubscribe();
      };
    } else {
      // Use one-time fetch
      async function fetchData() {
        try {
          setLoading(true);
          const metrics = await getUserMetrics(companyId, userId);
          setData(metrics);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Unknown error occurred")
          );
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }
  }, [companyId, userId, realtime]);

  return { data, loading, error };
}

// Hook for fetching specific event type data
export function useEventData<T extends keyof EventTypes>(
  companyId: string,
  userId: string,
  eventType: T,
  realtime: boolean = false
) {
  const [data, setData] = useState<EventTypes[T] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId || !userId || !eventType) {
      setError(new Error("Company ID, User ID, and Event Type are required"));
      setLoading(false);
      return;
    }

    if (realtime) {
      // Use real-time subscription
      const unsubscribe = subscribeToUserEventData(
        companyId,
        userId,
        eventType,
        (eventData) => {
          setData(eventData);
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        unsubscribe();
      };
    } else {
      // Use one-time fetch
      async function fetchData() {
        try {
          setLoading(true);
          const eventData = await getUserEventData(
            companyId,
            userId,
            eventType
          );
          setData(eventData);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Unknown error occurred")
          );
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }
  }, [companyId, userId, eventType, realtime]);

  return { data, loading, error };
}

// Hook for fetching recent events
export function useRecentEvents<T extends keyof EventTypes>(
  companyId: string,
  userId: string,
  eventType: T,
  count: number = 10,
  realtime: boolean = false
) {
  const [data, setData] = useState<EventTypes[T] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!companyId || !userId || !eventType) {
      setError(new Error("Company ID, User ID, and Event Type are required"));
      setLoading(false);
      return;
    }

    if (realtime) {
      // Use real-time subscription
      const unsubscribe = subscribeToRecentEvents(
        companyId,
        userId,
        eventType,
        count,
        (recentData) => {
          setData(recentData);
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        unsubscribe();
      };
    } else {
      // Use one-time fetch
      async function fetchData() {
        try {
          setLoading(true);
          const recentData = await getRecentEvents(
            companyId,
            userId,
            eventType,
            count
          );
          setData(recentData);
        } catch (err) {
          setError(
            err instanceof Error ? err : new Error("Unknown error occurred")
          );
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }
  }, [companyId, userId, eventType, count, realtime]);

  return { data, loading, error };
}
