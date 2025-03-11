"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import { waspLogo } from "@/assets";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      className={`bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 py-4 fixed top-0 left-0 right-0 z-50 ${className}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo0  */}
        <Link href="/" className="flex items-center">
          <div className="relative h-8 w-8 mr-1">
            <Image
              src={waspLogo}
              alt="Nexonware Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400 relative pb-[10px]">
            WASP
            <span className="absolute top-[23px] left-0 text-xs text-gray-700 dark:text-gray-300">
              Nexonware
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            {/* <button
              className="flex items-center text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400"
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
            >
              Solutions
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-1 transition-transform ${
                  isSolutionsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button> */}

            {/* {isSolutionsOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
                <Link
                  href="/solutions/enterprise"
                  className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-gray-700"
                >
                  Enterprise Solutions
                </Link>
                <Link
                  href="/solutions/small-business"
                  className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-gray-700"
                >
                  Small Business
                </Link>
                <Link
                  href="/solutions/developers"
                  className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-gray-700"
                >
                  For Developers
                </Link>
              </div>
            )} */}
          </div>

          <div
            onClick={() => {
              const element = document.getElementById("pricing");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
          >
            Pricing
          </div>

          <Link href="/demo">
            <Button variant="outline" size="sm">
              See Demo
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <button
            className="text-neutral-700 dark:text-neutral-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-3 bg-white dark:bg-gray-900">
          <button
            className="flex items-center w-full text-left text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 py-2"
            onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
          >
            Solutions
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 transition-transform ${
                isSolutionsOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* {isSolutionsOpen && (
            <div className="pl-4 space-y-2">
              <Link
                href="/solutions/enterprise"
                className="block py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Enterprise Solutions
              </Link>
              <Link
                href="/solutions/small-business"
                className="block py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Small Business
              </Link>
              <Link
                href="/solutions/developers"
                className="block py-1 text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400"
              >
                For Developers
              </Link>
            </div>
          )} */}

          <div
            onClick={() => {
              const element = document.getElementById("pricing");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
          >
            Pricing
          </div>

          <Link href="/demo" className="block py-2">
            <Button variant="outline" size="sm" fullWidth>
              See Demo
            </Button>
          </Link>

          <Link href="/login" className="block py-2">
            <Button variant="ghost" size="sm" fullWidth>
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
