"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExtensionPolicy } from "@/hooks/useExtensionPolicy";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Save,
  RefreshCw,
  AlertTriangle,
  Info,
  Check,
  Plus,
  Trash2,
  Bell,
  Shield,
} from "lucide-react";
import { ExtensionPolicy } from "@/types/policies";
import { useRouter, usePathname } from "next/navigation";

export default function ExtensionPolicyPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // For demo purposes, we're using a hardcoded company ID
  // In a real app, you would get this from the authenticated user's context
  const companyId = "bN2uIWUplCFpHCFrMZPO";
  const userId = user?.uid || "";

  const {
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
  } = useExtensionPolicy({
    companyId,
    userId,
  });

  const [allowlistInput, setAllowlistInput] = useState("");
  const [blocklistInput, setBlocklistInput] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [originalPolicy, setOriginalPolicy] = useState<ExtensionPolicy | null>(
    null
  );

  // Store the original policy when it's first loaded
  useEffect(() => {
    if (policy && !originalPolicy) {
      setOriginalPolicy(JSON.parse(JSON.stringify(policy)));
      // Ensure hasUnsavedChanges is false on initial load
      setHasUnsavedChanges(false);
    }
  }, [policy, originalPolicy]);

  // Compare current policy with original to detect changes
  useEffect(() => {
    if (originalPolicy && policy) {
      const isChanged =
        JSON.stringify(originalPolicy) !== JSON.stringify(policy);
      setHasUnsavedChanges(isChanged);
    }
  }, [policy, originalPolicy]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard way to show a confirmation dialog when closing the tab or window
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        // Cancel the navigation
        event.preventDefault();

        // Push the current state back to history to prevent navigation
        window.history.pushState(null, "", window.location.pathname);

        // Show the confirmation dialog
        setShowConfirmDialog(true);
        setPendingNavigation("back");
      }
    };

    // Push an initial state to the history
    window.history.pushState(null, "", window.location.pathname);

    // Listen for popstate events (back/forward buttons)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Create a custom router for intercepting navigation
  const customRouter = useCallback(
    (url: string) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(url);
        setShowConfirmDialog(true);
      } else {
        router.push(url);
      }
    },
    [hasUnsavedChanges, router]
  );

  // Override all link clicks to use our custom router
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link) {
        const href = link.getAttribute("href");

        // Only intercept internal navigation
        if (href && href.startsWith("/") && href !== pathname) {
          e.preventDefault();
          customRouter(href);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [customRouter, pathname]);

  const handleSave = async () => {
    // The updatePolicy function in the hook already shows toasts
    const success = await updatePolicy(policy);
    if (success) {
      // Update the original policy to match the current one after saving
      setOriginalPolicy(JSON.parse(JSON.stringify(policy)));
      setHasUnsavedChanges(false);
    }
  };

  const handleReset = () => {
    resetPolicy();
    // We'll set the original policy in the next render cycle after resetPolicy takes effect
    setTimeout(() => {
      setOriginalPolicy(JSON.parse(JSON.stringify(policy)));
      setHasUnsavedChanges(false);
    }, 0);
    showToast("Extension policy reset to defaults", "info");
  };

  const handleAddAllowlist = () => {
    const domain = allowlistInput.trim();
    if (domain && !policy?.allowlist.includes(domain)) {
      updateAllowlist([...policy?.allowlist, domain]);
      setAllowlistInput("");
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveAllowlist = (domain: string) => {
    updateAllowlist(policy?.allowlist.filter((d) => d !== domain));
    setHasUnsavedChanges(true);
  };

  const handleAddBlocklist = () => {
    const domain = blocklistInput.trim();
    if (domain && !policy?.blocklist.includes(domain)) {
      updateBlocklist([...policy?.blocklist, domain]);
      setBlocklistInput("");
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveBlocklist = (domain: string) => {
    updateBlocklist(policy?.blocklist.filter((d) => d !== domain));
  };

  const handleConfirmNavigation = () => {
    setShowConfirmDialog(false);
    if (pendingNavigation) {
      if (pendingNavigation === "back") {
        // If confirming a back navigation, go back
        window.history.back();
      } else {
        // Otherwise use the router to navigate
        router.push(pendingNavigation);
      }
    }
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };

  return (
    <div className="py-6">
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Unsaved Changes
            </h3>
            <p className="text-gray-500 mb-6">
              You have unsaved changes. Are you sure you want to leave this
              page? Your changes will be lost.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelNavigation}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Stay on Page
              </button>
              <button
                onClick={handleConfirmNavigation}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Browser Data Configuration
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure restrictions and data collection for the browser
              extension.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 ${
                hasUnsavedChanges
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-100 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={loading || !hasUnsavedChanges}
            >
              <RefreshCw size={16} className="mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                hasUnsavedChanges
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={loading || !hasUnsavedChanges}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics Collection */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Metrics Collection
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure what metrics are collected by the extension.
                </p>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      URL Capture
                    </h3>
                    <p className="text-xs text-gray-500">
                      Collect information about websites visited by users.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateMetricsCollection(
                          "urlCapture",
                          !policy?.metricsCollection.urlCapture
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.metricsCollection.urlCapture
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.metricsCollection.urlCapture
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      File Uploads
                    </h3>
                    <p className="text-xs text-gray-500">
                      Collect information about files uploaded by users.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateMetricsCollection(
                          "fileUploads",
                          !policy?.metricsCollection.fileUploads
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.metricsCollection.fileUploads
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.metricsCollection.fileUploads
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      File Downloads
                    </h3>
                    <p className="text-xs text-gray-500">
                      Collect information about files downloaded by users.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateMetricsCollection(
                          "fileDownloads",
                          !policy?.metricsCollection.fileDownloads
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.metricsCollection.fileDownloads
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.metricsCollection.fileDownloads
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Clipboard Events
                    </h3>
                    <p className="text-xs text-gray-500">
                      Collect information about clipboard operations.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateMetricsCollection(
                          "clipboardEvents",
                          !policy?.metricsCollection.clipboardEvents
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.metricsCollection.clipboardEvents
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.metricsCollection.clipboardEvents
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Settings */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Metrics Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how metrics data is stored and processed.
                </p>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Anonymize User Data
                    </h3>
                    <p className="text-xs text-gray-500">
                      Remove personally identifiable information from collected
                      metrics.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateMetricsSettings(
                          "anonymizeUserData",
                          !policy?.metricsSettings.anonymizeUserData
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.metricsSettings.anonymizeUserData
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.metricsSettings.anonymizeUserData
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Persist Data
                    </h3>
                    <p className="text-xs text-gray-500">
                      Store collected data for the specified retention period.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateMetricsSettings(
                          "persistData",
                          !policy?.metricsSettings.persistData
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.metricsSettings.persistData
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.metricsSettings.persistData
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Data Retention Period
                    </h3>
                    <p className="text-xs text-gray-500">
                      Number of days to retain collected data.
                    </p>
                  </div>
                  <div className="w-24">
                    <select
                      value={policy?.metricsSettings.retentionDays}
                      onChange={(e) =>
                        updateMetricsSettings(
                          "retentionDays",
                          parseInt(e.target.value)
                        )
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>365 days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Clipboard Actions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Clipboard Actions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how the extension handles clipboard operations.
                </p>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Restrict Sensitive Data
                    </h3>
                    <p className="text-xs text-gray-500">
                      Block copying and pasting of sensitive data like credit
                      cards, SSNs, etc.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updatePolicyField(
                          "paste",
                          "restrictSensitive",
                          !policy?.actions.paste.restrictSensitive
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.actions.paste.restrictSensitive
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.actions.paste.restrictSensitive
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Restrict All Clipboard Operations
                    </h3>
                    <p className="text-xs text-gray-500">
                      Block all copy and paste operations across websites.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updatePolicyField(
                          "paste",
                          "restrict",
                          !policy?.actions.paste.restrict
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.actions.paste.restrict
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.actions.paste.restrict
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Warn Before Paste
                    </h3>
                    <p className="text-xs text-gray-500">
                      Show a warning dialog before allowing paste operations.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updatePolicyField(
                          "paste",
                          "warnBeforePaste",
                          !policy?.actions.paste.warnBeforePaste
                        )
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy?.actions.paste.warnBeforePaste
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy?.actions.paste.warnBeforePaste
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Lists */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Domain Exceptions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure allowed and blocked domains for the extension.
                </p>
              </div>
              <div className="px-6 py-4 space-y-6">
                {/* Allowlist */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Allowed Domains
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    These domains are exempt from any restrictions but will
                    still be monitored for metrics collection.
                  </p>

                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={allowlistInput}
                      onChange={(e) => setAllowlistInput(e.target.value)}
                      placeholder="example.com"
                      className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <button
                      onClick={handleAddAllowlist}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus size={16} className="mr-1" />
                      Add
                    </button>
                  </div>

                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {policy?.allowlist.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {policy?.allowlist.map((domain) => (
                          <li
                            key={domain}
                            className="py-2 flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-700">
                              {domain}
                            </span>
                            <button
                              onClick={() => handleRemoveAllowlist(domain)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No domains added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Blocklist */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Blocked Domains
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    These domains will be blocked from access. User will not be
                    able to see the content of the website at all
                  </p>

                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={blocklistInput}
                      onChange={(e) => setBlocklistInput(e.target.value)}
                      placeholder="example.com"
                      className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    <button
                      onClick={handleAddBlocklist}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus size={16} className="mr-1" />
                      Add
                    </button>
                  </div>

                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {policy?.blocklist.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {policy?.blocklist.map((domain) => (
                          <li
                            key={domain}
                            className="py-2 flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-700">
                              {domain}
                            </span>
                            <button
                              onClick={() => handleRemoveBlocklist(domain)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No domains added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar for alerts and info */}
          <div className="space-y-6">
            {/* Policy Status */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Policy Status
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center text-sm text-green-700 mb-4">
                  <Check className="h-5 w-5 mr-2" />
                  <span>Policy is active and enforced</span>
                </div>
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {policy?.updatedAt
                    ? new Date(
                        policy?.updatedAt.seconds * 1000
                      ).toLocaleString()
                    : "Never"}
                </p>
                {policy?.updatedBy && (
                  <p className="text-sm text-gray-500">
                    Updated by: {policy?.updatedBy}
                  </p>
                )}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Alerts
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Sensitive Data Detected
                      </h3>
                      <p className="text-xs text-gray-500">
                        3 instances of sensitive data were detected in clipboard
                        operations today.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Bell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Policy Updated
                      </h3>
                      <p className="text-xs text-gray-500">
                        The extension policy was updated by an administrator.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Blocked Domain Access
                      </h3>
                      <p className="text-xs text-gray-500">
                        5 attempts to access blocked domains were prevented.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All Alerts
                  </button>
                </div>
              </div>
            </div>

            {/* Help & Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Help & Information
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      About Browser Extension Policies
                    </h3>
                    <p className="text-xs text-gray-500">
                      Extension policies control how the browser extension
                      behaves for all users in your organization.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Documentation
                  </a>
                  <a
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Get Support
                  </a>
                  <a
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Report an Issue
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
