import React, { useState } from "react";

interface DomainExceptionsProps {
  domains: string[];
  onChange: (domains: string[]) => void;
  placeholder?: string;
  title?: string;
}

const DomainExceptions: React.FC<DomainExceptionsProps> = ({
  domains,
  onChange,
  placeholder = "Add domain exception (e.g., example.com)",
  title = "Domain List",
}) => {
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateDomain = (domain: string): boolean => {
    // Simple domain validation regex
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  };

  const handleAddDomain = () => {
    const domain = newDomain.trim().toLowerCase();

    if (!domain) {
      return;
    }

    if (!validateDomain(domain)) {
      setError("Please enter a valid domain (e.g., example.com)");
      return;
    }

    if (domains.includes(domain)) {
      setError("This domain is already in the list");
      return;
    }

    onChange([...domains, domain]);
    setNewDomain("");
    setError(null);
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    onChange(domains.filter((domain) => domain !== domainToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDomain();
    }
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-2">
        <div className="flex">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddDomain}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {domains.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">{title}:</p>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <div
                key={domain}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              >
                <span className="text-sm text-gray-800">{domain}</span>
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainExceptions;
