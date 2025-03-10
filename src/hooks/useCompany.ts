"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getCompany } from "@/lib/api";
import { Company } from "@/types/api";

interface UseCompanyReturn {
  company: Company | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateCompany: (data: Partial<Company>) => Promise<boolean>;
}

export function useCompany(): UseCompanyReturn {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getUserToken } = useAuth();

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    try {
      const companyData = await getCompany(undefined, getUserToken);
      setCompany(companyData);
    } catch (err) {
      console.error("Error fetching company:", err);
      setError("Failed to fetch company data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const updateCompany = async (data: Partial<Company>): Promise<boolean> => {
    if (!company) {
      setError("No company data available");
      return false;
    }

    setLoading(true);
    try {
      const token = await getUserToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/companies/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: company.id,
          data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update company");
      }

      // Update local state with new data
      setCompany({
        ...company,
        ...data,
      });

      return true;
    } catch (err) {
      console.error("Error updating company:", err);
      setError(err instanceof Error ? err.message : "Failed to update company");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    company,
    loading,
    error,
    refetch: fetchCompany,
    updateCompany,
  };
}
