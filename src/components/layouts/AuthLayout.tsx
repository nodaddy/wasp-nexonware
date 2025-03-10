import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand/Logo */}
      <div className="bg-primary-700 text-white md:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            {/* Replace with your actual logo */}
            <div className="text-4xl font-bold">Nexonware EAP</div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Enterprise Administration Platform
          </h1>
          <p className="text-primary-100 text-lg">
            Streamline your business operations with our comprehensive
            enterprise management solution.
          </p>
          <div className="mt-12 hidden md:block">
            <div className="flex justify-center space-x-4">
              <div className="bg-primary-600 p-4 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
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
                <h3 className="text-lg font-medium mt-2">Secure</h3>
              </div>
              <div className="bg-primary-600 p-4 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h3 className="text-lg font-medium mt-2">Fast</h3>
              </div>
              <div className="bg-primary-600 p-4 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-medium mt-2">Scalable</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
