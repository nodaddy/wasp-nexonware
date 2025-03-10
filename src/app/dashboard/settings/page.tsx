"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Save,
  Globe,
  Bell,
  Mail,
  Database,
  Zap,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection = ({
  title,
  description,
  children,
}: SettingsSectionProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  description?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

const FormField = ({
  label,
  id,
  type = "text",
  placeholder,
  description,
  value,
  onChange,
  options,
  disabled = false,
}: FormFieldProps) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {type === "select" ? (
        <select
          id={id}
          name={id}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      ) : type === "checkbox" ? (
        <div className="mt-1 flex items-center">
          <input
            id={id}
            name={id}
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={value === "true"}
            onChange={onChange}
            disabled={disabled}
          />
          <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {placeholder}
          </label>
        </div>
      ) : (
        <input
          type={type}
          name={id}
          id={id}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

interface IntegrationCardProps {
  name: string;
  description: string;
  status: "connected" | "disconnected";
  icon: React.ReactNode;
}

const IntegrationCard = ({ name, description, icon }: IntegrationCardProps) => {
  return (
    <div className="flex items-start justify-between p-6 border border-gray-200 rounded-lg mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Coming Soon
      </span>
    </div>
  );
};

// Helper function to format dates from Firestore
const formatDate = (dateValue: any): string => {
  return new Date(dateValue._seconds * 1000).toDateString();
};

export default function SettingsPage() {
  const { company, loading, error, updateCompany } = useCompany();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    phone: "",
    address: "",
    timeZone: "UTC",
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [emailDomains, setEmailDomains] = useState<string[]>([]);

  // Update form data when company data is loaded
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        adminEmail: company.adminEmail || "",
        phone: company.phone || "",
        address: company.address || "",
        timeZone: company.timeZone || "UTC",
        language: company.language || "en",
      });
      setEmailDomains(company.emailDomains || []);
    }
  }, [company]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const success = await updateCompany({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        timeZone: formData.timeZone,
        language: formData.language,
      });

      if (success) {
        showToast("Company settings updated successfully", "success");
      } else {
        showToast("Failed to update company settings", "error");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      showToast("An error occurred while saving settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const timeZoneOptions = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (US & Canada)" },
    { value: "America/Chicago", label: "Central Time (US & Canada)" },
    { value: "America/Denver", label: "Mountain Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" },
    { value: "zh", label: "Chinese" },
  ];

  const integrations = [
    {
      name: "Google Workspace",
      description:
        "Connect with Google Docs, Sheets, and other Google services.",
      status: "connected" as const,
      icon: <Globe size={20} />,
    },
    {
      name: "Slack",
      description: "Send notifications and updates to your Slack channels.",
      status: "connected" as const,
      icon: <Bell size={20} />,
    },
    {
      name: "Microsoft 365",
      description: "Integrate with Microsoft Office applications and services.",
      status: "disconnected" as const,
      icon: <Mail size={20} />,
    },
    {
      name: "Salesforce",
      description: "Sync data with your Salesforce CRM instance.",
      status: "disconnected" as const,
      icon: <Database size={20} />,
    },
    {
      name: "Zapier",
      description: "Connect with thousands of apps through Zapier automations.",
      status: "disconnected" as const,
      icon: <Zap size={20} />,
    },
    {
      name: "Okta",
      description: "Manage user authentication and single sign-on.",
      status: "connected" as const,
      icon: <Users size={20} />,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-lg text-gray-600">
          Loading company settings...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading company settings: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Settings & Integrations
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure platform settings and manage integrations with external
          services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* General Settings */}
          <SettingsSection
            title="General Settings"
            description="Configure basic settings for your organization."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <FormField
                label="Organization Name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                description="The name of your organization as it appears across the platform."
              />
              <FormField
                label="Admin Email"
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={handleInputChange}
                description="Primary contact email for administrative notifications."
                disabled={true}
              />
              <FormField
                label="Phone Number"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                description="Contact phone number for your organization."
              />
              <FormField
                label="Time Zone"
                id="timeZone"
                type="select"
                options={timeZoneOptions}
                value={formData.timeZone}
                onChange={handleInputChange}
                description="Default time zone for reports and scheduled tasks."
              />
              <FormField
                label="Language"
                id="language"
                type="select"
                options={languageOptions}
                value={formData.language}
                onChange={handleInputChange}
                description="Default language for the platform interface."
              />
              <FormField
                label="Address"
                id="address"
                type="textarea"
                value={formData.address}
                onChange={handleInputChange}
                description="Physical address of your organization."
              />
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </SettingsSection>

          {/* Integrations */}
          <SettingsSection
            title="Integrations"
            description="Connect with external services and applications."
          >
            <div className="space-y-4">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
                  name={integration.name}
                  description={integration.description}
                  status={integration.status}
                  icon={integration.icon}
                />
              ))}
            </div>
          </SettingsSection>
        </div>

        <div>
          {/* Company Status */}
          <SettingsSection
            title="Company Status"
            description="Information about your company's status."
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Status</h4>
                <p className="mt-1 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {company?.status || "Active"}
                  </span>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(company?.createdAt)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Last Updated
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(company?.updatedAt)}
                </p>
              </div>
            </div>
          </SettingsSection>

          {/* Email Domains */}
          <SettingsSection
            title="Email Domains"
            description="Email domains associated with your organization."
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Users with these email domains can be associated with your
                organization.
              </p>

              {emailDomains && emailDomains.length > 0 ? (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                  {emailDomains.map((domain) => (
                    <li key={domain} className="py-2 px-3">
                      <span className="text-sm text-gray-700">{domain}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No domains configured.
                </p>
              )}
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
