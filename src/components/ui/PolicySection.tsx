import React, { ReactNode } from "react";

interface PolicySectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const PolicySection: React.FC<PolicySectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default PolicySection;
