import React from "react";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import EmailSubscribe from "@/components/ui/EmailSubscribe";
import PricingPlans from "@/components/ui/PricingPlans";
import { liveAnalytics, monitorConfig } from "@/assets";

export default function LandingPage() {
  // Sample pricing plans data
  const pricingPlans = [
    {
      name: "Starter",
      description: "Monitor",
      price: "1",
      period: "month",
      currency: "$",
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      isPopular: false,
      features: [
        { text: "Employee Activity Logging", included: true },
        { text: "Data Retention (12 Months)", included: true },
        { text: "Live Analytics", included: true },
        { text: "Admin Dashboard", included: true },
        { text: "Restrict/Control Employee Actions", included: false },
        { text: "Block/Allow Website Access", included: false },
        { text: "Data Retention (24 Months)", included: false },
        {
          text: "Get Alerts on Data Loss/Leakage or Unauthorized Activity",
          included: false,
        },
      ],
    },
    {
      name: "Pro",
      description: "Monitor and Control",
      price: "1.9",
      period: "month",
      currency: "$",
      buttonText: "Get Started",
      buttonVariant: "primary" as const,
      isPopular: true,
      features: [
        {
          text: "Get Alerts on Data Loss/Leakage or Unauthorized Activity",
          included: true,
        },
        { text: "Restrict/Control Employee Actions", included: true },

        { text: "Block/Allow Website Access", included: true },
        { text: "Data Retention (24 Months)", included: true },

        { text: "Employee Activity Logging", included: true },
        { text: "Live Analytics", included: true },
        { text: "Admin Dashboard", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-[60px] overflow-x-hidden">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 py-12 md:py-20">
        <div className="container mx-auto px-4 md:mb-20">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left Column - Text and Email Form */}
            <div className="w-full md:w-1/2 space-y-6">
              <h1
                style={{
                  lineHeight: "1.2",
                }}
                className="text-gray-700 font-bold dark:text-gray-200 text-3xl md:text-5xl lg:text-6xl text-neutral-title"
              >
                <span className="bg-clip-text text-transparent pr-[1px] bg-gradient-to-r from-indigo-400 to-purple-600">
                  W
                </span>
                orkforce{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                  A
                </span>
                nalytics &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                  S
                </span>
                ecurity{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                  P
                </span>
                latform
              </h1>
              <h1 className="text-xl md:text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 leading-tight">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 mr-2 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Non-Invasive Employee Monitoring
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 mr-2 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Data Loss Prevention (DLP)
                </div>
              </h1>
              {/* <p className="text-xl text-subtitle dark:text-gray-300">
                See Employee Activity, Boost Productivity & Enhance Data
                Security
              </p> */}

              <div className="pt-4">
                <EmailSubscribe
                  placeholder="Enter your work email"
                  buttonText="Get Invite"
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  You will recieve an email with a link to register.
                  <br /> No credit card required.
                </p>
              </div>
            </div>

            {/* Right Column - App Screenshots */}
            <div className="w-full md:w-1/2 relative overflow-visible">
              <div className="relative h-[400px] md:h-[515px] w-full">
                {/* Main Screenshot */}

                <div className="flex items-start justify-start h-[calc(100%-2rem)]">
                  <div className="relative">
                    <Image
                      src={liveAnalytics}
                      alt="Dashboard Screenshot"
                      className="w-[150%] fly-in-from-right-1s  max-w-none object-cover shadow-xl border-neutral-200 dark:border-gray-700 rounded-md"
                      width={1200}
                      height={600}
                    />
                    <div className="relative">
                      <Image
                        src={monitorConfig}
                        alt="Monitoring Configuration"
                        className="absolute bottom-[-110px] right-[-230px] w-[90%] object-cover shadow-lg border-neutral-200 dark:border-gray-700 rounded-md opacity-100 fly-in-from-right-2s "
                        width={500}
                        height={300}
                      />
                      {/* Removed styled-jsx which can't be used in Server Components */}
                      {/* Animation styles should be moved to a global CSS file or a CSS module */}
                    </div>
                  </div>
                </div>

                {/* Secondary Screenshot */}
                {/* <div className="absolute  right-[0px] w-4/5 bg-white rounded-sm shadow-lg overflow-hidden border-t-[1px] border-neutral-300">
                  <div className="text-center text-neutral-400">
                    <div className="text-center">
                      <Image
                        src={liveAnalytics}
                        alt="Dashboard Screenshot"
                        className="w-full object-cover"
                        width={1000}
                        height={500}
                      />
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before and After Section */}
      <section className="py-12 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4 dark:text-white">
              Workforce{" "}
              <span className="bg-gradient-to-r font-bold from-green-300 to-blue-400 bg-clip-text text-transparent">
                Monitoring
              </span>{" "}
              and{" "}
              <span className="bg-gradient-to-r font-bold from-red-300 to-yellow-400 bg-clip-text text-transparent">
                Data Security
              </span>{" "}
              in one place
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how our platform transforms your organization's productivity
              and data management
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
            {/* BEFORE Column */}
            <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full">
              <div className="bg-gray-100 dark:bg-gray-700 py-4 px-6 border-b border-gray-200 dark:border-gray-600">
                <p className="text-center text-gray-600 dark:text-gray-300 font-medium">
                  Without Us
                </p>
              </div>

              <div className="p-6 space-y-5 flex-grow">
                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Unauthorized use of company resources
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Data leakage from shadow IT usage on Internet
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Difficult to track employee actions
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      No browser usage reports
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AFTER Column */}
            <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-purple-200 dark:border-purple-900 flex flex-col h-full">
              <div className="bg-purple-700 py-4 px-6">
                <p className="text-center text-purple-50 font-medium">
                  With Us
                </p>
              </div>

              <div className="p-6 space-y-5 flex-grow">
                <div className="flex items-start">
                  <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Restrict unauthorized activities
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Control sensitive data uploads and downloads
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Monitoring remote and on-site teams
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded-full mr-4 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Access realtime employee behavior reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left Column - Logos */}
            <div className="w-full md:w-1/2">
              <div className="w-full rounded-xl">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Monitoring Logo */}
                  <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-20 w-20 text-purple-600 dark:text-purple-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Monitoring
                    </h3>
                  </div>

                  {/* Data Leak Shield Logo */}
                  <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg flex flex-col items-center mt-8 md:mt-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-20 w-20 text-purple-600 dark:text-purple-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Data Leak Shield
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* right Column - Text */}
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-title text-gray-700 dark:text-white">
                Why Us Stands Out
              </h2>
              <p className="text-xl text-subtitle dark:text-gray-300">
                Best of both the worlds - Monitoring & Data Leakage Prevention
                (DLP)
              </p>
              <p className="text-lg text-subtitle dark:text-gray-300">
                Achieve this through thorough monitoring, valuable analytics.
              </p>

              <div className="pt-4 space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 dark:bg-gray-700 p-2 rounded-full mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      Monitor Data with Advanced Security & Privacy Controls
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      Monitoring with advanced security & privacy controls
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 dark:bg-gray-700 p-2 rounded-full mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      Data Leakage Prevention (DLP)
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      Restrict actions on sensitive data while maintaining
                      transparency
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="pricing"></div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-16 bg-gradient-to-b from-neutral-50 dark:from-gray-800 to-white dark:to-gray-900">
        <div className="container mx-auto px-4">
          <PricingPlans plans={pricingPlans} />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
