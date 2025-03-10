import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaLinkedin, FaGithub, FaFacebook } from "react-icons/fa";
import { waspLogo } from "@/assets";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Demo", href: "/demo" },
        { name: "Roadmap", href: "/roadmap" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { name: "Enterprise", href: "/solutions/enterprise" },
        { name: "Small Business", href: "/solutions/small-business" },
        { name: "Developers", href: "/solutions/developers" },
        { name: "Industries", href: "/solutions/industries" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Blog", href: "/blog" },
        { name: "Support", href: "/support" },
        { name: "API", href: "/api" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: FaTwitter,
      href: "https://twitter.com/nexonware",
      label: "Twitter",
    },
    {
      icon: FaLinkedin,
      href: "https://linkedin.com/company/nexonware",
      label: "LinkedIn",
    },
    { icon: FaGithub, href: "https://github.com/nexonware", label: "GitHub" },
    {
      icon: FaFacebook,
      href: "https://facebook.com/nexonware",
      label: "Facebook",
    },
  ];

  return (
    <footer
      className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Top section with logo and description */}
        <div className="flex flex-col md:flex-row justify-between mb-10">
          <div className="mb-8 md:mb-0 md:w-1/3">
            <Link href="/" className="flex items-center mb-4">
              <div className="relative h-10 w-10 mr-2">
                <Image
                  src={waspLogo}
                  alt="Nexonware Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                WASP.Nexonware
              </span>
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
              Workforce Analytics & Security Platform. Empowering businesses
              with advanced monitoring, analytics, and security solutions.
            </p>
          </div>

          {/* Links section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:w-2/3">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section with social links and copyright */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            <div className="text-neutral-500 dark:text-neutral-400 text-sm">
              © {currentYear} Nexonware. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
