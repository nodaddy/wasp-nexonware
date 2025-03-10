"use client";

import {
  ApiResponse,
  FetchOptions,
  GetTokenFunction,
  Company,
} from "@/types/api";

/**
 * Makes an authenticated API call to our backend
 * @param url - The API endpoint
 * @param options - Fetch options
 * @param getToken - Function to get the auth token
 * @returns The API response
 */
export async function fetchAPI<T = any>(
  url: string,
  options: FetchOptions = {},
  getToken: GetTokenFunction
): Promise<T> {
  try {
    // Get the auth token
    const token = await getToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    // Set up headers with authentication
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    // Make the API call
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse the response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data as T;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

/**
 * Get company data
 * @param companyId - Optional company ID (if not provided, uses user's company)
 * @param getToken - Function to get the auth token
 * @returns Company data
 */
export async function getCompany(
  companyId?: string,
  getToken?: GetTokenFunction
): Promise<Company> {
  const url = companyId
    ? `/api/companies/get?id=${companyId}`
    : "/api/companies/get";

  return fetchAPI<Company>(url, {}, getToken as GetTokenFunction);
}

/**
 * Get user profile data
 * @param getToken - Function to get the auth token
 * @returns User data
 */
export async function getUserProfile(getToken: GetTokenFunction) {
  return fetchAPI<any>("/api/auth/user", {}, getToken);
}
