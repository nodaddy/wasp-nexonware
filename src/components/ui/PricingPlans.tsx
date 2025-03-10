import React from "react";
import Button from "./Button";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  currency: string;
  features: PlanFeature[];
  buttonText: string;
  buttonVariant?: "primary" | "secondary" | "outline";
  isPopular?: boolean;
  className?: string;
}

interface PricingPlansProps {
  plans: PricingPlan[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PricingPlans({
  plans,
  title = "Pricing Plans",
  subtitle = "Easy on the budget",
  className = "",
}: PricingPlansProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
          OUR OFFERINGS
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
          {title}
        </h2>
        <h2 className="pb-2 text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 bg-clip-text text-transparent">
          {subtitle}
        </h2>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Productivity, Data Security, and Control in one place
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`w-full md:w-1/2 lg:w-1/3 rounded-xl overflow-hidden relative ${
              plan.isPopular
                ? "bg-neutral-900 text-white"
                : "bg-white dark:bg-gray-800 shadow-md border border-neutral-200 dark:border-gray-700 dark:text-white"
            } ${plan.className || ""}`}
          >
            {plan.isPopular && (
              <div className="absolute top-4 right-4 bg-amber-500 text-xs font-bold uppercase tracking-wider text-neutral-900 py-1 px-3 rounded-full">
                Most Popular
              </div>
            )}

            <div className={`p-8 ${plan.isPopular ? "" : ""}`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p
                className={`mb-6 ${
                  plan.isPopular
                    ? "text-neutral-300"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {plan.description}
              </p>

              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">{plan.currency}</span>
                <span className="text-4xl font-bold">{plan.price}</span>
                <span
                  className={`ml-2 ${
                    plan.isPopular
                      ? "text-neutral-300"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  / {plan.period} / user
                </span>
              </div>

              <Button
                variant={
                  plan.buttonVariant || (plan.isPopular ? "primary" : "outline")
                }
                fullWidth
                className={
                  plan.isPopular ? "bg-purple-500 hover:bg-purple-600" : ""
                }
              >
                {plan.buttonText}
              </Button>

              <div className="mt-8">
                {plan.isPopular && (
                  <p className="font-medium mb-4">
                    Everything in Starter, Plus:
                  </p>
                )}
                {!plan.isPopular && (
                  <p className="font-medium mb-4">{plan.name} plan includes:</p>
                )}

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={`flex items-start`}>
                      {feature.included ? (
                        <div
                          className={`p-1 rounded-full mr-3 mt-1 ${
                            plan.isPopular
                              ? "text-purple-300"
                              : "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-gray-700"
                          }`}
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className={`p-1 rounded-full mr-3 mt-1 ${
                            plan.isPopular
                              ? "text-purple-300"
                              : "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-gray-700"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="red"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      )}
                      <span
                        className={
                          plan.isPopular
                            ? "text-neutral-300"
                            : "text-neutral-700 dark:text-neutral-300"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
