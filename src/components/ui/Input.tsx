import React, { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: string;
  className?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      type = "text",
      placeholder,
      error,
      className = "",
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`
          input-field
          ${
            error
              ? "border-error-500 focus:ring-error-500"
              : "border-neutral-300 focus:ring-primary-500"
          }
          ${className}
        `}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
