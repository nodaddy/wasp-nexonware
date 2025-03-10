import {
  Search,
  Book,
  Video,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import VideoTutorial from "@/components/ui/VideoTutorial";

interface HelpCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const HelpCard = ({ title, description, icon, href }: HelpCardProps) => {
  return (
    <a
      href={href}
      className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </a>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  return (
    <div className="py-4">
      <h3 className="text-md font-medium text-gray-900">{question}</h3>
      <p className="mt-2 text-sm text-gray-500">{answer}</p>
    </div>
  );
};

export default function HelpPage() {
  // Mock data for demonstration
  const helpResources = [
    {
      title: "Documentation",
      description:
        "Comprehensive guides and reference materials for all features.",
      icon: <Book size={20} />,
      href: "#documentation",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides for common tasks and workflows.",
      icon: <Video size={20} />,
      href: "#tutorials",
    },
    {
      title: "Knowledge Base",
      description: "Articles and solutions for frequently asked questions.",
      icon: <FileText size={20} />,
      href: "#knowledge-base",
    },
    {
      title: "Support Chat",
      description: "Get real-time assistance from our support team.",
      icon: <MessageSquare size={20} />,
      href: "#support",
    },
  ];

  const videoTutorials = [
    {
      title: "Getting Started with NexonWare",
      duration: "5:24",
      thumbnail: "/images/tutorials/getting-started.jpg",
      href: "#tutorial-1",
    },
    {
      title: "Managing Users and Permissions",
      duration: "8:12",
      thumbnail: "/images/tutorials/user-management.jpg",
      href: "#tutorial-2",
    },
    {
      title: "Configuring Chrome Extensions",
      duration: "6:45",
      thumbnail: "/images/tutorials/extension-config.jpg",
      href: "#tutorial-3",
    },
    {
      title: "Security Best Practices",
      duration: "7:30",
      thumbnail: "/images/tutorials/security.jpg",
      href: "#tutorial-4",
    },
  ];

  const faqs = [
    {
      question: "How do I add a new user to my organization?",
      answer:
        'Navigate to User Management, click "Add User", and fill in the required information. You can set their role and permissions during this process or modify them later.',
    },
    {
      question: "Can I deploy extensions to specific groups of users?",
      answer:
        'Yes, in the Extension Management section, select the extension you want to deploy, click "Manage Policy", and you can create user groups or select specific departments for deployment.',
    },
    {
      question: "How do I generate custom reports?",
      answer:
        'Go to Analytics & Reporting, click "Generate Report", select the data points you want to include, choose your preferred format, and click "Generate".',
    },
    {
      question: "What security measures are in place to protect our data?",
      answer:
        "NexonWare employs end-to-end encryption, regular security audits, and compliance with industry standards. You can view and configure additional security settings in the Security & Compliance section.",
    },
    {
      question: "How do I integrate with our existing tools?",
      answer:
        'Navigate to Settings & Integrations, browse the available integrations, and click "Connect" on the service you want to integrate with. Follow the authentication steps to complete the connection.',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Onboarding & Help Center
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Find resources, tutorials, and support to help you get the most out of
          NexonWare.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Search for help articles, tutorials, and more..."
          />
        </div>
      </div>

      {/* Help resources */}
      <div className="mb-12">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Help Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpResources.map((resource, index) => (
            <HelpCard key={index} {...resource} />
          ))}
        </div>
      </div>

      {/* Getting started */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Getting Started</h2>
          <a
            href="#all-tutorials"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
          >
            View all tutorials
            <ChevronRight size={16} className="ml-1" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoTutorials.map((tutorial, index) => (
            <VideoTutorial key={index} {...tutorial} />
          ))}
        </div>
      </div>

      {/* Onboarding checklist */}
      <div className="mb-12">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Onboarding Checklist
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Complete these steps to get started
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                2/5 completed
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked
                readOnly
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Set up your organization profile
                </p>
                <p className="text-xs text-gray-500">
                  Add your company details and branding
                </p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked
                readOnly
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Invite team members
                </p>
                <p className="text-xs text-gray-500">
                  Add users and assign roles
                </p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Configure security settings
                </p>
                <p className="text-xs text-gray-500">
                  Set up authentication and access controls
                </p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Deploy your first extension
                </p>
                <p className="text-xs text-gray-500">
                  Configure and deploy a Chrome extension
                </p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Set up integrations
                </p>
                <p className="text-xs text-gray-500">
                  Connect with your existing tools and services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Frequently Asked Questions
          </h2>
          <a
            href="#all-faqs"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
          >
            View all FAQs
            <ChevronRight size={16} className="ml-1" />
          </a>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200 px-6">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>
      </div>

      {/* Contact support */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Need additional help?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Our support team is available 24/7 to assist you with any
              questions or issues.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <MessageSquare size={16} className="mr-2" />
              Contact Support
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ExternalLink size={16} className="mr-2" />
              Schedule a Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
