import * as React from "react";
import { tokens } from "@/styles/tokens";
import { text, radius, shadow } from "@/styles/theme";



type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  requiredMark?: boolean;
};

const fieldHeight = 48;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, requiredMark, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined;

    return (
      <div className="wc-input">
        {label && (
          <label className="label" htmlFor={inputId}>
            <span>{label}</span>
            {requiredMark && <span className="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div className={`control ${error ? "has-error" : ""}`}>
          {leftIcon && <span className="icon left">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            {...props}
          />
          {rightIcon && <span className="icon right">{rightIcon}</span>}
        </div>
        {error ? (
          <div className="message error" id={`${inputId}-error`}>{error}</div>
        ) : helperText ? (
          <div className="message help" id={`${inputId}-help`}>{helperText}</div>
        ) : null}

        <style jsx>{`
          .wc-input { display: grid; gap: 8px; }
          .label {
            ${Object.entries(text("body-sm")).map(([k,v]) => `${k}:${v};`).join("")}
            color: ${tokens.colors.gray[700]};
            display: inline-flex; align-items: center; gap: 6px;
          }
          .req { color: ${tokens.colors.danger}; }

          .control {
            position: relative;
          }
          .control input {
            ${Object.entries(text("body-md")).map(([k,v]) => `${k}:${v};`).join("")}
            height: ${fieldHeight}px;
            width: 100%;
            padding: 0 12px;
            padding-left: ${leftIcon ? 40 : 12}px;
            padding-right: ${rightIcon ? 40 : 12}px;
            border-radius: ${radius("md")};
            border: 1px solid ${tokens.colors.border};
            background: #fff;
            color: ${tokens.colors.gray[800]};
            box-shadow: ${shadow("sm")};
            transition: box-shadow .15s ease, border-color .15s ease;
          }
          .control input::placeholder { color: ${tokens.colors.gray[400]}; }
          .control input:focus { outline: none; border-color: ${tokens.colors.primary}; box-shadow: 0 0 0 3px rgba(77,49,236,.18); }
          .control.has-error input { border-color: ${tokens.colors.danger}; box-shadow: 0 0 0 3px rgba(239,68,68,.12); }

          .icon {
            position: absolute; top: 0; bottom: 0; display: inline-flex; align-items: center;
            color: ${tokens.colors.gray[500]};
          }
          .icon.left { left: 12px; }
          .icon.right { right: 12px; }

          .message {
            ${Object.entries(text("body-sm")).map(([k,v]) => `${k}:${v};`).join("")}
          }
          .message.help { color: ${tokens.colors.gray[500]}; }
          .message.error { color: ${tokens.colors.danger}; }
        `}</style>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
