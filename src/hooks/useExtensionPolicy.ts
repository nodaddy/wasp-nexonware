import { useState, useEffect, useCallback } from "react";
import {
  ExtensionPolicy,
  defaultExtensionPolicy,
  ExceptionItem,
} from "@/types/policies";
import { getExtensionPolicy, saveExtensionPolicy } from "@/lib/policyService";
import { useToast } from "@/components/ui/ToastProvider";

interface UseExtensionPolicyProps {
  companyId: string;
  userId: string;
}

interface UseExtensionPolicyReturn {
  policy: ExtensionPolicy;
  loading: boolean;
  error: string | null;
  updatePolicy: (newPolicy: ExtensionPolicy) => Promise<boolean>;
  updatePolicyField: (
    category: keyof ExtensionPolicy["actions"],
    field: string,
    value: boolean
  ) => void;
  updateMetricsCollection: (
    field: keyof ExtensionPolicy["metricsCollection"],
    value: boolean
  ) => void;
  updateMetricsSettings: (
    field: keyof ExtensionPolicy["metricsSettings"],
    value: boolean | number
  ) => void;
  updateAllowlist: (domains: string[]) => void;
  updateBlocklist: (domains: string[]) => void;
  resetPolicy: () => void;
}

export function useExtensionPolicy({
  companyId,
  userId,
}: UseExtensionPolicyProps): UseExtensionPolicyReturn {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPolicy = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const fetchedPolicy = await getExtensionPolicy(companyId);
      setPolicy(fetchedPolicy);
      setError(null);
    } catch (err) {
      console.error("Error fetching extension policy:", err);
      setError("Failed to load extension policy");
      // Don't show toast here to avoid multiple toasts during initial load
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchPolicy();
    }
  }, [fetchPolicy]);

  const updatePolicy = async (newPolicy: ExtensionPolicy): Promise<boolean> => {
    if (!companyId || !userId) {
      setError("Missing company ID or user ID");
      showToast("Missing company ID or user ID", "error");
      return false;
    }

    try {
      setLoading(true);
      const success = await saveExtensionPolicy(companyId, newPolicy, userId);

      if (success) {
        setPolicy(newPolicy);
        setError(null);
        showToast("Extension policy saved successfully", "success");
        return true;
      } else {
        throw new Error("Failed to save policy");
      }
    } catch (err) {
      console.error("Error saving extension policy:", err);
      setError("Failed to save extension policy");
      showToast("Failed to save extension policy", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePolicyField = (
    category: keyof ExtensionPolicy["actions"],
    field: string,
    value: boolean
  ) => {
    setPolicy((prevPolicy: any) => {
      // Create a deep copy of the policy to avoid mutation
      const newPolicy = { ...prevPolicy };

      // Update the specific field in the actions category
      if (newPolicy.actions && newPolicy.actions[category]) {
        newPolicy.actions = {
          ...newPolicy.actions,
          [category]: {
            ...newPolicy.actions[category],
            [field]: value,
          },
        };
      }

      return newPolicy;
    });
  };

  const updateMetricsCollection = (
    field: keyof ExtensionPolicy["metricsCollection"],
    value: boolean
  ) => {
    setPolicy((prevPolicy: any) => ({
      ...prevPolicy,
      metricsCollection: {
        ...prevPolicy.metricsCollection,
        [field]: value,
      },
    }));
  };

  const updateMetricsSettings = (
    field: keyof ExtensionPolicy["metricsSettings"],
    value: boolean | number
  ) => {
    setPolicy((prevPolicy: any) => ({
      ...prevPolicy,
      metricsSettings: {
        ...prevPolicy.metricsSettings,
        [field]: value,
      },
    }));
  };

  const updateAllowlist = (domains: string[]) => {
    setPolicy((prevPolicy: any) => ({
      ...prevPolicy,
      allowlist: domains,
    }));
  };

  const updateBlocklist = (domains: string[]) => {
    setPolicy((prevPolicy: any) => ({
      ...prevPolicy,
      blocklist: domains,
    }));
  };

  const resetPolicy = () => {
    setPolicy(defaultExtensionPolicy);
  };

  return {
    policy,
    loading,
    error,
    updatePolicy,
    updatePolicyField,
    updateMetricsCollection,
    updateMetricsSettings,
    updateAllowlist,
    updateBlocklist,
    resetPolicy,
  };
}
